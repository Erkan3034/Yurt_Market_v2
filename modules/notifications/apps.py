from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    name = "modules.notifications"

    def ready(self):
        from core.events import event_dispatcher
        from core.events.types import OrderCreatedEvent

        from .services import SMTPNotificationService

        service = SMTPNotificationService()
        event_dispatcher.subscribe("order_created", service.handle_order_created)

