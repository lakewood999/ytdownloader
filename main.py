from flask import Flask, render_template, request, jsonify, abort
from hashlib import md5
from os import listdir, getcwd
from flask.helpers import send_from_directory
import redis
import string
from tasks import download_request

app = Flask(__name__)

# initialize redis connection
redis = redis.Redis(host='localhost', port='6379')

# quick and dirty check, can be replaced by regex
def check_id(id):
    for c in id.lower():
        if c not in string.digits + "abcdef":
            return False
    return True

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/job/request", methods=["POST"])
def download_req():
    req_body = request.get_json()
    if "url" not in req_body:
        return jsonify({"message": "Error: URL not provided!"})
    req_url = req_body["url"]
    download_request.delay(req_url)
    return jsonify({
        "state": "success",
        "id": md5(req_url.encode('ascii')).hexdigest()
    })


@app.route("/api/job/status", methods=["POST"])
def download_status():
    # process input
    req_body = request.get_json()
    if "id" not in req_body:
        return jsonify({"message": "Error: invalid request. Missing job ID."})
    job_id = req_body['id']
    # get status from redis
    status = redis.hmget(job_id, ["state", "eta", "percent"])
    if None in status:
        return jsonify({"message": "Error: ID not found."})
    # format and send results
    return jsonify({"state": status[0].decode('utf-8'), "percent": status[2].decode('utf-8')})


@app.route("/api/job/download/<job_id>")
def download_file(job_id):
    if len(job_id) == 32 and check_id(job_id):
        if job_id not in listdir(app.root_path+"/tmp"):
            abort(404)
        files = listdir(app.root_path+"/tmp/"+job_id+"/")
        if len(files) == 0:
            abort(404)
        return send_from_directory(app.root_path+"/tmp/"+job_id,files[0],as_attachment=True,cache_timeout=0)
    abort(400)

if __name__ == "__main__":
    app.run()