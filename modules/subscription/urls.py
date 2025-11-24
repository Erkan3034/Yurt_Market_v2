from django.urls import path

from .views import SubscriptionStartView, SubscriptionStatusView

urlpatterns = [
    path("status", SubscriptionStatusView.as_view(), name="subscription-status"),
    path("start", SubscriptionStartView.as_view(), name="subscription-start"),
]

