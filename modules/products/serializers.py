from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    stock_quantity = serializers.IntegerField(source="stock.quantity", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "is_active",
            "is_out_of_stock",
            "stock_quantity",
            "category_id",
            "category_name",
        ]


class ProductWriteSerializer(serializers.Serializer):
    name = serializers.CharField()
    description = serializers.CharField(allow_blank=True, required=False)
    price = serializers.DecimalField(max_digits=8, decimal_places=2)
    category_id = serializers.IntegerField()
    stock_quantity = serializers.IntegerField(min_value=0)


