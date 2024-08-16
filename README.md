# ytdownload

A web application that uses youtube_dl to download mp4 and mp3 files from YouTube. This application is still under development. Basic download functionality is available, and I intend to add configuration options for quality, file type, etc.

## Initial Installation
Dependencies for the Python server are managed using `poetry` and dependencies for the frontend are managed using `npm`.
A simple `poetry install` and `npm install` should suffice for development purposes. Fine-grained dependency management
for deployment is handled by the Dockerfiles.

## Dev Tips
For development builds with source maps, the frontend can be prepended with environment variable `PROD_BUILD=false`
before `npm install`. `npm watch` can also be used to watch for changes in the frontend and continuously build for
convenience.

## Running

*Note: the current recaptcha implementation uses a built-in public key but has a dynamic server key as defined in.env.template. This will be changed to support user-inputted
key pairs.*

### Bare metal (not recommended)
1. The redis instance needs to be started service. The celery workers depend on the instance to work. From this directory, run `./redis/bin/redis-server` to start the server. Note: inclusion of the binary here is deprecated and will not be included in future releases.
2. The celery workers then need to be started, as the web service depends on these workers being available. Run `poetry run celery -A tasks worker --loglevel=INFO`
3. Finally, the web service can be started. Run `poetry run gunicorn --bind 0.0.0.0:[PORT] --reload main:app`

### Docker (recommended)
This software is based on 3 different Docker containers: one for the web server, one for the Redis instance, and one for the Celery workers. Two different Docker Compose files are provided to run the app, one intended for dev and another for prod. A simple `docker compose build` followed by `docker compose up` should bring the app available by default onto port 5000. Add `-f docker-compose.dev.yml` to the commands to use the dev configuration.

**DEMO: I am hosting this site (deployed via the Docker method described above) at [ytdl.stevensu.dev](https://ytdl.stevensu.dev)**

## License
The code written by me in the repository is licensed under the AGPL v3 license, the text of which is included. Content by other parties (e.g. Bulma, Redis, etc.) retain their original licenses and permissions. 

## Note
The [Github](https://github.com/lakewood999/ytdownloader) repository currently (automatically) mirrors that on my personal [Gitlab](https://git.stevensu.dev/lakewood999/ytdownloader). This may change in the future, but for the present, the Gitlab is the guiding repo.
