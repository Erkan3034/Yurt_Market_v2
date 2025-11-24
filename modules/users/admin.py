from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import SellerProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "role", "dorm", "is_staff", "is_active", "date_joined"]
    list_filter = ["role", "is_staff", "is_active", "dorm"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["email"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
        ("Yurt Market", {"fields": ("role", "dorm")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2", "role", "dorm"),
            },
        ),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "dorm", "phone", "notification_email"]
    list_filter = ["dorm"]
    search_fields = ["user__email", "phone", "notification_email"]
    raw_id_fields = ["user"]

