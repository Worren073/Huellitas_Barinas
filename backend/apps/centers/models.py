from django.db import models


VENEZUELAN_STATES = [
    ('Amazonas', 'Amazonas'),
    ('Anzoátegui', 'Anzoátegui'),
    ('Apure', 'Apure'),
    ('Aragua', 'Aragua'),
    ('Barinas', 'Barinas'),
    ('Bolívar', 'Bolívar'),
    ('Carabobo', 'Carabobo'),
    ('Cojedes', 'Cojedes'),
    ('Delta Amacuro', 'Delta Amacuro'),
    ('Distrito Capital', 'Distrito Capital'),
    ('Falcón', 'Falcón'),
    ('Guárico', 'Guárico'),
    ('Lara', 'Lara'),
    ('Mérida', 'Mérida'),
    ('Miranda', 'Miranda'),
    ('Monagas', 'Monagas'),
    ('Nueva Esparta', 'Nueva Esparta'),
    ('Portuguesa', 'Portuguesa'),
    ('Sucre', 'Sucre'),
    ('Táchira', 'Táchira'),
    ('Trujillo', 'Trujillo'),
    ('La Guaira', 'La Guaira'),
    ('Yaracuy', 'Yaracuy'),
    ('Zulia', 'Zulia'),
]


class Center(models.Model):
    """Adoption center model."""

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Activo'
        INACTIVE = 'inactive', 'Inactivo'
        PENDING = 'pending', 'Pendiente de Verificación'

    name = models.CharField(max_length=200, verbose_name='nombre')
    description = models.TextField(verbose_name='descripción')
    address = models.TextField(blank=True, verbose_name='dirección')
    state = models.CharField(
        max_length=100,
        choices=VENEZUELAN_STATES,
        default='Barinas',
        verbose_name='estado'
    )
    phone = models.CharField(max_length=20, verbose_name='teléfono')
    email = models.EmailField(verbose_name='correo electrónico')
    logo = models.ImageField(
        upload_to='centers/logos/',
        blank=True,
        null=True,
        verbose_name='logo'
    )
    cover_image = models.ImageField(
        upload_to='centers/covers/',
        blank=True,
        null=True,
        verbose_name='imagen de portada'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name='estado'
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name='latitud'
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        verbose_name='longitud'
    )
    max_capacity = models.PositiveIntegerField(
        default=50,
        verbose_name='capacidad máxima'
    )
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_centers',
        verbose_name='creado por'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')

    class Meta:
        verbose_name = 'centro'
        verbose_name_plural = 'centros'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def current_capacity(self):
        return self.pets.filter(status='available').count()

    @property
    def is_full(self):
        return self.current_capacity >= self.max_capacity
