from dataclasses import dataclass
from typing import Literal

from django.conf import settings

from .adapters import DummyPaymentAdapter, PaymentError, StripeAdapter


@dataclass
class PaymentService:
    provider: Literal["stripe", "dummy"] = "dummy"

    def _adapter(self):
        if self.provider == "stripe":
            return StripeAdapter(
                api_key=getattr(settings, "STRIPE_SECRET_KEY", ""),
                success_url=settings.PAYMENT_SUCCESS_URL,
                cancel_url=settings.PAYMENT_CANCEL_URL,
            )
        return DummyPaymentAdapter(
            success_url=settings.PAYMENT_SUCCESS_URL,
            cancel_url=settings.PAYMENT_CANCEL_URL,
        )

    def create_checkout(self, amount: float):
        adapter = self._adapter()
        try:
            return adapter.create_checkout_session(amount=amount)
        except PaymentError as exc:
            raise PaymentError(f"Payment provider misconfigured: {exc}") from exc

