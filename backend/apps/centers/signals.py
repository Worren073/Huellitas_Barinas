from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import Center
from apps.pets.utils import convert_to_webp


@receiver(pre_save, sender=Center)
def auto_convert_center_images(sender, instance, **kwargs):
    if instance.logo and not instance.logo.name.endswith(".webp"):
        instance.logo = convert_to_webp(instance.logo)
    if instance.cover_image and not instance.cover_image.name.endswith(".webp"):
        instance.cover_image = convert_to_webp(instance.cover_image)
