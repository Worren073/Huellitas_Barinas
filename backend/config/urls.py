"""
URL configuration for Huellitas Barinas project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.views.static import serve
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from apps.users.permissions import IsSuperAdmin
from apps.users.views import HealthCheckView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # Root-level health check (used by Render)
    path('api/health/', HealthCheckView.as_view(), name='health_check_root'),

    # API v1
    path('api/v1/', include([
        # Authentication
        path('auth/', include('apps.users.urls.auth')),
        
        # Users
        path('users/', include('apps.users.urls.user')),
        
        # Centers
        path('centers/', include('apps.centers.urls')),
        
        # Pets
        path('pets/', include('apps.pets.urls')),
        
        # Adoptions
        path('adoptions/', include('apps.adoptions.urls')),

        # Inquiries
        path('help-requests/', include('apps.inquiries.urls')),
        
        # Health check
        path('health/', include('apps.users.urls.health')),
    ])),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema', permission_classes=[IsSuperAdmin]), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema', permission_classes=[IsSuperAdmin]), name='redoc'),
]

# Serve media files
if settings.DEBUG:
    # Development: use Django's static serve (efficient enough for local dev)
    if settings.MEDIA_ROOT:
        urlpatterns += [
            path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
        ]
else:
    # Production: use secure custom view with path validation and security headers
    from apps.media.views import serve_media_file

    urlpatterns += [
        path('media/<path:path>', serve_media_file, name='serve_media'),
    ]
