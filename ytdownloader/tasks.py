"""
Copyright 2022 Steven Su

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
"""
from celery import Celery
import redis

# initialize redis connection
redis = redis.Redis(host="redis", port="6379")

# define celery app
app = Celery("tasks", broker="redis://redis", broker_connection_retry_on_startup=True)


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
        redis.hmset(video_id,
            {
                "eta": d["_eta_str"],
                "percent": d["_percent_str"].strip(),
                "state": "downloading",
            },
        )
    elif d["status"] == "finished":
        redis.hmset(video_id, {"eta": "0", "percent": "100%", "state": "processing"})


def post_hook(d):
    """
    Hook to process data when processing (e.g. converting) during download
    """
    if d["status"] == "started":
        video_id = d["info_dict"]["_filename"].split("/")[1]
        redis.hmset(
            video_id, {"eta": "unknown", "percent": "unknown", "state": "processing"}
        )
    elif d["status"] == "finished":
        video_id = d["info_dict"]["_filename"].split("/")[1]
        redis.hmset(video_id, {"eta": "unknown", "percent": "unknown", "state": "done"})

# urls:
# test url: https://www.youtube.com/watch?v=BaW_jenozKc
# long url: https://www.youtube.com/watch?v=ddRMOKFDgos
# short ur: https://www.youtube.com/watch?v=RKmw9oS__MM

# Main task definition
@app.task
def download_request(url, dl_format):
    from hashlib import md5
    import yt_dlp as ytdl
    
    # config for youtube download
    ydl_opts = {
        "format": "bestvideo+bestaudio",
        "postprocessors": [],
        "logger": MyLogger(),
        "progress_hooks": [progress_hook],
        "postprocessor_hooks": [post_hook],
        #"outtmpl": "%(title)s-%(id)s.%(ext)s", # drop the title to prevent filename errors
        "outtmpl": "%(id)s.%(ext)s",
        "paths": {"home": "tmp/"},
        "verbose": True,
    }

    ydl_audio_postprocessor = {
        "key": "FFmpegExtractAudio",
        "when": "post_process",
        "preferredcodec": "mp3",
        "preferredquality": "192",
    }

    # job id used to track progress
    job_id = md5((url+"-"+dl_format).encode("ascii")).hexdigest()
    # store files by <id>/<format> (more to come later when more options are added)
    ydl_opts["paths"]["home"] = "tmp/" + job_id
    # add additional post processor if audio-only requested
    if dl_format == "audio_only":
        ydl_opts["postprocessors"].append(ydl_audio_postprocessor)
        ydl_opts["format"] = "bestaudio"
    elif dl_format == "video_only":
        ydl_opts["format"] = "bestvideo"

    # start download process
    try:
        with ytdl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception as e:
        print("Error downloading")
        redis.hmset(job_id, {"state": "error", "eta": "", "percent": "", "message": str(e)})
        return
