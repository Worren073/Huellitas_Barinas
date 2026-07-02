from django.db import models


class Pet(models.Model):
    """Pet model."""

    class Species(models.TextChoices):
        DOG = 'dog', 'Perro'
        CAT = 'cat', 'Gato'
        OTHER = 'other', 'Otro'

    class Status(models.TextChoices):
        AVAILABLE = 'available', 'Disponible'
        ADOPTED = 'adopted', 'Adoptada'
        IN_PROCESS = 'in_process', 'En Proceso de Adopción'
        NOT_AVAILABLE = 'not_available', 'No Disponible'

    class Size(models.TextChoices):
        SMALL = 'small', 'Pequeño'
        MEDIUM = 'medium', 'Mediano'
        LARGE = 'large', 'Grande'

    name = models.CharField(max_length=100, verbose_name='nombre')
    species = models.CharField(
        max_length=20,
        choices=Species.choices,
        verbose_name='especie'
    )
    breed = models.CharField(max_length=100, blank=True, verbose_name='raza')
    age_months = models.PositiveIntegerField(verbose_name='edad en meses')
    size = models.CharField(
        max_length=20,
        choices=Size.choices,
        verbose_name='tamaño'
    )
    gender = models.CharField(
        max_length=10,
        choices=[('M', 'Macho'), ('F', 'Hembra')],
        verbose_name='género'
    )
    weight_kg = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name='peso en kg'
    )
    description = models.TextField(verbose_name='descripción')
    health_status = models.TextField(blank=True, verbose_name='estado de salud')
    is_sterilized = models.BooleanField(default=False, verbose_name='esterilizado')
    is_vaccinated = models.BooleanField(default=False, verbose_name='vacunado')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.AVAILABLE,
        verbose_name='estado'
    )
    center = models.ForeignKey(
        'centers.Center',
        on_delete=models.CASCADE,
        related_name='pets',
        verbose_name='centro'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')

    class Meta:
        verbose_name = 'mascota'
        verbose_name_plural = 'mascotas'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_species_display()})"


class PetImage(models.Model):
    """Pet image model."""
    pet = models.ForeignKey(
        Pet,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name='mascota'
    )
    image = models.ImageField(upload_to='pets/images/', verbose_name='imagen')
    is_primary = models.BooleanField(default=False, verbose_name='imagen principal')
    order = models.PositiveIntegerField(default=0, verbose_name='orden')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')

    class Meta:
        verbose_name = 'imagen de mascota'
        verbose_name_plural = 'imágenes de mascotas'
        ordering = ['order']

    def __str__(self):
        return f"Imagen de {self.pet.name}"
