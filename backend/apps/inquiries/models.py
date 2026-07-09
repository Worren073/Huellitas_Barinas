from django.db import models

from apps.centers.models import VENEZUELAN_STATES


class HelpRequest(models.Model):
    class RequestType(models.TextChoices):
        VOLUNTEER = "volunteer", "Voluntariado"
        BECOME_CENTER = "become_center", "Convertirse en Centro"

    request_type = models.CharField(
        max_length=20, choices=RequestType.choices, verbose_name="tipo de solicitud"
    )
    center_name = models.CharField(max_length=200, blank=True, verbose_name="nombre del centro")
    first_name = models.CharField(max_length=100, verbose_name="nombre")
    last_name = models.CharField(max_length=100, verbose_name="apellido")
    email = models.EmailField(verbose_name="correo electrónico")
    phone = models.CharField(max_length=20, blank=True, verbose_name="teléfono")
    state = models.CharField(
        max_length=100, choices=VENEZUELAN_STATES, blank=True, verbose_name="estado"
    )
    description = models.TextField(blank=True, verbose_name="descripción")
    is_read = models.BooleanField(default=False, verbose_name="leída")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="fecha de creación")

    class Meta:
        verbose_name = "solicitud de ayuda"
        verbose_name_plural = "solicitudes de ayuda"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_request_type_display()} - {self.first_name} {self.last_name}"
