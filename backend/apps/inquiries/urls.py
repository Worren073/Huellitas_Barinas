from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import HelpRequestViewSet

app_name = "inquiries"

router = DefaultRouter()
router.register("", HelpRequestViewSet, basename="help-request")

urlpatterns = [
    path("", include(router.urls)),
]
