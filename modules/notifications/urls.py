from django.urls import path

from .views import NotificationConfigView

urlpatterns = [
    path("config", NotificationConfigView.as_view(), name="notification-config"),
]

