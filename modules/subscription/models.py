from __future__ import annotations

from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from core.mixins import TimestampedModel

class SubscriptionPlan(TimestampedModel):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    duration_days = models.PositiveIntegerField(default=30)
    max_products = models.PositiveIntegerField(default=10)

    def __str__(self) -> str:
        return self.name


class SellerSubscription(TimestampedModel):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    starts_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = self.starts_at + timedelta(days=self.plan.duration_days)
        super().save(*args, **kwargs)


class UsageTracking(TimestampedModel):
    seller = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="usage_tracking")
    product_slots = models.PositiveIntegerField(default=0)


