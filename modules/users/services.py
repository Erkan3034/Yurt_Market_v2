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
        dorm_id: int,
        role: str,
        phone: Optional[str] = None,
        iban: Optional[str] = None,
    ) -> User:
        validate_password(password)

        if self.user_repo.find_by_email(email):
            raise ValidationError("Email already registered.")

        user = self.user_repo.create(email=email, dorm_id=dorm_id, role=role)
        user.set_password(password)
        user.save()

        if role == User.Roles.SELLER:
            if not phone:
                raise ValidationError("Seller phone is required.")
            self.seller_repo.create(
                user=user,
                dorm_id=dorm_id,
                phone=phone,
                iban=iban or "",
                notification_email=email,
            )

        return user

