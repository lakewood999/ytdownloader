"""
Copyright 2022 Steven Su

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
"""

from flask import Flask, render_template, request, jsonify, abort
from hashlib import md5
from os import listdir, getcwd
from flask.helpers import send_from_directory
import redis
import string
from tasks import download_request
from os import environ
from requests import post

app = Flask(__name__)

# initialize redis connection
redis = redis.Redis(host="redis", port="6379")

# quick and dirty check, can be replaced by regex
def check_id(id):
    for c in id.lower():
        if c not in string.digits + "abcdef":
            return False
    return True

# constants
DL_FORMATS = ["audio_only", "video_only", "both"]

def validate_recaptcha(code, ip):
    data = {
        'secret': environ.get('RECAPTCHA_SECRET'),
        'response': code,
        'remoteip': ip
    }
    r = post('https://www.google.com/recaptcha/api/siteverify', data=data)
    r_json = r.json()
    if r_json['success']:
        return True, []
    else:
        return r_json['success'], r_json['error-codes']

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/job/request", methods=["POST"])
def download_req():
    # get data from request
    req_body = request.get_json()
    # url
    if "url" not in req_body:
        return jsonify({"state":"error", "message": "Error: URL not provided!"})
    req_url = req_body["url"]
    if 'recaptcha' in req_body:
        result, codes = validate_recaptcha(req_body['recaptcha'], request.remote_addr)
        if not result:
            return jsonify({"state":"error", "message": f"Error: Invalid reCAPTCHA with error code {codes}"})
    else:
        return jsonify({"state":"error", "message": "Error: reCAPTCHA not provided!"})

    # format: must be video or audio
    if "format" not in req_body:
        return jsonify({"state":"error", "message": "Error: Format not found"})
    req_format = req_body["format"]
    if req_format not in DL_FORMATS:
        return jsonify({"state":"error", "message": "Error: Invalid download format requested"})

    # convert url to job id
    job_id = md5((req_url+"-"+req_format).encode("ascii")).hexdigest()

    # start request if it's not already complete
    if not redis.exists(job_id) and redis.hmget(job_id, ["state"])[0] != "done":
        download_request.delay(req_url, req_format)
    
    return jsonify({"state": "success", "id": job_id})


@app.route("/api/job/status", methods=["POST"])
def download_status():
    # process input
    req_body = request.get_json()
    if "id" not in req_body:
        return jsonify({"state": "error", "message": "Error: invalid request. Missing job ID."})
    job_id = req_body["id"]

    # get status from redis
    if not redis.exists(job_id):
        return jsonify({"state":"error", "message": "Error: ID not found."})
    status = redis.hmget(job_id, ["state", "eta", "percent", "message"])
    if status[3] == None:
        status[3] = ""
    else:
        status[3] = status[3].decode("utf-8")

    # format and send results
    return jsonify(
        {
            "state": status[0].decode("utf-8"),
            "percent": status[2].decode("utf-8").strip(),
            "message": status[3],
        }
    )


@app.route("/api/job/download/<job_id>/<dl_format>")
def download_file(job_id, dl_format):
    # check id
    if len(job_id) == 32 and check_id(job_id) and dl_format in DL_FORMATS:
        # make sure we have a folder with files
        if job_id not in listdir(app.root_path + "/tmp"):
            abort(404)
        files = listdir(app.root_path + "/tmp/" + job_id)
        if len(files) == 0:
            abort(404)

        # remove job id after it has been download (to change later?)
        if redis.exists(job_id):
            redis.delete(job_id)

        # send result from directory safely
        return send_from_directory(
            app.root_path + "/tmp/" + job_id,
            files[0],
            as_attachment=True,
            max_age=0,
        )

    # invalid id is an invalid request
    abort(400)


if __name__ == "__main__":
    app.run()
