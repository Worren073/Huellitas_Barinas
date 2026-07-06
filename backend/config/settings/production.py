"""
Production settings for Huellitas Barinas project.
"""

import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ============================================================================
# IMPORT BASE SETTINGS FIRST
# ============================================================================
# Load shared settings from base.py, then override for production below.
from .base import *  # noqa: E402, F401

# ============================================================================
# SECURITY VALIDATION
# ============================================================================

def validate_required_env(key: str, error_msg: str = None) -> str:
    """Validate that required environment variable exists and is not empty."""
    value = os.environ.get(key, '').strip()
    if not value:
        msg = error_msg or f"CRITICAL: {key} environment variable is required but not set"
        print(msg, file=sys.stderr)
        raise ValueError(msg)
    return value


DEBUG = False

SECRET_KEY = validate_required_env(
    'SECRET_KEY',
    'CRITICAL: SECRET_KEY not set. Generate with: python manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"'
)

allowed_hosts_str = validate_required_env(
    'ALLOWED_HOSTS',
    'CRITICAL: ALLOWED_HOSTS not set. Example: "yourdomain.com,www.yourdomain.com,api.yourdomain.com"'
)
ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_str.split(',')] + ['localhost']

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

def parse_database_url(url: str = None) -> dict:
    """Parse DATABASE_URL or individual DB environment variables."""
    from urllib.parse import urlparse, unquote
    
    db_url = url or os.environ.get('DATABASE_URL', '').strip()
    
    if db_url:
        try:
            result = urlparse(db_url)
            if result.scheme and result.scheme.startswith('postgres'):
                return {
                    'default': {
                        'ENGINE': 'django.db.backends.postgresql',
                        'NAME': result.path.lstrip('/').split('?')[0],
                        'USER': unquote(result.username) if result.username else '',
                        'PASSWORD': unquote(result.password) if result.password else '',
                        'HOST': result.hostname or '',
                        'PORT': str(result.port) if result.port else '5432',
                        'OPTIONS': {
                            'sslmode': 'require',
                            'connect_timeout': 5,
                        },
                        'CONN_MAX_AGE': 0,
                        'ATOMIC_REQUESTS': True,
                    }
                }
        except Exception as e:
            print(f"WARNING: Failed to parse DATABASE_URL: {e}", file=sys.stderr)
    
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
                'connect_timeout': 5,
            },
            'CONN_MAX_AGE': 0,
            'ATOMIC_REQUESTS': True,
        }
    }


DATABASES = parse_database_url()

# ============================================================================
# STATIC FILES
# ============================================================================

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ============================================================================
# MEDIA FILES & STORAGE
# ============================================================================

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ============================================================================
# CORS CONFIGURATION
# ============================================================================

cors_origins_str = validate_required_env(
    'CORS_ALLOWED_ORIGINS',
    'CRITICAL: CORS_ALLOWED_ORIGINS not set. Example: "https://yourdomain.com,https://www.yourdomain.com"'
)
CORS_ALLOWED_ORIGINS = [url.strip() for url in cors_origins_str.split(',')]
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
    'DEFAULT_FROM_EMAIL', 'Huellitas Barinas <noreply@huellitasbarinas.com>'
)

if not (EMAIL_HOST_USER and EMAIL_HOST_PASSWORD):
    print("WARNING: Email not configured. Set EMAIL_HOST_USER and EMAIL_HOST_PASSWORD.", file=sys.stderr)
    if DEBUG is False:
        EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# ============================================================================
# CELERY & REDIS CONFIGURATION
# ============================================================================

CELERY_BROKER_URL = validate_required_env(
    'REDIS_URL',
    'CRITICAL: REDIS_URL not set. Example: "redis://localhost:6379/0"'
)
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Caracas'
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60

# Run tasks synchronously (no worker service on free Render plan)
CELERY_TASK_ALWAYS_EAGER = True

# ============================================================================
# CACHE CONFIGURATION
# ============================================================================

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': CELERY_BROKER_URL,
        'KEY_PREFIX': 'huellitas',
        'TIMEOUT': 300,
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
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}



# ============================================================================
# SENTRY (OPTIONAL)
# ============================================================================

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

print("Production settings loaded successfully")

