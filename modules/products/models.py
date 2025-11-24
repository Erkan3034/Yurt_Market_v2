from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models, transaction

from core.events import (
    ProductOutOfStockEvent,
    StockDecreasedEvent,
    event_dispatcher,
)
from core.mixins import TimestampedModel

class Category(TimestampedModel):
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120)

    class Meta:
        unique_together = ("dorm", "slug")
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Product(TimestampedModel):
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.CASCADE, related_name="products")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(Decimal("0.5"))])
    is_active = models.BooleanField(default=True)
    is_out_of_stock = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name

    @property
    def stock_quantity(self) -> int:
        return getattr(self.stock, "quantity", 0)


class ProductImage(TimestampedModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")


class Stock(TimestampedModel):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name="stock")
    quantity = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = "Stock"

    def decrease(self, amount: int) -> None:
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        with transaction.atomic():
            self.refresh_from_db()
            if self.quantity < amount:
                raise ValueError("Insufficient stock.")
            self.quantity -= amount
            self.save(update_fields=["quantity"])
            event_dispatcher.dispatch(
                StockDecreasedEvent(payload={"product_id": self.product_id, "quantity": self.quantity})
            )
            if self.quantity == 0:
                self.product.is_out_of_stock = True
                self.product.is_active = False
                self.product.save(update_fields=["is_out_of_stock", "is_active"])
                event_dispatcher.dispatch(
                    ProductOutOfStockEvent(payload={"product_id": self.product_id})
                )

