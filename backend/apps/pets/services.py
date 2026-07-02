"""
Pet services (Presenter layer).
Handles business logic for pet operations.
"""

from django.core.exceptions import ValidationError
from .models import Pet


class PetService:
    """Service class for pet operations."""

    @staticmethod
    def create_pet(**kwargs):
        """Create a new pet."""
        pet = Pet(**kwargs)
        pet.full_clean()
        pet.save()
        return pet

    @staticmethod
    def update_pet(pet, **kwargs):
        """Update pet with validation."""
        for key, value in kwargs.items():
            setattr(pet, key, value)
        pet.full_clean()
        pet.save()
        return pet

    @staticmethod
    def mark_as_adopted(pet):
        """Mark a pet as adopted."""
        pet.status = Pet.Status.ADOPTED
        pet.save()
        return pet

    @staticmethod
    def mark_as_in_process(pet):
        """Mark a pet as in adoption process."""
        pet.status = Pet.Status.IN_PROCESS
        pet.save()
        return pet

    @staticmethod
    def mark_as_available(pet):
        """Mark a pet as available for adoption."""
        pet.status = Pet.Status.AVAILABLE
        pet.save()
        return pet

    @staticmethod
    def mark_as_not_available(pet):
        """Mark a pet as not available."""
        pet.status = Pet.Status.NOT_AVAILABLE
        pet.save()
        return pet

    @staticmethod
    def get_pets_by_center(center):
        """Get all pets for a specific center."""
        return Pet.objects.filter(center=center)

    @staticmethod
    def get_available_pets():
        """Get all available pets."""
        return Pet.objects.filter(status=Pet.Status.AVAILABLE)
