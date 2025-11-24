from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .serializers import OrderCreateSerializer, OrderSerializer, OrderStatusSerializer
from .services import OrderService


class OrderViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        role = request.query_params.get("role", "customer")
        service = OrderService()
        if role == "seller":
            orders = service.list_for_seller(request.user)
        else:
            orders = service.list_for_customer(request.user)
        return Response(OrderSerializer(orders, many=True).data)

    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        order = OrderService().approve(order_id=pk, seller=request.user)
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = OrderService().reject(order_id=pk, seller=request.user, note=serializer.validated_data.get("note", ""))
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = OrderService().cancel(
            order_id=pk,
            actor=request.user,
            reason=serializer.validated_data.get("note", ""),
        )
        return Response(OrderSerializer(order).data)

