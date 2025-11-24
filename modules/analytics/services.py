from datetime import timedelta

from django.core.cache import cache
from django.db import models
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

