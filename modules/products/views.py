from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from core.exceptions import PermissionDeniedError, NotFoundError
from .models import Category, Product, ProductImage
from .serializers import ProductSerializer, ProductWriteSerializer, ProductImageSerializer
from .services import ProductService


class DormProductListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        dorm_id = request.query_params.get("dorm")
        dorm_id = dorm_id or request.user.dorm_id
        products = ProductService().list_for_dorm(int(dorm_id))
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class SellerProductViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        products = ProductService().list_for_seller(request.user)
        return Response(ProductSerializer(products, many=True).data)

    def create(self, request):
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = ProductService().create_product(
            seller=request.user,
            dorm_id=request.user.dorm_id,
            **serializer.validated_data,
        )
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        serializer = ProductWriteSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        product = ProductService().update_product(
            product_id=pk,
            seller=request.user,
            **serializer.validated_data,
        )
        return Response(ProductSerializer(product).data)

    def destroy(self, request, pk=None):
        ProductService().delete_product(product_id=pk, seller=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request, pk=None):
        """Upload an image for a product."""
        try:
            product = Product.objects.get(id=pk)
        except Product.DoesNotExist:
            raise NotFoundError("Ürün bulunamadı")
        
        if product.seller_id != request.user.id:
            raise PermissionDeniedError("Bu ürüne erişim izniniz yok")
        
        image_file = request.FILES.get("image")
        if not image_file:
            return Response({"detail": "Fotoğraf dosyası gerekli"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Delete existing images (keep only one image per product for simplicity)
        product.images.all().delete()
        
        # Create new image
        product_image = ProductImage.objects.create(product=product, image=image_file)
        
        return Response(ProductImageSerializer(product_image).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], url_path="delete_image")
    def delete_image(self, request, pk=None):
        """Delete all images for a product."""
        try:
            product = Product.objects.get(id=pk)
        except Product.DoesNotExist:
            raise NotFoundError("Ürün bulunamadı")
        
        if product.seller_id != request.user.id:
            raise PermissionDeniedError("Bu ürüne erişim izniniz yok")
        
        product.images.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """List categories for the seller's dorm."""
        dorm_id = request.user.dorm_id
        categories = Category.objects.filter(dorm_id=dorm_id).order_by("name")
        return Response([{"id": cat.id, "name": cat.name, "slug": cat.slug} for cat in categories])

