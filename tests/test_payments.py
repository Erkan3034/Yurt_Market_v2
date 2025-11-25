import pytest
from django.conf import settings
from django.test import override_settings

from modules.payments.services import PaymentService


def test_dummy_payment_checkout():
    service = PaymentService(provider="dummy")
    result = service.create_checkout(amount=99.5)
    assert result["provider"] == "dummy"
    assert result["amount"] == 99.5
    assert "session_id" in result


@override_settings(STRIPE_SECRET_KEY="sk_test_123")
def test_stripe_payment_checkout():
    service = PaymentService(provider="stripe")
    result = service.create_checkout(amount=10.0)
    assert result["provider"] == "stripe"
    assert result["success_url"] == settings.PAYMENT_SUCCESS_URL

