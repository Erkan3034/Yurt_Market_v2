"""Utility script to seed base data for local development."""

import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
django.setup()

from modules.dorms.models import Dorm  # noqa: E402
from modules.subscription.models import SubscriptionPlan  # noqa: E402


def run() -> None:
    Dorm.objects.get_or_create(name="Yurt A", defaults={"code": "yurt-a"})
    Dorm.objects.get_or_create(name="Yurt B", defaults={"code": "yurt-b"})
    SubscriptionPlan.objects.get_or_create(
        name="Standard", defaults={"price": 199.0, "duration_days": 30, "max_products": 25}
    )
    print("Seed data created.")


if __name__ == "__main__":
    run()

