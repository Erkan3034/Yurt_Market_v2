from django.urls import path

from .views import DormListView

urlpatterns = [
    path("", DormListView.as_view(), name="dorm-list"),
]

