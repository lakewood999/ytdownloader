# ytdownload

A web application that uses youtube_dl to download mp4 and mp3 files from YouTube.

## Initial Installation
Install Python dependencies using `pipenv`. The recommended method is to create a `.venv` folder in the current folder before running `pipenv sync`. This keeps the virtual environment in the local directory for easy usage; it is also useful for development.

## Running
1. The redis instance needs to be started service. The celery workers depend on the instance to work. From this directory, run `./redis/bin/redis-server` to start the server.
2. The celery workers then need to be started, as the web service depends on these workers being available. Run `pipenv run celery -A tasks worker --loglevel=INFO`
3. Finally, the web service can be started. Run `pipenv run gunicorn --bind 0.0.0.0:[PORT] main:app`