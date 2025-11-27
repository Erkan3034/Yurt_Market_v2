from django.contrib.auth import get_user_model
from rest_framework import serializers

from .services import UserService

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "role", "dorm_id", "date_joined"]


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    dorm_name = serializers.CharField()
    dorm_address = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.Roles.choices)
    phone = serializers.CharField(required=False, allow_blank=True)
    iban = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        service = UserService()
        return service.register_user(**validated_data)

