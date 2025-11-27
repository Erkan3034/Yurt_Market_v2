from rest_framework import serializers

from .models import Dorm


class DormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dorm
        fields = ["id", "name", "code", "address"]

