"""
Adoption serializers for the API.
"""

from rest_framework import serializers
from .models import Adoption, AdoptionTimeline


class AdoptionTimelineSerializer(serializers.ModelSerializer):
    """Serializer for AdoptionTimeline model."""
    changed_by_name = serializers.CharField(source='changed_by.get_full_name', read_only=True)

    class Meta:
        model = AdoptionTimeline
        fields = (
            'id', 'old_status', 'new_status', 'changed_by',
            'changed_by_name', 'notes', 'created_at'
        )
        read_only_fields = ('id', 'created_at')


class AdoptionSerializer(serializers.ModelSerializer):
    """Serializer for Adoption model."""
    pet_name = serializers.CharField(source='pet.name', read_only=True)
    applicant_name = serializers.CharField(source='applicant.get_full_name', read_only=True)
    center_name = serializers.CharField(source='center.name', read_only=True)
    timeline = AdoptionTimelineSerializer(many=True, read_only=True)

    class Meta:
        model = Adoption
        fields = (
            'id', 'pet', 'pet_name', 'applicant', 'applicant_name',
            'center', 'center_name', 'motivation', 'experience',
            'home_type', 'has_yard', 'has_other_pets', 'other_pets_details',
            'family_members', 'status', 'reviewed_by', 'review_notes',
            'reviewed_at', 'completed_at', 'timeline', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'status', 'reviewed_by', 'review_notes',
            'reviewed_at', 'completed_at', 'created_at', 'updated_at'
        )


class AdoptionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating adoption requests."""

    class Meta:
        model = Adoption
        fields = (
            'pet', 'center', 'motivation', 'experience',
            'home_type', 'has_yard', 'has_other_pets',
            'other_pets_details', 'family_members'
        )
