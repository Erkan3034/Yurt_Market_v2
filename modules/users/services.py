from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from core.exceptions import ValidationError

from .repositories import SellerProfileRepository, UserRepository

User = get_user_model()


@dataclass
class UserService:
    user_repo: UserRepository = UserRepository()
    seller_repo: SellerProfileRepository = SellerProfileRepository()

    def register_user(
        self,
        *,
        email: str,
        password: str,
        dorm_name: str,
        dorm_address: Optional[str] = "",
        role: str,
        phone: Optional[str] = None,
        iban: Optional[str] = None,
    ) -> User:
        validate_password(password)

        if self.user_repo.find_by_email(email):
            raise ValidationError("Email already registered.")

        dorm = self._get_or_create_dorm(dorm_name, dorm_address or "")
        user = self.user_repo.create(email=email, dorm=dorm, role=role)
        user.set_password(password)
        user.save()

        if role == User.Roles.SELLER:
            if not phone:
                raise ValidationError("Seller phone is required.")
            self.seller_repo.create(
                user=user,
                dorm=dorm,
                phone=phone,
                iban=iban or "",
                notification_email=email,
            )

        return user

    def _get_or_create_dorm(self, name: str, address: Optional[str] = ""):
        from modules.dorms.models import Dorm

        cleaned_name = name.strip()
        if not cleaned_name:
            raise ValidationError("Dorm name is required.")

        dorm, created = Dorm.objects.get_or_create(
            name=cleaned_name,
            defaults={
                "code": cleaned_name.lower().replace(" ", "-"),
                "address": address or "",
            },
        )
        if not created and address and not dorm.address:
            dorm.address = address
            dorm.save(update_fields=["address"])

        return dorm

