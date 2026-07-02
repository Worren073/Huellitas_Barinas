"""
Development settings for Huellitas Barinas project.
"""

from .base import *

# Security
DEBUG = True
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key-change-in-production')

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'api']

# Database - Support both DATABASE_URL and individual vars
DATABASE_URL = os.environ.get('DATABASE_URL', '')
if DATABASE_URL:
    # Parse DATABASE_URL (format: postgresql://user:pass@host:port/dbname)
    import re
    match = re.match(r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', DATABASE_URL)
    if match:
        DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME = match.groups()
    else:
        DB_NAME = os.environ.get('DB_NAME', 'huellitas_barinas')
        DB_USER = os.environ.get('DB_USER', 'postgres')
        DB_PASSWORD = os.environ.get('DB_PASSWORD', 'postgres')
        DB_HOST = os.environ.get('DB_HOST', 'localhost')
        DB_PORT = os.environ.get('DB_PORT', '5432')
else:
    DB_NAME = os.environ.get('DB_NAME', 'huellitas_barinas')
    DB_USER = os.environ.get('DB_USER', 'postgres')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'postgres')
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_PORT = os.environ.get('DB_PORT', '5432')

from .database import parse_database_url

DATABASES = parse_database_url(
    'DATABASE_URL',
    [
        ('DB_NAME', 'huellitas_barinas'),
        ('DB_USER', 'postgres'),
        ('DB_PASSWORD', 'postgres'),
        ('DB_HOST', 'localhost'),
        ('DB_PORT', '5432'),
    ]
)

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

print("[OK] Development settings loaded")
print(f"[OK] Database: {DATABASES['default']['NAME']}")
print(f"[OK] DEBUG: {DEBUG}")
