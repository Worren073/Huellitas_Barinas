from django.db import models


class Adoption(models.Model):
    """Adoption request model with status flow."""

    class Status(models.TextChoices):
        PENDING = "pending", "Solicitud Enviada"
        UNDER_REVIEW = "under_review", "En Revisión"
        APPROVED = "approved", "Aprobada"
        REJECTED = "rejected", "Rechazada"
        COMPLETED = "completed", "Adopción Completada"
        CANCELLED = "cancelled", "Cancelada"

    # Request data
    pet = models.ForeignKey(
        "pets.Pet",
        on_delete=models.CASCADE,
        related_name="adoption_requests",
        verbose_name="mascota",
    )
    applicant = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="adoption_requests",
        verbose_name="solicitante",
    )
    center = models.ForeignKey(
        "centers.Center", on_delete=models.CASCADE, related_name="adoptions", verbose_name="centro"
    )

    # Form responses
    motivation = models.TextField(verbose_name="motivación")
    experience = models.TextField(blank=True, verbose_name="experiencia con mascotas")
    home_type = models.CharField(
        max_length=50,
        choices=[("house", "Casa"), ("apartment", "Apartamento"), ("other", "Otro")],
        verbose_name="tipo de vivienda",
    )
    has_yard = models.BooleanField(default=False, verbose_name="tiene patio")
    has_other_pets = models.BooleanField(default=False, verbose_name="tiene otras mascotas")
    other_pets_details = models.TextField(blank=True, verbose_name="detalles de otras mascotas")
    family_members = models.PositiveIntegerField(default=1, verbose_name="miembros de la familia")

    # Status and review
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, verbose_name="estado"
    )
    reviewed_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_adoptions",
        verbose_name="revisado por",
    )
    review_notes = models.TextField(blank=True, verbose_name="notas de revisión")
    reviewed_at = models.DateTimeField(null=True, blank=True, verbose_name="fecha de revisión")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="fecha de completado")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="fecha de actualización")

    class Meta:
        verbose_name = "adopción"
        verbose_name_plural = "adopciones"
        ordering = ["-created_at"]
        unique_together = ["pet", "applicant"]

    def __str__(self):
        return f"Adopción {self.id}: {self.applicant.username} → {self.pet.name}"


class AdoptionTimeline(models.Model):
    """Timeline of adoption status changes."""

    adoption = models.ForeignKey(
        Adoption, on_delete=models.CASCADE, related_name="timeline", verbose_name="adopción"
    )
    old_status = models.CharField(max_length=20, verbose_name="estado anterior")
    new_status = models.CharField(max_length=20, verbose_name="estado nuevo")
    changed_by = models.ForeignKey(
        "users.User", on_delete=models.SET_NULL, null=True, verbose_name="cambiado por"
    )
    notes = models.TextField(blank=True, verbose_name="notas")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="fecha de creación")

    class Meta:
        verbose_name = "línea de tiempo de adopción"
        verbose_name_plural = "líneas de tiempo de adopciones"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.adoption.id}: {self.old_status} → {self.new_status}"
