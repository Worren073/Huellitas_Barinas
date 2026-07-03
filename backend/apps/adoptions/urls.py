"""
Adoption URL patterns.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdoptionViewSet

app_name = "adoptions"

router = DefaultRouter()
router.register("", AdoptionViewSet, basename="adoption")

urlpatterns = [
    path("", include(router.urls)),
]
