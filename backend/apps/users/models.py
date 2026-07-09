from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone

phone_validator = RegexValidator(
    r'^\+?[\d\s\-()]{7,20}$', 'Número de teléfono inválido'
)


class User(AbstractUser):
    """Custom user model for Huellitas Barinas."""

    class Role(models.TextChoices):
        SUPERADMIN = "superadmin", "Super Administrador"
        CENTER_ADMIN = "center_admin", "Administrador de Centro"
        VOLUNTEER = "voluntario", "Voluntario"
        ADOPTER = "adoptante", "Adoptante"

    class Country(models.TextChoices):
        VENEZUELA = "VE", "Venezuela (+58)"
        COLOMBIA = "CO", "Colombia (+57)"
        ECUADOR = "EC", "Ecuador (+593)"
        PERU = "PE", "Perú (+51)"
        CHILE = "CL", "Chile (+56)"
        ARGENTINA = "AR", "Argentina (+54)"
        BRAZIL = "BR", "Brasil (+55)"
        MEXICO = "MX", "México (+52)"
        SPAIN = "ES", "España (+34)"
        USA = "US", "Estados Unidos (+1)"

    email = models.EmailField(
        unique=True,
        verbose_name="correo electrónico",
        error_messages={
            "unique": "Ya existe un usuario con este correo electrónico.",
        },
    )

    role = models.CharField(
        max_length=20, choices=Role.choices, default=Role.ADOPTER, verbose_name="rol"
    )

    country = models.CharField(
        max_length=2, choices=Country.choices, default=Country.VENEZUELA, verbose_name="país"
    )

    phone = models.CharField(max_length=20, blank=True, validators=[phone_validator], verbose_name="teléfono")
    address = models.TextField(blank=True, verbose_name="dirección")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True, verbose_name="avatar")
    is_verified = models.BooleanField(default=False, verbose_name="verificado")
    center = models.ForeignKey(
        "centers.Center",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
        verbose_name="centro",
    )

    deletion_requested_at = models.DateTimeField(
        null=True, blank=True, verbose_name="fecha de solicitud de eliminación"
    )

    failed_login_attempts = models.IntegerField(default=0, verbose_name="intentos fallidos")
    locked_until = models.DateTimeField(null=True, blank=True, verbose_name="bloqueado hasta")

    @property
    def is_locked(self):
        if self.locked_until and timezone.now() < self.locked_until:
            return True
        if self.locked_until and timezone.now() >= self.locked_until:
            self.failed_login_attempts = 0
            self.locked_until = None
            self.save(update_fields=["failed_login_attempts", "locked_until"])
        return False

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"

    @property
    def is_center_admin(self):
        return self.role == self.Role.CENTER_ADMIN

    @property
    def is_volunteer(self):
        return self.role == self.Role.VOLUNTEER

    @property
    def is_adopter(self):
        return self.role == self.Role.ADOPTER

    @property
    def phone_with_country(self):
        """Returns phone number with country prefix"""
        country_code = dict(self.Country.choices).get(self.country, "")
        if self.phone:
            # Extract prefix from country_code string like "Venezuela (+58)"
            prefix = country_code.split("(")[1].rstrip(")") if "(" in country_code else ""
            return f"{prefix}{self.phone}"
        return None
