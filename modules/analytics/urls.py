from django.urls import path

from .views import PopularSellersView

urlpatterns = [
    path("popular-sellers", PopularSellersView.as_view(), name="popular-sellers"),
]

