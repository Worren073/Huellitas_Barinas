from rest_framework import serializers
from .models import HelpRequest


class HelpRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpRequest
        fields = (
            'id', 'request_type', 'first_name', 'last_name', 'email',
            'phone', 'state', 'description', 'is_read', 'created_at'
        )
        read_only_fields = ('id', 'is_read', 'created_at')


class HelpRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HelpRequest
        fields = (
            'request_type', 'first_name', 'last_name', 'email',
            'phone', 'state', 'description'
        )
