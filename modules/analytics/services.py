from datetime import timedelta
from decimal import Decimal
from typing import Dict, List, Optional

from django.core.cache import cache
from django.db import models
from django.db.models import Count, Sum, Avg, Q
from django.utils import timezone

from .models import PopularSellerRank


class AnalyticsService:
    def generate_popular_sellers(self, dorm_id: int):
        from modules.orders.models import Order

        cutoff = timezone.now() - timedelta(days=30)
        aggregates = (
            Order.objects.filter(dorm_id=dorm_id, created_at__gte=cutoff, status=Order.Status.ONAY)
            .values("seller_id")
            .annotate(total_orders=models.Count("id"), total_amount=models.Sum("total_amount"))
            .order_by("-total_amount")
        )
        cache.delete(f"popular_sellers:{dorm_id}")
        PopularSellerRank.objects.filter(dorm_id=dorm_id).delete()
        for idx, aggregate in enumerate(aggregates, start=1):
            PopularSellerRank.objects.create(
                dorm_id=dorm_id,
                seller_id=aggregate["seller_id"],
                score=aggregate["total_amount"] or 0,
                rank=idx,
            )

    def list_popular_sellers(self, dorm_id: int):
        cache_key = f"popular_sellers:{dorm_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached
        rows = PopularSellerRank.objects.filter(dorm_id=dorm_id).values("seller_id", "score", "rank")[:10]
        data = list(rows)
        cache.set(cache_key, data, 300)
        return data

    def get_seller_dashboard_stats(
        self, seller_id: int, days: int = 30
    ) -> Dict:
        """Get dashboard statistics for a seller within a date range."""
        from modules.orders.models import Order

        now = timezone.now()
        start_date = now - timedelta(days=days)
        
        # Previous period for comparison
        prev_start_date = start_date - timedelta(days=days)
        
        # Current period orders
        current_orders = Order.objects.filter(
            seller_id=seller_id,
            status=Order.Status.ONAY,
            created_at__gte=start_date,
            created_at__lte=now,
        )
        
        # Previous period orders
        previous_orders = Order.objects.filter(
            seller_id=seller_id,
            status=Order.Status.ONAY,
            created_at__gte=prev_start_date,
            created_at__lt=start_date,
        )
        
        # Current period stats
        current_revenue = current_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        current_order_count = current_orders.count()
        current_avg_order = (
            current_orders.aggregate(avg=Avg("total_amount"))["avg"] or Decimal("0")
        )
        current_customers = current_orders.values("customer_id").distinct().count()
        
        # Previous period stats
        prev_revenue = previous_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        prev_order_count = previous_orders.count()
        prev_avg_order = (
            previous_orders.aggregate(avg=Avg("total_amount"))["avg"] or Decimal("0")
        )
        prev_customers = previous_orders.values("customer_id").distinct().count()
        
        # Calculate percentage changes
        revenue_change = (
            ((current_revenue - prev_revenue) / prev_revenue * 100)
            if prev_revenue > 0
            else (100 if current_revenue > 0 else 0)
        )
        orders_change = (
            ((current_order_count - prev_order_count) / prev_order_count * 100)
            if prev_order_count > 0
            else (100 if current_order_count > 0 else 0)
        )
        avg_order_change = (
            ((current_avg_order - prev_avg_order) / prev_avg_order * 100)
            if prev_avg_order > 0
            else (100 if current_avg_order > 0 else 0)
        )
        customers_change = (
            ((current_customers - prev_customers) / prev_customers * 100)
            if prev_customers > 0
            else (100 if current_customers > 0 else 0)
        )
        
        return {
            "total_revenue": float(current_revenue),
            "revenue_change": round(revenue_change, 1),
            "total_orders": current_order_count,
            "orders_change": round(orders_change, 1),
            "average_order_value": float(current_avg_order),
            "avg_order_change": round(avg_order_change, 1),
            "new_customers": current_customers,
            "customers_change": round(customers_change, 1),
        }

    def get_revenue_over_time(self, seller_id: int, days: int = 30) -> List[Dict]:
        """Get revenue data grouped by weeks for the specified period."""
        from modules.orders.models import Order

        now = timezone.now()
        start_date = now - timedelta(days=days)
        
        # Get all orders in the period
        orders = Order.objects.filter(
            seller_id=seller_id,
            status=Order.Status.ONAY,
            created_at__gte=start_date,
            created_at__lte=now,
        ).order_by("created_at")
        
        # Group by weeks manually
        week_data = {}
        for order in orders:
            days_since_start = (order.created_at - start_date).days
            week_num = (days_since_start // 7) + 1
            
            if week_num not in week_data:
                week_data[week_num] = Decimal("0")
            week_data[week_num] += order.total_amount
        
        # Calculate expected weeks
        if days == 30:
            expected_weeks = 4
        elif days == 7:
            expected_weeks = 1
        else:
            expected_weeks = (days // 7) + 1
        
        # Format for chart
        result = []
        for week_num in range(1, expected_weeks + 1):
            result.append({
                "week": f"Week {week_num}",
                "revenue": float(week_data.get(week_num, 0)),
            })
        
        return result

    def get_top_selling_products(self, seller_id: int, days: int = 30, limit: int = 5) -> List[Dict]:
        """Get top selling products for a seller."""
        from modules.orders.models import Order, OrderItem
        from modules.products.models import ProductImage

        now = timezone.now()
        start_date = now - timedelta(days=days)
        
        order_items = (
            OrderItem.objects.filter(
                order__seller_id=seller_id,
                order__status=Order.Status.ONAY,
                order__created_at__gte=start_date,
                order__created_at__lte=now,
            )
            .values("product_id", "product__name")
            .annotate(
                units_sold=Sum("quantity"),
                total_revenue=Sum(models.F("quantity") * models.F("unit_price")),
            )
            .order_by("-units_sold")[:limit]
        )
        
        result = []
        for item in order_items:
            product_id = item["product_id"]
            
            # Get first product image if available
            first_image = (
                ProductImage.objects.filter(product_id=product_id)
                .order_by("created_at")
                .first()
            )
            image_url = first_image.image.url if first_image and first_image.image else None
            
            result.append({
                "product_id": product_id,
                "name": item["product__name"],
                "image": image_url,
                "units_sold": item["units_sold"] or 0,
                "total_revenue": float(item["total_revenue"] or 0),
            })
        
        return result

