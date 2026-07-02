"""
Pet serializers for the API.
"""

from rest_framework import serializers
from .models import Pet, PetImage


class PetImageSerializer(serializers.ModelSerializer):
    """Serializer for PetImage model."""

    class Meta:
        model = PetImage
        fields = ('id', 'image', 'is_primary', 'order', 'created_at')
        read_only_fields = ('id', 'created_at')


class PetSerializer(serializers.ModelSerializer):
    """Serializer for Pet model."""
    images = PetImageSerializer(many=True, read_only=True)
    center_name = serializers.CharField(source='center.name', read_only=True)

    class Meta:
        model = Pet
        fields = (
            'id', 'name', 'species', 'breed', 'age_months', 'size',
            'gender', 'weight_kg', 'description', 'health_status',
            'is_sterilized', 'is_vaccinated', 'status', 'center',
            'center_name', 'images', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')


class PetCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating pets."""

    class Meta:
        model = Pet
        fields = (
            'name', 'species', 'breed', 'age_months', 'size',
            'gender', 'weight_kg', 'description', 'health_status',
            'is_sterilized', 'is_vaccinated', 'center'
        )
