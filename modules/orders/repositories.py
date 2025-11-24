from core.repository import BaseRepository

from .models import Order


class OrderRepository(BaseRepository[Order]):
    def __init__(self) -> None:
        super().__init__(Order)

    def for_customer(self, customer_id: int):
        return self.filter(customer_id=customer_id)

    def for_seller(self, seller_id: int):
        return self.filter(seller_id=seller_id)

