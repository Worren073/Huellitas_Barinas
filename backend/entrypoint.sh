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

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
