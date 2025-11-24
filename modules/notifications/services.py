from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail

from core.events import BaseEvent

User = get_user_model()


class SMTPNotificationService:
    """Handles order notifications via SMTP."""

    def handle_order_created(self, event: BaseEvent) -> None:
        seller_id = event.payload.get("seller_id")
        if not seller_id:
            return

        seller = (
            User.objects.select_related("seller_profile")
            .filter(id=seller_id)
            .first()
        )
        if not seller:
            return
        recipient = getattr(seller.seller_profile, "notification_email", None) or seller.email
        subject = "Yeni siparişiniz var"
        body = f"Sipariş #{event.payload.get('order_id')} oluşturuldu."
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [recipient], fail_silently=True)

