from rest_framework import serializers


class SubscriptionStartSerializer(serializers.Serializer):
    plan_id = serializers.IntegerField()

