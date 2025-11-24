from __future__ import annotations

from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

from core.mixins import TimestampedModel


class CustomUserManager(UserManager):
    """Custom user manager where email is the unique identifier."""

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular user with the given email and password."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and save a superuser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser, TimestampedModel):
    class Roles(models.TextChoices):
        STUDENT = "student", _("Student")
        SELLER = "seller", _("Seller")

    username = None
    email = models.EmailField(unique=True)
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.PROTECT, related_name="users")
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.STUDENT)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["email"]

    def __str__(self) -> str:
        return self.email


class SellerProfile(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seller_profile")
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.PROTECT, related_name="sellers")
    phone = models.CharField(max_length=32)
    iban = models.CharField(max_length=34, blank=True)
    notification_email = models.EmailField(blank=True)

    class Meta:
        verbose_name = _("Seller Profile")
        verbose_name_plural = _("Seller Profiles")

    def __str__(self) -> str:
        return f"SellerProfile<{self.user_id}>"

