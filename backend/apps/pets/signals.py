"""
Signals for pets app.
Handles automatic WebP conversion on image upload.
"""

from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import PetImage
from .utils import convert_to_webp


@receiver(pre_save, sender=PetImage)
def auto_convert_to_webp(sender, instance, **kwargs):
    """Convert uploaded image to WebP format automatically."""
    if instance.image and not instance.image.name.endswith(".webp"):
        instance.image = convert_to_webp(instance.image)
