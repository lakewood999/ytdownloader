FROM ubuntu:20.04

# Install basic dependencies
RUN apt update && apt upgrade -y
RUN DEBIAN_FRONTEND=noninteractive TZ=Etc/UTC apt-get -y install tzdata
RUN apt install -y software-properties-common python3-pip
RUN apt install -y redis ffmpeg
RUN python3 -m pip install pipenv
ENV PIPENV_VENV_IN_PROJECT=1

# Copy application
WORKDIR /opt/ytdownloader
COPY ytdownloader/ .
RUN mkdir .venv
RUN pipenv sync
RUN chmod +x start.sh

# Expose the application port
EXPOSE 80

# Start
CMD ./start.sh
