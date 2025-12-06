from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import models

from core.mixins import TimestampedModel
from core.validators import positive_int_validator

class Order(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Beklemede"
        ONAY = "ONAY", "Hazırlanıyor"
        COMPLETED = "COMPLETED", "Tamamlandı"
        RED = "RED", "Reddedildi"
        IPTAL = "IPTAL", "İptal Edildi"

    class DeliveryType(models.TextChoices):
        CUSTOMER_PICKUP = "customer_pickup", "Müşteri Alacak"
        SELLER_DELIVERY = "seller_delivery", "Satıcı Getirecek"

    class PaymentMethod(models.TextChoices):
        CASH_ON_DELIVERY = "cash_on_delivery", "Teslim Anında Ödeme"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders"
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="seller_orders"
    )
    dorm = models.ForeignKey("dorms.Dorm", on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True)
    payment_method = models.CharField(max_length=50, choices=PaymentMethod.choices, default=PaymentMethod.CASH_ON_DELIVERY)
    delivery_type = models.CharField(max_length=50, choices=DeliveryType.choices, default=DeliveryType.CUSTOMER_PICKUP)
    delivery_address = models.TextField(blank=True, help_text="Oda numarası, blok bilgisi")
    delivery_phone = models.CharField(max_length=32, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Order {self.id}"

    def log_status(self, status: str, changed_by_id: int, note: str = "") -> None:
        OrderStatusLog.objects.create(order=self, status=status, changed_by_id=changed_by_id, note=note)

    def open_chat(self, message: str, sender: str) -> None:
        SellerCustomerChat.objects.create(order=self, message=message, sender=sender)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("products.Product", on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(validators=[positive_int_validator])
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)


class OrderStatusLog(TimestampedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_logs")
    status = models.CharField(max_length=20, choices=Order.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="status_changes"
    )
    note = models.TextField(blank=True)


class SellerCustomerChat(TimestampedModel):
    class Sender(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        SELLER = "seller", "Seller"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="chat_messages")
    sender = models.CharField(max_length=20, choices=Sender.choices)
    message = models.TextField()


