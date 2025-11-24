from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from django.contrib.auth import get_user_model

from core.exceptions import PermissionDeniedError, ValidationError

from .models import Product
from .repositories import ProductRepository, StockRepository

User = get_user_model()


@dataclass
class ProductService:
    product_repo: ProductRepository = ProductRepository()
    stock_repo: StockRepository = StockRepository()
    max_free_products: int = 3

    def _ensure_product_owner(self, product: Product, seller: User) -> None:
        if product.seller_id != seller.id:
            raise PermissionDeniedError("You can only manage your own products.")

    def _subscription_service(self):
        from modules.subscription.services import SubscriptionService

        return SubscriptionService()

    def create_product(
        self,
        *,
        seller: User,
        dorm_id: int,
        category_id: int,
        name: str,
        description: str,
        price,
        stock_quantity: int,
    ) -> Product:
        active_count = self.product_repo.count_active_by_seller(seller.id)
        if active_count >= self.max_free_products and not self._subscription_service().has_active_subscription(
            seller.id
        ):
            raise ValidationError("Seller must subscribe to add more products.")

        product = self.product_repo.create(
            seller=seller,
            dorm_id=dorm_id,
            category_id=category_id,
            name=name,
            description=description,
            price=price,
        )
        self.stock_repo.create(product=product, quantity=stock_quantity)
        return product

    def update_product(self, *, product_id: int, seller: User, **data) -> Product:
        product = self.product_repo.get(id=product_id)
        self._ensure_product_owner(product, seller)

        stock_quantity: Optional[int] = data.pop("stock_quantity", None)
        self.product_repo.update(product, **data)
        if stock_quantity is not None and product.stock:
            product.stock.quantity = stock_quantity
            product.stock.save(update_fields=["quantity"])
        return product

    def delete_product(self, *, product_id: int, seller: User) -> None:
        product = self.product_repo.get(id=product_id)
        self._ensure_product_owner(product, seller)
        self.product_repo.delete(product)

    def list_for_dorm(self, dorm_id: int):
        return self.product_repo.find_by_dorm(dorm_id).select_related("stock", "category")

    def list_for_seller(self, seller: User):
        return self.product_repo.find_by_seller(seller.id).select_related("stock", "category")

