"""
Center serializers for the API.
"""

from rest_framework import serializers
from .models import Center


class CenterSerializer(serializers.ModelSerializer):
    """Serializer for Center model."""
    current_capacity = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    pets_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Center
        fields = (
            'id', 'name', 'description', 'address', 'state', 'phone', 'email',
            'logo', 'cover_image', 'status', 'latitude', 'longitude',
            'max_capacity', 'current_capacity', 'is_full', 'pets_count',
            'created_by', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')


class CenterCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating centers."""

    class Meta:
        model = Center
        fields = (
            'id', 'name', 'description', 'address', 'state', 'phone', 'email',
            'logo', 'cover_image', 'latitude', 'longitude', 'max_capacity'
        )
        read_only_fields = ('id',)
