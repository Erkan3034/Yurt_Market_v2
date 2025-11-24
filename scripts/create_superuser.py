#!/usr/bin/env python
"""
Non-interactive superuser creation script.
Usage: python scripts/create_superuser.py
"""
import os
import sys
from pathlib import Path

# Add project root to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

import django

django.setup()

from django.contrib.auth import get_user_model
from modules.dorms.models import Dorm

User = get_user_model()


def create_superuser():
    """Create a superuser with default values."""
    email = os.environ.get("SUPERUSER_EMAIL", "admin@yurtmarket.local")
    password = os.environ.get("SUPERUSER_PASSWORD", "admin123")
    
    # Get or create a dorm for the superuser
    dorm, _ = Dorm.objects.get_or_create(
        name="Admin Dorm",
        defaults={"code": "admin-dorm", "address": "Administrative dormitory"}
    )
    
    if User.objects.filter(email=email).exists():
        print(f"Superuser with email {email} already exists.")
        user = User.objects.get(email=email)
        user.is_superuser = True
        user.is_staff = True
        user.set_password(password)
        user.save()
        print(f"Updated existing user {email} to superuser.")
    else:
        user = User.objects.create_superuser(
            email=email,
            password=password,
            dorm=dorm,
            role=User.Roles.STUDENT,
        )
        print(f"Superuser created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
        print(f"\nYou can now login at: http://127.0.0.1:8000/admin/")


if __name__ == "__main__":
    create_superuser()

