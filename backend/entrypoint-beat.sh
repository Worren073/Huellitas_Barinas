#!/bin/bash
set -e

echo "Starting Celery Beat..."
exec celery -A config beat -l info
