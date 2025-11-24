from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import List

from django.contrib.auth import get_user_model
from django.db import transaction

from core.events import OrderCreatedEvent, event_dispatcher
from core.exceptions import PermissionDeniedError, ValidationError

from .models import Order, OrderItem
from .repositories import OrderRepository

User = get_user_model()


@dataclass
class OrderItemDTO:
    product_id: int
    quantity: int


@dataclass
class OrderService:
    order_repo: OrderRepository = OrderRepository()
    dispatcher = event_dispatcher

    def _load_products(self, product_ids: List[int]):
        from modules.products.models import Product

        return Product.objects.filter(id__in=product_ids).select_related("stock", "seller", "dorm")

    def create_order(
        self,
        *,
        customer: User,
        items: List[OrderItemDTO],
        notes: str = "",
    ) -> Order:
        if not items:
            raise ValidationError("Order requires at least one item.")

        product_ids = {dto.product_id for dto in items}
        products = self._load_products(list(product_ids))
        product_map = {product.id: product for product in products}
        if len(product_map) != len(product_ids):
            raise ValidationError("Some products are invalid.")

        first_product = next(iter(product_map.values()))
        seller = first_product.seller
        dorm = first_product.dorm

        if customer.dorm_id != dorm.id:
            raise ValidationError("Students can only order from their dorm.")

        for product in product_map.values():
            if product.seller_id != seller.id:
                raise ValidationError("All items must belong to the same seller.")

        total = Decimal("0.00")
        with transaction.atomic():
            order = self.order_repo.create(customer=customer, seller=seller, dorm=dorm, notes=notes)
            bulk_items = []
            for dto in items:
                product = product_map[dto.product_id]
                product.stock.decrease(dto.quantity)
                line_total = product.price * dto.quantity
                total += line_total
                bulk_items.append(
                    OrderItem(order=order, product=product, quantity=dto.quantity, unit_price=product.price)
                )
            OrderItem.objects.bulk_create(bulk_items)
            order.total_amount = total
            order.save(update_fields=["total_amount"])
            order.log_status(Order.Status.PENDING, customer.id)

        self.dispatcher.dispatch(
            OrderCreatedEvent(payload={"order_id": order.id, "seller_id": seller.id, "customer_id": customer.id})
        )
        return order

    def _change_status(self, *, order: Order, actor: User, status: str, note: str = "") -> Order:
        if actor.id not in (order.customer_id, order.seller_id):
            raise PermissionDeniedError("You cannot change this order.")
        order.status = status
        order.save(update_fields=["status"])
        order.log_status(status, actor.id, note)
        return order

    def approve(self, order_id: int, seller: User) -> Order:
        order = self.order_repo.get(id=order_id, seller=seller)
        return self._change_status(order=order, actor=seller, status=Order.Status.ONAY)

    def reject(self, order_id: int, seller: User, note: str = "") -> Order:
        order = self.order_repo.get(id=order_id, seller=seller)
        return self._change_status(order=order, actor=seller, status=Order.Status.RED, note=note)

    def cancel(self, order_id: int, actor: User, reason: str = "") -> Order:
        order = self.order_repo.get(id=order_id)
        order = self._change_status(order=order, actor=actor, status=Order.Status.IPTAL, note=reason)
        order.open_chat(message=reason or "Sipariş iptal edildi.", sender="seller")
        return order

    def list_for_customer(self, customer: User):
        return self.order_repo.for_customer(customer.id).select_related("seller")

    def list_for_seller(self, seller: User):
        return self.order_repo.for_seller(seller.id).select_related("customer")

