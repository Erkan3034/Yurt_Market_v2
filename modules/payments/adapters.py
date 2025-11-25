from dataclasses import dataclass
from datetime import datetime
from typing import Dict

from django.conf import settings


class PaymentError(Exception):
    """Raised when payment provider configuration is invalid."""


@dataclass
class StripeAdapter:
    api_key: str
    success_url: str
    cancel_url: str

    def create_checkout_session(self, amount: float, currency: str = "try") -> Dict:
        if not self.api_key:
            raise PaymentError("Stripe API key not configured.")
        # In real implementation, call stripe.checkout.Session.create(...)
        return {
            "provider": "stripe",
            "session_id": f"cs_test_{int(datetime.utcnow().timestamp())}",
            "amount": amount,
            "currency": currency,
            "checkout_url": self.success_url.replace("success", "checkout"),
            "success_url": self.success_url,
            "cancel_url": self.cancel_url,
        }


@dataclass
class DummyPaymentAdapter:
    success_url: str = settings.PAYMENT_SUCCESS_URL
    cancel_url: str = settings.PAYMENT_CANCEL_URL

    def create_checkout_session(self, amount: float, currency: str = "try") -> Dict:
        return {
            "provider": "dummy",
            "session_id": f"dummy_{int(datetime.utcnow().timestamp())}",
            "amount": amount,
            "currency": currency,
            "checkout_url": self.success_url.replace("success", "checkout"),
            "success_url": self.success_url,
            "cancel_url": self.cancel_url,
        }

