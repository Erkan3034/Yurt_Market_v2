from django.urls import path

from .views import (
    AdminDashboardView,
    AdminRecentOrdersView,
    AdminUsersView,
    AdminProductsView,
    AdminOrdersView,
)

urlpatterns = [
    path("dashboard", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("recent-orders", AdminRecentOrdersView.as_view(), name="admin-recent-orders"),
    path("users", AdminUsersView.as_view(), name="admin-users"),
    path("products", AdminProductsView.as_view(), name="admin-products"),
    path("orders", AdminOrdersView.as_view(), name="admin-orders"),
]

