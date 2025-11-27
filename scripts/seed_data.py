"""Utility script to seed base data for local development."""

import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
django.setup()

from modules.dorms.models import Dorm  # noqa: E402
from modules.subscription.models import SubscriptionPlan  # noqa: E402


def run() -> None:
    dorms = [
        ("Yıldız Kız Öğrenci Yurdu", "yildiz-kiz", "Atatürk Cd. No:10, İstanbul"),
        ("Marmara Erkek Öğrenci Yurdu", "marmara-erkek", "Marmara Mah. 123. Sk., İstanbul"),
        ("Papatya Kız Yurdu", "papatya", "Bahçeşehir Mah. 45. Sk., İstanbul"),
        ("Güneş Erkek Öğrenci Evi", "gunes-erkek", "Çiçek Sk. No:12, Ankara"),
        ("Deniz Koleji Yurdu", "deniz-koleji", "Sahil Cad. No:5, İzmir"),
        ("Kartal Kız Yurdu", "kartal-kiz", "Kartal Mah. No:24, Kocaeli"),
        ("Vadi Erkek Yurdu", "vadi-erkek", "Vadi Mah. 1. Cadde, Bursa"),
        ("Koza Kız Yurdu", "koza-kiz", "Konak Mah. 7. Sk., Antalya"),
        ("Bahar Öğrenci Rezidansı", "bahar-rezidans", "Bahar Mh. 9. Sk., Eskişehir"),
        ("Ege Erkek Öğrenci Yurdu", "ege-erkek", "Ege Cd. No:18, İzmir"),
    ]

    for name, code, address in dorms:
        Dorm.objects.get_or_create(name=name, defaults={"code": code, "address": address})

    SubscriptionPlan.objects.get_or_create(
        name="Standard", defaults={"price": 199.0, "duration_days": 30, "max_products": 25}
    )
    print("Seed data created (dorms + subscription plan).")


if __name__ == "__main__":
    run()

