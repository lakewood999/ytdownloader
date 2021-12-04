from flask import Flask, render_template, request, jsonify
import time

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/request", methods=["POST"])
def download_req():
    req_body = request.get_json()
    req_url = req_body["url"]
    time.sleep(3)
    return jsonify({"info": "received " + req_url})


if __name__ == "__main__":
    app.run()