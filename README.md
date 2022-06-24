# ytdownload

A web application that uses youtube_dl to download mp4 and mp3 files from YouTube. This application is still under development. Basic download functionality is available, and I intend to add configuration options for quality, file type, etc.

## Initial Installation
Install Python dependencies using `pipenv`. The recommended method is to create a `.venv` folder in the current folder before running `pipenv sync` or `pipenv install` for development. This keeps the virtual environment in the local directory for easy usage; it is also useful for development. For development, `npm install` should also be run in this directory to have the node tools available.

## Dev Tips
To build the JSX scripts, run `npx babel --watch react_src/ --out-dir static/js/ --presets react-app/prod`

## Running
1. The redis instance needs to be started service. The celery workers depend on the instance to work. From this directory, run `./redis/bin/redis-server` to start the server.
2. The celery workers then need to be started, as the web service depends on these workers being available. Run `pipenv run celery -A tasks worker --loglevel=INFO`
3. Finally, the web service can be started. Run `pipenv run gunicorn --bind 0.0.0.0:[PORT] --reload main:app`

## Deploying
This project will be made available through two options: Docker containers and .deb files for Debian-based systems. Currently, initial Docker containers have been made. So, `git clone` this project into your intended run directory, install `docker` and `docker compose`, and run `sudo docker compose up` in this directory.

**DEMO: I am hosting this site (deployed via the Docker method described above) at [ytdl.stevensu.dev](https://ytdl.stevensu.dev)**

## License
The code written by me in the repository is licensed under the AGPL v3 license, the text of which is included. Content by other parties (e.g. Bulma, Redis, etc.) retain their original licenses and permissions. 

## Note
The [Github](https://github.com/lakewood999/ytdownloader) repository currently (automatically) mirrors that on my personal [Gitlab](https://git.stevensu.dev/lakewood999/ytdownloader). This may change in the future, but for the present, the Gitlab is the guiding repo.
