from flask import *
import youtube_dl

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/request")
def download_req():
    return jsonify({"info":"received"})

if __name__ == "__main__":
    app.run()