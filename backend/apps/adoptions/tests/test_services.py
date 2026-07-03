"""Tests for AdoptionService state machine."""

import pytest
from django.core.exceptions import ValidationError

from apps.adoptions.models import Adoption
from apps.adoptions.services import AdoptionService


class TestAdoptionService:
    def test_submit_sets_pending(self, db, adopter, pet, center_admin):
        _, center = center_admin
        adoption = Adoption.objects.create(
            pet=pet,
            applicant=adopter,
            center=center,
            motivation="Test",
            experience="Si",
            home_type="house",
            family_members=2,
            status="pending",
        )
        service = AdoptionService(adoption)
        result = service.submit()
        assert result.status == "pending"

    def test_submit_rejects_unavailable_pet(self, db, adopter, pet, center_admin):
        _, center = center_admin
        pet.status = "adopted"
        pet.save()
        adoption = Adoption.objects.create(
            pet=pet,
            applicant=adopter,
            center=center,
            motivation="Test",
            experience="Si",
            home_type="house",
            family_members=2,
            status="pending",
        )
        service = AdoptionService(adoption)
        with pytest.raises(ValidationError, match="no está disponible"):
            service.submit()

    def test_valid_transition(self, db, adoption, superadmin):
        service = AdoptionService(adoption)
        service.start_review(reviewed_by=superadmin)
        assert adoption.status == "under_review"

    def test_invalid_transition(self, db, adoption, superadmin):
        service = AdoptionService(adoption)
        with pytest.raises(ValidationError):
            service.approve(approved_by=superadmin)

    def test_full_approve_flow(self, db, adoption, superadmin):
        service = AdoptionService(adoption)
        service.start_review(reviewed_by=superadmin)
        assert adoption.status == "under_review"

        service.approve(approved_by=superadmin)
        assert adoption.status == "approved"
        adoption.pet.refresh_from_db()
        assert adoption.pet.status == "in_process"

    def test_complete_adoption(self, db, adoption, superadmin):
        service = AdoptionService(adoption)
        service.start_review(reviewed_by=superadmin)
        service.approve(approved_by=superadmin)
        service.complete(completed_by=superadmin)

        assert adoption.status == "completed"
        assert adoption.completed_at is not None
        adoption.pet.refresh_from_db()
        assert adoption.pet.status == "adopted"

    def test_reject_requires_reason(self, db, adoption, superadmin):
        service = AdoptionService(adoption)
        service.start_review(reviewed_by=superadmin)

        with pytest.raises(ValidationError, match="motivo de rechazo"):
            service.reject(rejected_by=superadmin, reason="")

    def test_cancel_restores_pet(self, db, adoption, superadmin):
        service = AdoptionService(adoption)
        service.start_review(reviewed_by=superadmin)
        service.approve(approved_by=superadmin)
        assert adoption.pet.status == "in_process"

        service.cancel(cancelled_by=superadmin)
        assert adoption.status == "cancelled"
        adoption.pet.refresh_from_db()
        assert adoption.pet.status == "available"

    def test_timeline_created_on_transition(self, db, adoption, superadmin):
        assert adoption.timeline.count() == 0
        service = AdoptionService(adoption)
        service.start_review(reviewed_by=superadmin)
        assert adoption.timeline.count() == 1

        entry = adoption.timeline.first()
        assert entry.old_status == "pending"
        assert entry.new_status == "under_review"
