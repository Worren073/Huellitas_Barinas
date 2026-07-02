"""
Pet URL patterns.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PetViewSet, PetImageViewSet

app_name = 'pets'

router = DefaultRouter()
router.register('', PetViewSet, basename='pet')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:pet_pk>/images/', PetImageViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='pet-images'),
    path('<int:pet_pk>/images/<int:pk>/', PetImageViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name='pet-image-detail'),
]
