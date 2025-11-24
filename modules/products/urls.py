from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DormProductListView, SellerProductViewSet

router = DefaultRouter(trailing_slash=False)
router.register("seller/products", SellerProductViewSet, basename="seller-products")

urlpatterns = [
    path("", DormProductListView.as_view(), name="products-list"),
    path("", include(router.urls)),
]

