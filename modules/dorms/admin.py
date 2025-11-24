from django.contrib import admin

from .models import Dorm


@admin.register(Dorm)
class DormAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "address", "created_at"]
    search_fields = ["name", "code", "address"]
    readonly_fields = ["created_at", "updated_at"]

