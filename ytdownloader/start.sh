#!/bin/bash
# Start script for Docker container

# Start Redis
echo "Starting redis"
/usr/bin/redis-server --daemonize yes

# Start celery
echo "Starting celery task queue"
pipenv run celery -A tasks worker --loglevel=INFO --detach

# Start main application
echo "Starting main application"
pipenv run gunicorn --bind 0.0.0.0:80 --reload main:app #--daemon