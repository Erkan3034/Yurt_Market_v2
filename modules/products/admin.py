from django.contrib import admin

from .models import Category, Product, ProductImage, Stock


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class StockInline(admin.StackedInline):
    model = Stock
    can_delete = False
    verbose_name_plural = "Stock"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "dorm", "slug", "created_at"]
    list_filter = ["dorm"]
    search_fields = ["name", "slug"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["name", "seller", "dorm", "category", "price", "stock_quantity", "is_active", "is_out_of_stock"]
    list_filter = ["dorm", "category", "is_active", "is_out_of_stock"]
    search_fields = ["name", "description", "seller__email"]
    raw_id_fields = ["seller", "dorm", "category"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [ProductImageInline, StockInline]

    def stock_quantity(self, obj):
        return obj.stock_quantity

    stock_quantity.short_description = "Stock"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ["product", "image", "created_at"]
    list_filter = ["created_at"]
    raw_id_fields = ["product"]


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ["product", "quantity", "created_at", "updated_at"]
    list_filter = ["created_at"]
    search_fields = ["product__name"]
    raw_id_fields = ["product"]
    readonly_fields = ["created_at", "updated_at"]

