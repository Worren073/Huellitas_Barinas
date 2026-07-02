"""
Database URL parsing utilities for Django settings.

Supports multiple DATABASE_URL formats including PostgreSQL (with or without 'sql' prefix)
and falls back to individual DB_* environment variables for maximum flexibility.
"""

import os
import re
from typing import Optional, Dict, Any


def parse_database_url(
    url_env_key: str,
    fallback_vars: Optional[list[tuple[str, str]]] = None,
    sslmode: Optional[str] = None
) -> Dict[str, Any]:
    """
    Parse DATABASE_URL and return Django DATABASES dict.
    
    Args:
        url_env_key: Environment variable name containing the DATABASE_URL
        fallback_vars: List of (env_var, default_value) tuples for fallback
        sslmode: SSL mode for the database connection
    
    Returns:
        Django DATABASES configuration dictionary
    """
    url = os.environ.get(url_env_key, '')
    
    if url:
        # Parse DATABASE_URL (format: postgresql://user:pass@host:port/dbname)
        match = re.match(
            r'postgres(?:ql)?://(.+?):(.+?)@(.+?)(?::(\d+))?/(.+)',
            url
        )
        if match:
            db_config = {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': match.group(5),
                'USER': match.group(1),
                'PASSWORD': match.group(2),
                'HOST': match.group(3),
                'PORT': match.group(4) or '5432',
            }
            if sslmode:
                db_config['OPTIONS'] = {'sslmode': sslmode}
            return {'default': db_config}
    
    # Fallback to individual DB_* environment variables
    if fallback_vars:
        db_config = {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get(fallback_vars[0][0], fallback_vars[0][1]),
            'USER': os.environ.get(fallback_vars[1][0], fallback_vars[1][1]),
            'PASSWORD': os.environ.get(fallback_vars[2][0], fallback_vars[2][1]),
            'HOST': os.environ.get(fallback_vars[3][0], fallback_vars[3][1]),
            'PORT': os.environ.get(fallback_vars[4][0], fallback_vars[4][1]),
        }
        if sslmode:
            db_config['OPTIONS'] = {'sslmode': sslmode}
        return {'default': db_config}
    
    # Ultimate fallback to defaults
    db_config = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'huellitas_barinas',
        'USER': 'postgres',
        'PASSWORD': '',
        'HOST': 'localhost',
        'PORT': '5432',
    }
    if sslmode:
        db_config['OPTIONS'] = {'sslmode': sslmode}
    return {'default': db_config}