from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model for Huellitas Barinas."""

    class Role(models.TextChoices):
        SUPERADMIN = 'superadmin', 'Super Administrador'
        CENTER_ADMIN = 'center_admin', 'Administrador de Centro'
        VOLUNTEER = 'voluntario', 'Voluntario'
        ADOPTER = 'adoptante', 'Adoptante'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ADOPTER,
        verbose_name='rol'
    )
    phone = models.CharField(max_length=20, blank=True, verbose_name='teléfono')
    address = models.TextField(blank=True, verbose_name='dirección')
    avatar = models.ImageField(
        upload_to='avatars/',
        blank=True,
        null=True,
        verbose_name='avatar'
    )
    is_verified = models.BooleanField(default=False, verbose_name='verificado')
    center = models.ForeignKey(
        'centers.Center',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='members',
        verbose_name='centro'
    )

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'
        ordering = ['-date_joined']

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
