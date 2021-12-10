from __future__ import unicode_literals
import yt_dlp as ytdl

from celery import Celery
import redis

from hashlib import md5

# initialize redis connection
redis = redis.Redis(host="localhost", port="6379")

# define celery app
app = Celery("tasks", broker="redis://localhost")


# utilities for youtube_dl
class MyLogger(object):
    def debug(self, msg):
        # debug left empty to prevent message spam
        # print(msg) to get output
        pass

    def warning(self, msg):
        print(msg)

    def error(self, msg):
        print(msg)


def progress_hook(d):
    """
    Hook to process data from download callbacks during download
    """
    video_id = d["filename"].split("/")[1]
    if d["status"] == "downloading":
        if "eta" not in d or "_percent_str" not in d:
            return
        redis.hmset(
            video_id,
            {
                "eta": d["_eta_str"],
                "percent": d["_percent_str"].strip(),
                "state": "downloading",
            },
        )
    elif d["status"] == "finished":
        redis.hmset(video_id, {"eta": "0", "percent": "100%", "state": "processing"})
        print("Done downloading, now converting ...")


def post_hook(d):
    """
    Hook to process data when processing (e.g. converting) during download
    """
    if d["status"] == "started":
        video_id = d["info_dict"]["_filename"].split("/")[1]
        print(video_id)
        redis.hmset(
            video_id, {"eta": "unknown", "percent": "unknown", "state": "processing"}
        )
    elif d["status"] == "finished":
        video_id = d["info_dict"]["_filename"].split("/")[1]
        redis.hmset(video_id, {"eta": "unknown", "percent": "unknown", "state": "done"})


# config for youtube download
ydl_opts = {
    "format": "bestaudio/best",
    #'postprocessors': [{
    #    'key': 'FFmpegExtractAudio',
    #    'when': 'post_process',
    #    'preferredcodec': 'mp3',
    #    'preferredquality': '192',
    # }],
    "logger": MyLogger(),
    "progress_hooks": [progress_hook],
    "postprocessor_hooks": [post_hook],
    "outtmpl": "%(title)s-%(id)s.%(ext)s",
    "paths": {"home": "tmp/"},
    "verbose": True,
}

# test url: https://www.youtube.com/watch?v=BaW_jenozKc
# long url: https://www.youtube.com/watch?v=ddRMOKFDgos
# short ur: https://www.youtube.com/watch?v=RKmw9oS__MM


# task definition
@app.task
def download_request(url):
    # adjust config for
    job_id = md5(url.encode("ascii")).hexdigest()
    ydl_opts["paths"]["home"] = "tmp/" + job_id
    try:
        with ytdl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception:
        redis.hmset(job_id, {"state": "error", "eta": "", "percent": ""})
        return
