"""Tests for Pet model."""
import pytest
from apps.pets.models import Pet


class TestPetModel:
    def test_create_pet(self, db, center_admin):
        _, center = center_admin
        pet = Pet.objects.create(
            name='Firulais', species='dog', breed='Labrador',
            age_months=24, gender='M', size='medium',
            description='Test pet', status='available',
            center=center
        )
        assert pet.name == 'Firulais'
        assert pet.status == 'available'
        assert str(pet) == 'Firulais (Perro)'

    def test_pet_str(self, db, pet):
        assert pet.name in str(pet)

    def test_default_status(self, db, center_admin):
        _, center = center_admin
        pet = Pet.objects.create(
            name='Mimi', species='cat', age_months=12,
            gender='F', size='small', description='Test cat',
            center=center
        )
        assert pet.status == 'available'
