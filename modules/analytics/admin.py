from django.contrib import admin

from .models import PopularSellerRank, SellerSalesReport


@admin.register(SellerSalesReport)
class SellerSalesReportAdmin(admin.ModelAdmin):
    list_display = ["seller", "dorm", "total_orders", "total_revenue", "created_at"]
    list_filter = ["dorm", "created_at"]
    search_fields = ["seller__email", "dorm__name"]
    raw_id_fields = ["seller", "dorm"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(PopularSellerRank)
class PopularSellerRankAdmin(admin.ModelAdmin):
    list_display = ["dorm", "seller", "score", "rank", "created_at"]
    list_filter = ["dorm", "rank", "created_at"]
    search_fields = ["seller__email", "dorm__name"]
    raw_id_fields = ["seller", "dorm"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["dorm", "rank"]

