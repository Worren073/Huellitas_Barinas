"""Tests for Adoption model."""

import pytest
from django.db import IntegrityError

from apps.adoptions.models import Adoption, AdoptionTimeline


class TestAdoptionModel:
    def test_create_adoption(self, db, adoption):
        assert adoption.status == "pending"
        assert adoption.pet.name == "Firulais"

    def test_adoption_str(self, db, adoption):
        assert str(adoption).startswith("Adopción")

    def test_unique_pet_applicant(self, db, adoption):
        with pytest.raises(IntegrityError):
            Adoption.objects.create(
                pet=adoption.pet,
                applicant=adoption.applicant,
                center=adoption.center,
                motivation="Duplicate",
                experience="Si",
                home_type="house",
            )

    def test_timeline_entry(self, db, adoption, superadmin):
        timeline = AdoptionTimeline.objects.create(
            adoption=adoption,
            old_status="pending",
            new_status="under_review",
            changed_by=superadmin,
            notes="Inicio revision",
        )
        assert timeline.old_status == "pending"
        assert timeline.new_status == "under_review"
