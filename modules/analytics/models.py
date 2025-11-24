from django.conf import settings
from django.db import models

from core.mixins import TimestampedModel


class SellerSalesReport(TimestampedModel):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sales_reports")
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.CASCADE)
    total_orders = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0)


class PopularSellerRank(TimestampedModel):
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.CASCADE, related_name="popular_sellers")
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    rank = models.PositiveIntegerField(default=0)

