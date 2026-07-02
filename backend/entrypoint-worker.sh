#!/bin/bash
set -e

echo "Starting Celery Worker..."
exec celery -A config worker -l info
