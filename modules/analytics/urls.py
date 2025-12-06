from django.urls import path

from .views import PopularSellersView, SellerDashboardView

urlpatterns = [
    path("popular-sellers", PopularSellersView.as_view(), name="popular-sellers"),
    path("seller/dashboard", SellerDashboardView.as_view(), name="seller-dashboard"),
]

