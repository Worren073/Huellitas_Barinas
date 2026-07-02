"""
Development settings for Huellitas Barinas project.
"""

from .base import *

# Security
DEBUG = True
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key-change-in-production')

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'huellitas'),
        'USER': os.environ.get('DB_USER', 'huellitas'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'devpassword123'),
        'HOST': os.environ.get('DB_HOST', 'db'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# CORS
CORS_ALLOW_ALL_ORIGINS = True

# Email
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Static files
WHITENOISE_USE_FINDERS = True

# API Documentation
SPECTACULAR_SETTINGS['SERVE_PERMISSIONS'] = ['rest_framework.permissions.AllowAny']

# Celery
CELERY_TASK_ALWAYS_EAGER = True

print("✓ Development settings loaded")
print(f"✓ Database: {DATABASES['default']['NAME']}")
print(f"✓ DEBUG: {DEBUG}")
