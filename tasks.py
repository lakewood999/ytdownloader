from __future__ import unicode_literals
import youtube_dl as ytdl

from celery import Celery
import redis
from os import listdir

# initialize redis connection
redis = redis.Redis(host='localhost',port='6379')

# define celery app
app = Celery('tasks', broker='redis://localhost')

# utilities for youtube_dl
class MyLogger(object):
    def debug(self, msg):
        pass

    def warning(self, msg):
        pass

    def error(self, msg):
        print(msg)

def my_hook(d):
    videoId = d['filename'].split("-")[-1]
    if d['status'] == "downloading":
        redis.hmset(videoId,{"eta":d["eta"],"percent":d["_percent_str"].strip()})
        print(redis.hmget(videoId,["eta","percent"]))
    elif d['status'] == 'finished':
        redis.delete(videoId)
        print('Done downloading, now converting ...')
        while True:
            files = listdir()

# config for youtube download
ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'logger': MyLogger(),
    'progress_hooks': [my_hook],
    'outtmpl': "%(title)s-%(id)s.%(ext)s",
    "verbose":True,
}

# test url: https://www.youtube.com/watch?v=BaW_jenozKc
# long url: https://www.youtube.com/watch?v=ddRMOKFDgos
# short ur: https://www.youtube.com/watch?v=RKmw9oS__MM

# task definition
@app.task
def download_request(url):
    with ytdl.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
