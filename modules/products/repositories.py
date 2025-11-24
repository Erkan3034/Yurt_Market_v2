from django.db.models import Count, QuerySet

from core.repository import BaseRepository

from .models import Category, Product, Stock


class ProductRepository(BaseRepository[Product]):
    def __init__(self) -> None:
        super().__init__(Product)

    def find_by_dorm(self, dorm_id: int) -> QuerySet[Product]:
        return self.filter(dorm_id=dorm_id, is_active=True)

    def find_by_seller(self, seller_id: int) -> QuerySet[Product]:
        return self.filter(seller_id=seller_id)

    def count_active_by_seller(self, seller_id: int) -> int:
        return self.filter(seller_id=seller_id, is_active=True).count()

    def annotate_with_stock(self) -> QuerySet[Product]:
        return self.model.objects.select_related("stock")


class CategoryRepository(BaseRepository[Category]):
    def __init__(self) -> None:
        super().__init__(Category)


class StockRepository(BaseRepository[Stock]):
    def __init__(self) -> None:
        super().__init__(Stock)

