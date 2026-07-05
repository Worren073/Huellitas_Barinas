#!/bin/bash
set -e

# Use Render's PORT or default to 8000
PORT="${PORT:-8000}"

# Retry DB connection before migrations (handles Neon cold start)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Waiting for database..."
    for i in $(seq 1 30); do
        python manage.py check --database default 2>/dev/null && break
        echo "  Database not ready... ($i/30)"
        sleep 2
    done

    echo "Running migrations..."
    python manage.py migrate --noinput

    echo "Collecting static files..."
    python manage.py collectstatic --noinput

    echo "Seeding superuser..."
    python manage.py seed_data
fi

# Workers don't run migrations
if [ "$RUN_MIGRATIONS" != "true" ]; then
    echo "Skipping migrations for worker/beat containers"
fi

if [ $# -gt 0 ]; then
    exec "$@"
else
    echo "Starting Gunicorn server on port ${PORT}..."
    exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers 3 --timeout 120
fi
