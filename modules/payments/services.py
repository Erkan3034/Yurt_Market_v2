from dataclasses import dataclass
from typing import Literal

from django.conf import settings

from .adapters import DummyPaymentAdapter, StripeAdapter


@dataclass
class PaymentService:
    provider: Literal["stripe", "dummy"] = "dummy"

    def _adapter(self):
        if self.provider == "stripe":
            return StripeAdapter(api_key=getattr(settings, "STRIPE_SECRET_KEY", ""))
        return DummyPaymentAdapter()

    def create_checkout(self, amount: float):
        return self._adapter().create_checkout_session(amount=amount)

