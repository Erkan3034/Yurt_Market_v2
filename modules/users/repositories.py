from core.repository import BaseRepository

from .models import SellerProfile, User


class UserRepository(BaseRepository[User]):
    def __init__(self) -> None:
        super().__init__(User)

    def find_by_email(self, email: str):
        return self.model.objects.filter(email=email).first()

    def sellers_in_dorm(self, dorm_id: int):
        return self.model.objects.filter(role=User.Roles.SELLER, dorm_id=dorm_id)


class SellerProfileRepository(BaseRepository[SellerProfile]):
    def __init__(self) -> None:
        super().__init__(SellerProfile)

