from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from modules.orders.models import Order
from modules.users.models import User
from modules.products.models import Product
from modules.subscription.models import SellerSubscription


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get admin dashboard statistics."""
        # Check if user is admin (is_staff or is_superuser)
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        now = timezone.now()
        last_month = now - timedelta(days=30)
        last_hour = now - timedelta(hours=1)

        # Total Revenue (all time)
        total_revenue = Order.objects.filter(status=Order.Status.COMPLETED).aggregate(
            total=Sum("total_amount")
        )["total"] or 0

        # Revenue last month
        revenue_last_month = Order.objects.filter(
            status=Order.Status.COMPLETED, created_at__gte=last_month
        ).aggregate(total=Sum("total_amount"))["total"] or 0

        # Revenue previous month (for comparison)
        prev_month_start = last_month - timedelta(days=30)
        revenue_prev_month = Order.objects.filter(
            status=Order.Status.COMPLETED,
            created_at__gte=prev_month_start,
            created_at__lt=last_month,
        ).aggregate(total=Sum("total_amount"))["total"] or 0

        revenue_change = (
            ((revenue_last_month - revenue_prev_month) / revenue_prev_month * 100)
            if revenue_prev_month > 0
            else (100 if revenue_last_month > 0 else 0)
        )

        # Subscriptions
        total_subscriptions = SellerSubscription.objects.filter(is_active=True).count()
        subscriptions_last_month = SellerSubscription.objects.filter(
            created_at__gte=last_month, is_active=True
        ).count()
        subscriptions_prev_month = SellerSubscription.objects.filter(
            created_at__gte=prev_month_start,
            created_at__lt=last_month,
            is_active=True,
        ).count()

        subscriptions_change = (
            ((subscriptions_last_month - subscriptions_prev_month) / subscriptions_prev_month * 100)
            if subscriptions_prev_month > 0
            else (100 if subscriptions_last_month > 0 else 0)
        )

        # Sales (completed orders)
        total_sales = Order.objects.filter(status=Order.Status.COMPLETED).count()
        sales_last_month = Order.objects.filter(
            status=Order.Status.COMPLETED, created_at__gte=last_month
        ).count()
        sales_prev_month = Order.objects.filter(
            status=Order.Status.COMPLETED,
            created_at__gte=prev_month_start,
            created_at__lt=last_month,
        ).count()

        sales_change = (
            ((sales_last_month - sales_prev_month) / sales_prev_month * 100)
            if sales_prev_month > 0
            else (100 if sales_last_month > 0 else 0)
        )

        # Active Now (users active in last hour)
        active_users = User.objects.filter(last_login__gte=last_hour).count()
        active_users_prev_hour = User.objects.filter(
            last_login__gte=last_hour - timedelta(hours=1),
            last_login__lt=last_hour,
        ).count()
        active_users_change = active_users - active_users_prev_hour

        return Response(
            {
                "total_revenue": float(total_revenue),
                "revenue_change": round(revenue_change, 1),
                "revenue_last_month": float(revenue_last_month),
                "subscriptions": total_subscriptions,
                "subscriptions_change": round(subscriptions_change, 1),
                "subscriptions_last_month": subscriptions_last_month,
                "sales": total_sales,
                "sales_change": round(sales_change, 1),
                "sales_last_month": sales_last_month,
                "active_now": active_users,
                "active_now_change": active_users_change,
            }
        )


class AdminRecentOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get recent orders for admin dashboard."""
        # Check if user is admin
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({"detail": "Admin access required."}, status=status.HTTP_403_FORBIDDEN)

        limit = int(request.query_params.get("limit", 10))
        orders = (
            Order.objects.select_related("customer", "seller")
            .order_by("-created_at")[:limit]
        )

        orders_data = []
        for order in orders:
            status_label = {
                Order.Status.PENDING: "Pending",
                Order.Status.ONAY: "Fulfilled",
                Order.Status.COMPLETED: "Fulfilled",
                Order.Status.RED: "Declined",
                Order.Status.IPTAL: "Declined",
            }.get(order.status, order.status)

            status_class = {
                Order.Status.PENDING: "bg-yellow-100 text-yellow-700",
                Order.Status.ONAY: "bg-green-100 text-green-700",
                Order.Status.COMPLETED: "bg-green-100 text-green-700",
                Order.Status.RED: "bg-red-100 text-red-700",
                Order.Status.IPTAL: "bg-red-100 text-red-700",
            }.get(order.status, "bg-slate-100 text-slate-700")

            order_type = "Sale"  # Default, could be extended

            orders_data.append(
                {
                    "id": order.id,
                    "customer": order.customer.email.split("@")[0] if order.customer.email else "N/A",
                    "type": order_type,
                    "status": order.status,
                    "status_label": status_label,
                    "status_class": status_class,
                    "date": order.created_at.strftime("%Y-%m-%d"),
                    "amount": float(order.total_amount),
                }
            )

        return Response(orders_data)


def check_admin_permission(user):
    """Helper function to check if user is admin."""
    if not (user.is_staff or user.is_superuser):
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Admin access required.")


class AdminUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List all users for admin."""
        check_admin_permission(request.user)
        
        users = User.objects.select_related("dorm").order_by("-date_joined")
        
        from modules.users.serializers import UserSerializer
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class AdminProductsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List all products for admin."""
        check_admin_permission(request.user)
        
        products = Product.objects.select_related("seller", "category", "dorm", "stock").order_by("-created_at")
        
        from modules.products.serializers import ProductSerializer
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class AdminOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List all orders for admin."""
        check_admin_permission(request.user)
        
        orders = Order.objects.select_related("customer", "seller", "dorm").prefetch_related("items").order_by("-created_at")
        
        from modules.orders.serializers import OrderSerializer
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

