from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from core.events import SubscriptionActivatedEvent, event_dispatcher
from core.exceptions import ValidationError
from core.utils.logging import get_logger

from .repositories import (
    SubscriptionPlanRepository,
    SubscriptionRepository,
    UsageTrackingRepository,
)

User = get_user_model()
logger = get_logger(__name__)


@dataclass
class SubscriptionService:
    subscription_repo: SubscriptionRepository = SubscriptionRepository()
    plan_repo: SubscriptionPlanRepository = SubscriptionPlanRepository()
    usage_repo: UsageTrackingRepository = UsageTrackingRepository()

    def has_active_subscription(self, seller_id: int) -> bool:
        return bool(self.subscription_repo.active_for_seller(seller_id))

    def get_plan(self, plan_id: int):
        return self.plan_repo.get(id=plan_id)

    def get_status(self, seller_id: int):
        subscription = self.subscription_repo.active_for_seller(seller_id)
        usage = self.usage_repo.first(seller_id=seller_id)
        return {
            "has_active": bool(subscription),
            "expires_at": getattr(subscription, "expires_at", None),
            "plan": getattr(subscription, "plan_id", None),
            "product_slots": getattr(usage, "product_slots", 0),
        }

    def start_subscription(self, *, seller: User, plan_id: int):
        plan = self.plan_repo.get(id=plan_id)
        subscription = self.subscription_repo.create(
            seller=seller,
            plan=plan,
            expires_at=timezone.now() + timedelta(days=plan.duration_days),
        )
        self.usage_repo.update_or_create(
            seller=seller,
            defaults={"product_slots": plan.max_products},
        )
        event_dispatcher.dispatch(
            SubscriptionActivatedEvent(payload={"seller_id": seller.id, "plan_id": plan.id})
        )
        logger.info(
            "subscription.activated",
            seller_id=seller.id,
            plan_id=plan.id,
            subscription_id=subscription.id,
            expires_at=str(subscription.expires_at),
        )
        return subscription

    def update_usage(self, seller: User, product_count: int) -> None:
        tracker = self.usage_repo.first(seller=seller)
        if not tracker:
            tracker = self.usage_repo.create(seller=seller, product_slots=product_count)
        else:
            tracker.product_slots = product_count
            tracker.save(update_fields=["product_slots"])
        logger.info("subscription.usage_updated", seller_id=seller.id, product_count=product_count)

