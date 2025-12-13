from rest_framework import serializers

from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "created_at"]


class ProductSerializer(serializers.ModelSerializer):
    stock_quantity = serializers.IntegerField(source="stock.quantity", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    seller_id = serializers.IntegerField(source="seller.id", read_only=True)
    seller_store_is_open = serializers.SerializerMethodField()
    seller_phone = serializers.SerializerMethodField()
    seller_room = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()

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
            "seller_id",
            "seller_store_is_open",
            "seller_phone",
            "seller_room",
            "images",
            "image_url",
        ]

    def get_image_url(self, obj):
        first_image = obj.images.first()
        if first_image and first_image.image:
            return first_image.image.url
        return None

    def get_seller_store_is_open(self, obj):
        if hasattr(obj.seller, "seller_profile"):
            return obj.seller.seller_profile.store_is_open
        return True

    def get_seller_phone(self, obj):
        if hasattr(obj.seller, "seller_profile"):
            return obj.seller.seller_profile.phone
        return obj.seller.phone or ""

    def get_seller_room(self, obj):
        if obj.seller.room_number and obj.seller.block:
            return f"{obj.seller.block} Blok, {obj.seller.room_number} No"
        elif obj.seller.room_number:
            return f"{obj.seller.room_number} No"
        return ""


class ProductWriteSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    price = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    category_id = serializers.IntegerField(required=False)
    stock_quantity = serializers.IntegerField(min_value=0, required=False)
    is_active = serializers.BooleanField(required=False)


