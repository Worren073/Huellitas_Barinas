"""
Center URL patterns.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CenterViewSet

app_name = 'centers'

router = DefaultRouter()
router.register('', CenterViewSet, basename='center')

urlpatterns = [
    path('', include(router.urls)),
]
