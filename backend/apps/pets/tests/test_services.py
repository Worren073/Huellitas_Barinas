"""Tests for PetService."""
import pytest
from apps.pets.services import PetService
from apps.pets.models import Pet


class TestPetService:
    def test_mark_as_in_process(self, db, pet):
        result = PetService.mark_as_in_process(pet)
        assert result.status == 'in_process'

    def test_mark_as_adopted(self, db, pet):
        pet.status = 'in_process'
        pet.save()
        result = PetService.mark_as_adopted(pet)
        assert result.status == 'adopted'

    def test_mark_as_available(self, db, pet):
        pet.status = 'in_process'
        pet.save()
        result = PetService.mark_as_available(pet)
        assert result.status == 'available'

    def test_mark_as_not_available(self, db, pet):
        result = PetService.mark_as_not_available(pet)
        assert result.status == 'not_available'

    def test_get_available_pets(self, db, pet):
        available = PetService.get_available_pets()
        assert pet in available

        pet.status = 'adopted'
        pet.save()
        available = PetService.get_available_pets()
        assert pet not in available
