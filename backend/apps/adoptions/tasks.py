"""
Celery tasks for adoptions app.
"""

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_adoption_status_email(adoption_id, new_status):
    """Send email notification when adoption status changes."""
    from .models import Adoption

    try:
        adoption = Adoption.objects.get(id=adoption_id)

        subject = f"Actualización de tu solicitud de adopción #{adoption.id}"
        message = f"""
        Hola {adoption.applicant.get_full_name()},

        Tu solicitud de adopción para {adoption.pet.name} ha cambiado de estado.

        Nuevo estado: {adoption.get_status_display()}

        Notas: {adoption.review_notes or 'Sin notas adicionales'}

        Saludos,
        Huellitas Barinas
        """

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [adoption.applicant.email],
            fail_silently=True,
        )
    except Adoption.DoesNotExist:
        pass
