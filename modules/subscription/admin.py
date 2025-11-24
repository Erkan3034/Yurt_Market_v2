from django.contrib import admin

from .models import SellerSubscription, SubscriptionPlan, UsageTracking


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ["name", "price", "duration_days", "max_products", "created_at"]
    search_fields = ["name"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(SellerSubscription)
class SellerSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["seller", "plan", "starts_at", "expires_at", "is_active", "created_at"]
    list_filter = ["is_active", "plan", "starts_at", "expires_at"]
    search_fields = ["seller__email", "plan__name"]
    raw_id_fields = ["seller", "plan"]
    readonly_fields = ["created_at", "updated_at"]
    date_hierarchy = "starts_at"


@admin.register(UsageTracking)
class UsageTrackingAdmin(admin.ModelAdmin):
    list_display = ["seller", "product_slots", "created_at", "updated_at"]
    search_fields = ["seller__email"]
    raw_id_fields = ["seller"]
    readonly_fields = ["created_at", "updated_at"]

