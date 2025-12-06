from django.apps import AppConfig


class AdminConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "modules.admin"
    label = "yurt_market_admin"  # Unique label to avoid conflict with django.contrib.admin

