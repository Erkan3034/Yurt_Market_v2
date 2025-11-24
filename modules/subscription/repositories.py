from django.utils import timezone

from core.repository import BaseRepository

from .models import SellerSubscription, SubscriptionPlan, UsageTracking


class SubscriptionRepository(BaseRepository[SellerSubscription]):
    def __init__(self) -> None:
        super().__init__(SellerSubscription)

    def active_for_seller(self, seller_id: int):
        now = timezone.now()
        return self.filter(seller_id=seller_id, is_active=True, expires_at__gte=now).first()


class SubscriptionPlanRepository(BaseRepository[SubscriptionPlan]):
    def __init__(self) -> None:
        super().__init__(SubscriptionPlan)


class UsageTrackingRepository(BaseRepository[UsageTracking]):
    def __init__(self) -> None:
        super().__init__(UsageTracking)

