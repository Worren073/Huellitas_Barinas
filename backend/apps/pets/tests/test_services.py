"""Tests for PetService."""

from apps.pets.services import PetService


class TestPetService:
    def test_mark_as_in_process(self, db, pet):
        service = PetService(pet)
        result = service.mark_as_in_process()
        assert result.status == "in_process"
        assert result == pet

    def test_mark_as_adopted(self, db, pet):
        pet.status = "in_process"
        pet.save()
        service = PetService(pet)
        result = service.mark_as_adopted()
        assert result.status == "adopted"
        assert result == pet

    def test_mark_as_available(self, db, pet):
        pet.status = "in_process"
        pet.save()
        service = PetService(pet)
        result = service.mark_as_available()
        assert result.status == "available"
        assert result == pet

    def test_mark_as_not_available(self, db, pet):
        service = PetService(pet)
        result = service.mark_as_not_available()
        assert result.status == "not_available"
        assert result == pet

    def test_get_available_pets(self, db, pet):
        available = PetService.get_available_pets()
        assert pet in available

        pet.status = "adopted"
        pet.save()
        available = PetService.get_available_pets()
        assert pet not in available
