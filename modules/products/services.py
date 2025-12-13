from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from django.contrib.auth import get_user_model
from django.db.models import ProtectedError

from core.exceptions import PermissionDeniedError, ValidationError
from core.utils.logging import get_logger

from .models import Product
from .repositories import ProductRepository, StockRepository

User = get_user_model()
logger = get_logger(__name__)


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

    def _sync_usage_slots(self, seller: User) -> None:
        """Update subscription usage tracking with current active product count."""
        subscription_service = self._subscription_service()
        product_count = self.product_repo.count_active_by_seller(seller.id)
        subscription_service.update_usage(seller=seller, product_count=product_count)

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
        self._sync_usage_slots(seller)
        logger.info(
            "product.created",
            product_id=product.id,
            seller_id=seller.id,
            dorm_id=dorm_id,
            category_id=category_id,
        )
        return product

    def update_product(self, *, product_id: int, seller: User, **data) -> Product:
        product = self.product_repo.get(id=product_id)
        self._ensure_product_owner(product, seller)

        stock_quantity: Optional[int] = data.pop("stock_quantity", None)
        updated_field_names = set(data.keys())
        self.product_repo.update(product, **data)
        if stock_quantity is not None and product.stock:
            product.stock.quantity = stock_quantity
            product.stock.save(update_fields=["quantity"])
            updated_field_names.add("stock_quantity")
        if "is_active" in updated_field_names:
            self._sync_usage_slots(seller)
        logger.info(
            "product.updated",
            product_id=product.id,
            seller_id=seller.id,
            updated_fields=list(updated_field_names),
        )
        return product

    def delete_product(self, *, product_id: int, seller: User) -> None:
        product = self.product_repo.get(id=product_id)
        self._ensure_product_owner(product, seller)
        try:
            self.product_repo.delete(product)
        except ProtectedError:
            raise ValidationError(
                "Bu ürün mevcut siparişlerde kullanıldığı için silinemez. "
                "Ürünü pasif yaparak gizleyebilirsiniz."
            )
        self._sync_usage_slots(seller)
        logger.info("product.deleted", product_id=product_id, seller_id=seller.id)

    def list_for_dorm(self, dorm_id: int):
        return self.product_repo.find_by_dorm(dorm_id).select_related("stock", "category", "seller", "seller__seller_profile").prefetch_related("images")

    def list_for_seller(self, seller: User):
        return self.product_repo.find_by_seller(seller.id).select_related("stock", "category").prefetch_related("images")

