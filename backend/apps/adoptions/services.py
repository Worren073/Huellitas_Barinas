"""
Adoption services (Presenter layer).
Handles business logic for adoption operations with state machine.
"""

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import Adoption, AdoptionTimeline
from .notifications import notify_approved, notify_completed, notify_rejected, notify_submitted


class AdoptionService:
    """Service class for adoption operations."""

    VALID_TRANSITIONS = {
        "pending": ["under_review", "cancelled"],
        "under_review": ["approved", "rejected"],
        "approved": ["completed", "cancelled"],
        "rejected": [],
        "completed": [],
        "cancelled": [],
    }

    def __init__(self, adoption):
        self.adoption = adoption

    def submit(self):
        """Submit an adoption request with full validation."""
        with transaction.atomic():
            if self.adoption.status != "pending":
                raise ValidationError("La solicitud ya fue enviada")

            if self.adoption.pet.status != "available":
                raise ValidationError("Esta mascota no está disponible para adopción")

            existing = (
                Adoption.objects.filter(
                    pet=self.adoption.pet,
                    applicant=self.adoption.applicant,
                    status__in=["pending", "under_review"],
                )
                .exclude(pk=self.adoption.pk)
                .exists()
            )

            if existing:
                raise ValidationError("Ya tienes una solicitud activa para esta mascota")

            self.adoption.save()
            self._add_timeline("pending", "pending", notes="Solicitud creada")
        notify_submitted(self.adoption)
        return self.adoption

    def start_review(self, reviewed_by):
        """Start reviewing an adoption request."""
        self._transition_to("under_review", reviewed_by, "Revisión iniciada")

    def approve(self, approved_by, notes=""):
        """Approve an adoption request."""
        with transaction.atomic():
            if self.adoption.center.is_full:
                raise ValidationError("El centro ha alcanzado su capacidad máxima")
            self._transition_to("approved", approved_by, notes or "Solicitud aprobada")

            # Mark pet as in process
            self.adoption.pet.status = "in_process"
            self.adoption.pet.save()
        notify_approved(self.adoption)

    def reject(self, rejected_by, reason=""):
        """Reject an adoption request."""
        if not reason:
            raise ValidationError("Debe proporcionar un motivo de rechazo")
        self._transition_to("rejected", rejected_by, f"Rechazada: {reason}")
        notify_rejected(self.adoption, reason)

    def complete(self, completed_by):
        """Mark adoption as completed."""
        with transaction.atomic():
            self._transition_to("completed", completed_by, "Adopción completada")

            # Update pet status
            self.adoption.pet.status = "adopted"
            self.adoption.pet.save()

            self.adoption.completed_at = timezone.now()
            self.adoption.save()
        notify_completed(self.adoption)

    def cancel(self, cancelled_by, reason=""):
        """Cancel an adoption request."""
        with transaction.atomic():
            self._transition_to("cancelled", cancelled_by, reason or "Solicitud cancelada")

            # If pet was in process, make it available again
            if self.adoption.pet.status == "in_process":
                self.adoption.pet.status = "available"
                self.adoption.pet.save()

    def get_timeline(self):
        """Get adoption timeline."""
        return self.adoption.timeline.all().order_by("created_at")

    def _transition_to(self, new_status, changed_by, notes=""):
        """Execute status transition with validation."""
        old_status = self.adoption.status

        if new_status not in self.VALID_TRANSITIONS.get(old_status, []):
            raise ValidationError(f"No se puede cambiar de '{old_status}' a '{new_status}'")

        self.adoption.status = new_status
        self.adoption.reviewed_by = changed_by
        self.adoption.reviewed_at = timezone.now()
        self.adoption.review_notes = notes
        self.adoption.save()

        self._add_timeline(old_status, new_status, changed_by, notes)

    def _add_timeline(self, old_status, new_status, changed_by=None, notes=""):
        """Add entry to adoption timeline."""
        AdoptionTimeline.objects.create(
            adoption=self.adoption,
            old_status=old_status,
            new_status=new_status,
            changed_by=changed_by,
            notes=notes,
        )
