from django.apps import AppConfig


class CentersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.centers"
    verbose_name = "Centros de Adopción"

    def ready(self):
        import apps.centers.signals  # noqa: F401
