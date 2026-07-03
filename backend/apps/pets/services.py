"""
Pet services (Presenter layer).
Handles business logic for pet operations.
"""

from .models import Pet


class PetService:
    """Service class for pet operations.

    Usage:
        PetService(pet).mark_as_adopted()
        PetService.get_available_pets()  # classmethod
    """

    def __init__(self, pet):
        self.pet = pet

    def update_pet(self, **kwargs):
        """Update pet with validation."""
        for key, value in kwargs.items():
            setattr(self.pet, key, value)
        self.pet.full_clean()
        self.pet.save()
        return self.pet

    def mark_as_adopted(self):
        """Mark a pet as adopted."""
        self.pet.status = Pet.Status.ADOPTED
        self.pet.save()
        return self.pet

    def mark_as_in_process(self):
        """Mark a pet as in adoption process."""
        self.pet.status = Pet.Status.IN_PROCESS
        self.pet.save()
        return self.pet

    def mark_as_available(self):
        """Mark a pet as available for adoption."""
        self.pet.status = Pet.Status.AVAILABLE
        self.pet.save()
        return self.pet

    def mark_as_not_available(self):
        """Mark a pet as not available."""
        self.pet.status = Pet.Status.NOT_AVAILABLE
        self.pet.save()
        return self.pet

    @classmethod
    def create_pet(cls, **kwargs):
        """Create a new pet."""
        pet = Pet(**kwargs)
        pet.full_clean()
        pet.save()
        return cls(pet)

    @classmethod
    def get_pets_by_center(cls, center):
        """Get all pets for a specific center."""
        return Pet.objects.filter(center=center)

    @classmethod
    def get_available_pets(cls):
        """Get all available pets."""
        return Pet.objects.filter(status=Pet.Status.AVAILABLE)
