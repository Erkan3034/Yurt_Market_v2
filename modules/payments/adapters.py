from dataclasses import dataclass


class PaymentError(Exception):
    pass


@dataclass
class StripeAdapter:
    api_key: str

    def create_checkout_session(self, amount: float, currency: str = "try"):
        return {"provider": "stripe", "amount": amount, "currency": currency, "session_id": "test"}


@dataclass
class DummyPaymentAdapter:
    def create_checkout_session(self, amount: float, currency: str = "try"):
        return {"provider": "dummy", "amount": amount, "currency": currency, "session_id": "dummy"}

