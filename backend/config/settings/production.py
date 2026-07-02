"""
Production settings for Huellitas Barinas project.
"""

import os
import sys
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ============================================================================
# SECURITY VALIDATION
# ============================================================================

def validate_required_env(key: str, error_msg: str = None) -> str:
    """Validate that required environment variable exists and is not empty."""
    value = os.environ.get(key, '').strip()
    if not value:
        msg = error_msg or f"❌ CRITICAL: {key} environment variable is required but not set"
        print(msg, file=sys.stderr)
        raise ValueError(msg)
    return value


# Security
DEBUG = False

# Validate SECRET_KEY
try:
    SECRET_KEY = validate_required_env(
        'SECRET_KEY',
        '❌ CRITICAL: SECRET_KEY not set. Generate with: python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"'
    )
except ValueError as e:
    raise e

# Validate ALLOWED_HOSTS
try:
    allowed_hosts_str = validate_required_env(
        'ALLOWED_HOSTS',
        '❌ CRITICAL: ALLOWED_HOSTS not set. Example: "yourdomain.com,www.yourdomain.com,api.yourdomain.com"'
    )
    ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_str.split(',')]
except ValueError as e:
    raise e

# Security Headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

def parse_database_url(url: str = None) -> dict:
    """
    Parse DATABASE_URL or individual DB environment variables.
    Supports both Neon PostgreSQL URLs and individual env vars.
    
    Format:
    - DATABASE_URL: postgresql://user:password@host:port/dbname?sslmode=require
    - Or individual vars: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME
    """
    import re
    
    db_url = url or os.environ.get('DATABASE_URL', '').strip()
    
    if db_url:
        # Parse PostgreSQL connection string
        # Format: postgresql://user:password@host:port/dbname[?params]
        match = re.match(
            r'postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/([^\?]+)',
            db_url
        )
        if match:
            return {
                'default': {
                    'ENGINE': 'django.db.backends.postgresql',
                    'NAME': match.group(5),
                    'USER': match.group(1),
                    'PASSWORD': match.group(2),
                    'HOST': match.group(3),
                    'PORT': match.group(4),
                    'OPTIONS': {
                        'sslmode': 'require',
                    },
                    'CONN_MAX_AGE': 600,
                    'ATOMIC_REQUESTS': True,
                }
            }
    
    # Fallback to individual environment variables
    return {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': validate_required_env('DB_NAME'),
            'USER': validate_required_env('DB_USER'),
            'PASSWORD': validate_required_env('DB_PASSWORD'),
            'HOST': validate_required_env('DB_HOST'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': 'require',
            },
            'CONN_MAX_AGE': 600,
            'ATOMIC_REQUESTS': True,
        }
    }


try:
    DATABASES = parse_database_url()
except ValueError as e:
    print(f"❌ Database configuration error: {e}", file=sys.stderr)
    raise

# ============================================================================
# STATIC FILES
# ============================================================================

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ============================================================================
# MEDIA FILES & STORAGE
# ============================================================================

# Cloudflare R2 Configuration
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID', '').strip()
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY', '').strip()

if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
    # Use R2 for production storage
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_STORAGE_BUCKET_NAME = validate_required_env('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_ENDPOINT_URL = validate_required_env('AWS_S3_ENDPOINT_URL')
    AWS_S3_REGION_NAME = 'auto'
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    AWS_DEFAULT_ACL = None
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    AWS_S3_FILE_OVERWRITE = False
    AWS_QUERYSTRING_AUTH = False
else:
    # Fallback to local storage
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

# ============================================================================
# CORS CONFIGURATION
# ============================================================================

try:
    cors_origins_str = validate_required_env(
        'CORS_ALLOWED_ORIGINS',
        '❌ CRITICAL: CORS_ALLOWED_ORIGINS not set. Example: "https://yourdomain.com,https://www.yourdomain.com"'
    )
    CORS_ALLOWED_ORIGINS = [url.strip() for url in cors_origins_str.split(',')]
except ValueError as e:
    raise e

CORS_ALLOW_CREDENTIALS = True

# ============================================================================
# EMAIL CONFIGURATION
# ============================================================================

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com').strip()
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '').strip()
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '').strip()
DEFAULT_FROM_EMAIL = os.environ.get(
    'DEFAULT_FROM_EMAIL',
    'Huellitas Barinas <noreply@huellitasbarinas.com>'
)

# Warning: Email disabled if credentials not provided
if not (EMAIL_HOST_USER and EMAIL_HOST_PASSWORD):
    print(
        "⚠️  WARNING: Email not configured. Set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD.",
        file=sys.stderr
    )
    # Fallback to console backend for testing
    if DEBUG is False:
        EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ============================================================================
# CELERY & REDIS CONFIGURATION
# ============================================================================

try:
    CELERY_BROKER_URL = validate_required_env(
        'REDIS_URL',
        '❌ CRITICAL: REDIS_URL not set. Example: "redis://localhost:6379/0"'
    )
    CELERY_RESULT_BACKEND = CELERY_BROKER_URL
except ValueError as e:
    raise e

CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Caracas'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60  # 30 minutes

# ============================================================================
# CACHE CONFIGURATION
# ============================================================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': CELERY_BROKER_URL,
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'huellitas',
        'TIMEOUT': 300,  # 5 minutes default
    }
}

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{levelname}] {asctime} {name} {funcName}:{lineno}d - {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 10,
            'formatter': 'verbose',
        },
        'mail_admins': {
            'class': 'django.utils.log.AdminEmailHandler',
            'level': 'ERROR',
            'filters': ['require_debug_false'],
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['file', 'mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Ensure logs directory exists
logs_dir = BASE_DIR / 'logs'
logs_dir.mkdir(exist_ok=True)

# ============================================================================
# IMPORT BASE SETTINGS (AFTER CRITICAL VALIDATIONS)
# ============================================================================

from .base import *  # noqa: E402, F401

# ============================================================================
# ADDITIONAL SECURITY HEADERS
# ============================================================================

# Sentry configuration (optional)
SENTRY_DSN = os.environ.get('SENTRY_DSN', '').strip()
if SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,
        send_default_pii=False,
        environment=os.environ.get('ENVIRONMENT', 'production'),
    )

print("✅ Production settings loaded successfully")
