#!/bin/bash
set -e

# Only run migrations on the API service
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations..."
    python manage.py migrate --noinput
    
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
fi

# Workers don't run migrations
if [ "$RUN_MIGRATIONS" != "true" ]; then
    echo "Skipping migrations for worker/beat containers"
fi

if [ $# -gt 0 ]; then
    exec "$@"
else
    echo "Starting Gunicorn server..."
    exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
fi
