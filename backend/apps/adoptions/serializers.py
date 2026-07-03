"""
Adoption serializers for the API.
"""

from django.db import IntegrityError
from rest_framework import serializers

from apps.pets.serializers import PetSerializer

from .models import Adoption, AdoptionTimeline


class AdoptionTimelineSerializer(serializers.ModelSerializer):
    """Serializer for AdoptionTimeline model."""

    changed_by_name = serializers.CharField(source="changed_by.get_full_name", read_only=True)

    class Meta:
        model = AdoptionTimeline
        fields = (
            "id",
            "old_status",
            "new_status",
            "changed_by",
            "changed_by_name",
            "notes",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class AdoptionSerializer(serializers.ModelSerializer):
    """Serializer for Adoption model."""

    pet = PetSerializer(read_only=True)
    pet_name = serializers.CharField(source="pet.name", read_only=True)
    applicant_name = serializers.CharField(source="applicant.get_full_name", read_only=True)
    center_name = serializers.CharField(source="center.name", read_only=True)
    timeline = AdoptionTimelineSerializer(many=True, read_only=True)

    class Meta:
        model = Adoption
        fields = (
            "id",
            "pet",
            "pet_name",
            "applicant",
            "applicant_name",
            "center",
            "center_name",
            "motivation",
            "experience",
            "home_type",
            "has_yard",
            "has_other_pets",
            "other_pets_details",
            "family_members",
            "status",
            "reviewed_by",
            "review_notes",
            "reviewed_at",
            "completed_at",
            "timeline",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "status",
            "reviewed_by",
            "review_notes",
            "reviewed_at",
            "completed_at",
            "created_at",
            "updated_at",
        )


class AdoptionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating adoption requests."""

    class Meta:
        model = Adoption
        fields = (
            "id",
            "pet",
            "center",
            "motivation",
            "experience",
            "home_type",
            "has_yard",
            "has_other_pets",
            "other_pets_details",
            "family_members",
            "status",
        )
        read_only_fields = ("id", "status")

    def create(self, validated_data):
        """Create adoption with duplicate check."""
        applicant = self.context["request"].user
        pet = validated_data.get("pet")

        # Check if adoption already exists for this pet and applicant
        if Adoption.objects.filter(pet=pet, applicant=applicant).exists():
            raise serializers.ValidationError(
                {"non_field_errors": "Ya tienes una solicitud de adopción para esta mascota."}
            )

        try:
            return super().create(validated_data)
        except IntegrityError:
            raise serializers.ValidationError(
                {"non_field_errors": "Ya tienes una solicitud de adopción para esta mascota."}
            )
