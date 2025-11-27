from rest_framework import generics, permissions

from .models import Dorm
from .serializers import DormSerializer


class DormListView(generics.ListAPIView):
    """Public endpoint to list available dorms for registration."""

    queryset = Dorm.objects.all().order_by("name")
    serializer_class = DormSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

