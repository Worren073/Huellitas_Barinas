from celery import current_app as celery_app
from django.conf import settings


def send_adoption_notification(adoption, subject, message):
    if not settings.EMAIL_HOST_USER:
        return
    try:
        celery_app.send_task(
            "apps.adoptions.tasks.send_adoption_status_email",
            args=[adoption.id, adoption.status],
        )
    except Exception:
        from django.core.mail import send_mail

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[adoption.applicant.email],
            fail_silently=True,
        )


def notify_submitted(adoption):
    send_adoption_notification(
        adoption,
        f"Solicitud de adopción enviada - {adoption.pet.name}",
        f"Hola {adoption.applicant.first_name},\n\n"
        f"Hemos recibido tu solicitud de adopción para {adoption.pet.name}.\n"
        f"El centro se pondrá en contacto contigo pronto.\n\n"
        f"Gracias por adoptar.",
    )


def notify_approved(adoption):
    send_adoption_notification(
        adoption,
        f"Solicitud aprobada - {adoption.pet.name}",
        f"Hola {adoption.applicant.first_name},\n\n"
        f"¡Tu solicitud de adopción para {adoption.pet.name} ha sido aprobada!\n"
        f"El centro de adopción se contactará contigo para coordinar la entrega.\n\n"
        f"¡Felicidades!",
    )


def notify_rejected(adoption, reason=""):
    msg = (
        f"Hola {adoption.applicant.first_name},\n\n"
        f"Lamentamos informarte que tu solicitud de adopción para {adoption.pet.name} "
        f"no ha sido aprobada.\n"
    )
    if reason:
        msg += f"Motivo: {reason}\n"
    msg += "\nPuedes intentar con otra mascota. ¡Gracias por tu interés!"
    send_adoption_notification(
        adoption,
        f"Solicitud no aprobada - {adoption.pet.name}",
        msg,
    )


def notify_completed(adoption):
    send_adoption_notification(
        adoption,
        f"Adopción completada - {adoption.pet.name}",
        f"Hola {adoption.applicant.first_name},\n\n"
        f"¡La adopción de {adoption.pet.name} se ha completado exitosamente!\n"
        f"Gracias por darle un hogar. Te deseamos lo mejor.",
    )
