from rest_framework import serializers

from .models import Order, OrderItem
from .services import OrderItemDTO, OrderService


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product_id", "product_name", "quantity", "unit_price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "total_amount",
            "notes",
            "created_at",
            "seller_id",
            "customer_id",
            "items",
        ]


class OrderCreateItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderCreateItemSerializer(many=True)

    def create(self, validated_data):
        service = OrderService()
        dto_items = [OrderItemDTO(**item) for item in validated_data["items"]]
        return service.create_order(customer=self.context["request"].user, items=dto_items, notes=validated_data.get("notes", ""))


class OrderStatusSerializer(serializers.Serializer):
    note = serializers.CharField(required=False, allow_blank=True)

