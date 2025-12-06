from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import List

from django.contrib.auth import get_user_model
from django.db import transaction

from core.events import OrderCreatedEvent, event_dispatcher
from core.exceptions import PermissionDeniedError, ValidationError
from core.utils.logging import get_logger

from .models import Order, OrderItem
from .repositories import OrderRepository

User = get_user_model()
logger = get_logger(__name__)


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
        payment_method: str = "cash_on_delivery",
        delivery_type: str = "customer_pickup",
        delivery_address: str = "",
        delivery_phone: str = "",
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

        if not customer.dorm_id:
            raise ValidationError("Kullanıcının yurt bilgisi bulunamadı.")
        
        if customer.dorm_id != dorm.id:
            raise ValidationError("Students can only order from their dorm.")

        for product in product_map.values():
            if product.seller_id != seller.id:
                raise ValidationError("All items must belong to the same seller.")

        # Ensure stock exists for all products
        from modules.products.models import Stock
        for product in product_map.values():
            if not hasattr(product, "stock") or product.stock is None:
                stock, _ = Stock.objects.get_or_create(product=product, defaults={"quantity": 0})
                product.stock = stock

        # Check if seller's store is open
        if hasattr(seller, "seller_profile") and not seller.seller_profile.store_is_open:
            raise ValidationError("Mağaza şu anda kapalı. Lütfen daha sonra tekrar deneyin.")

        total = Decimal("0.00")
        with transaction.atomic():
            order = self.order_repo.create(
                customer=customer,
                seller=seller,
                dorm=dorm,
                notes=notes,
                payment_method=payment_method,
                delivery_type=delivery_type,
                delivery_address=delivery_address,
                delivery_phone=delivery_phone,
            )
            bulk_items = []
            for dto in items:
                product = product_map[dto.product_id]
                # Reload stock to ensure we have the latest quantity
                product.stock.refresh_from_db()
                
                try:
                    product.stock.decrease(dto.quantity)
                except ValueError as e:
                    raise ValidationError(f"Stok hatası: {str(e)}")
                except AttributeError:
                    raise ValidationError(f"Ürün '{product.name}' için stok bilgisi bulunamadı.")
                
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
        logger.info(
            "order.created",
            order_id=order.id,
            seller_id=seller.id,
            customer_id=customer.id,
            total_amount=str(total),
        )
        return order

    def _change_status(self, *, order: Order, actor: User, status: str, note: str = "") -> Order:
        if actor.id not in (order.customer_id, order.seller_id):
            raise PermissionDeniedError("You cannot change this order.")
        order.status = status
        order.save(update_fields=["status"])
        order.log_status(status, actor.id, note)
        logger.info("order.status_changed", order_id=order.id, status=status, actor_id=actor.id)
        return order

    def approve(self, order_id: int, seller: User) -> Order:
        order = self.order_repo.get(id=order_id, seller=seller)
        order = self._change_status(order=order, actor=seller, status=Order.Status.ONAY)
        self._trigger_analytics_refresh(order.dorm_id)
        return order

    def reject(self, order_id: int, seller: User, note: str = "") -> Order:
        order = self.order_repo.get(id=order_id, seller=seller)
        return self._change_status(order=order, actor=seller, status=Order.Status.RED, note=note)

    def cancel(self, order_id: int, actor: User, reason: str = "") -> Order:
        order = self.order_repo.get(id=order_id)
        order = self._change_status(order=order, actor=actor, status=Order.Status.IPTAL, note=reason)
        order.open_chat(message=reason or "Sipariş iptal edildi.", sender="seller")
        return order

    def complete(self, order_id: int, seller: User) -> Order:
        """Mark order as completed (delivered) by seller."""
        order = self.order_repo.get(id=order_id, seller=seller)
        if order.status != Order.Status.ONAY:
            raise ValidationError("Sadece hazırlanıyor durumundaki siparişler tamamlanabilir.")
        order = self._change_status(order=order, actor=seller, status=Order.Status.COMPLETED)
        self._trigger_analytics_refresh(order.dorm_id)
        return order

    def list_for_customer(self, customer: User):
        return self.order_repo.for_customer(customer.id).select_related("seller")

    def list_for_seller(self, seller: User):
        return self.order_repo.for_seller(seller.id).select_related("customer")

    def _trigger_analytics_refresh(self, dorm_id: int) -> None:
        try:
            from modules.analytics.tasks import refresh_popular_sellers

            refresh_popular_sellers.delay(dorm_id)
        except Exception:
            from modules.analytics.services import AnalyticsService

            AnalyticsService().generate_popular_sellers(dorm_id)

