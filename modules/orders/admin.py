from django.contrib import admin

from .models import Order, OrderItem, OrderStatusLog, SellerCustomerChat


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["unit_price"]
    raw_id_fields = ["product"]


class OrderStatusLogInline(admin.TabularInline):
    model = OrderStatusLog
    extra = 0
    readonly_fields = ["created_at", "changed_by"]
    can_delete = False


class SellerCustomerChatInline(admin.TabularInline):
    model = SellerCustomerChat
    extra = 0
    readonly_fields = ["created_at"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "customer", "seller", "dorm", "status", "total_amount", "created_at"]
    list_filter = ["status", "dorm", "created_at"]
    search_fields = ["customer__email", "seller__email", "id"]
    raw_id_fields = ["customer", "seller", "dorm"]
    readonly_fields = ["created_at", "updated_at", "total_amount"]
    inlines = [OrderItemInline, OrderStatusLogInline, SellerCustomerChatInline]
    date_hierarchy = "created_at"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["order", "product", "quantity", "unit_price"]
    list_filter = ["order__status", "order__created_at"]
    search_fields = ["order__id", "product__name"]
    raw_id_fields = ["order", "product"]


@admin.register(OrderStatusLog)
class OrderStatusLogAdmin(admin.ModelAdmin):
    list_display = ["order", "status", "changed_by", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["order__id", "changed_by__email"]
    raw_id_fields = ["order", "changed_by"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(SellerCustomerChat)
class SellerCustomerChatAdmin(admin.ModelAdmin):
    list_display = ["order", "sender", "message", "created_at"]
    list_filter = ["sender", "created_at"]
    search_fields = ["order__id", "message"]
    raw_id_fields = ["order"]
    readonly_fields = ["created_at", "updated_at"]

