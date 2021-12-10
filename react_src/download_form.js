'use strict';
const e = React.createElement;

class Test extends React.Component {
  render() {
    return <p>Hello!</p>;
  }
}

class DownloadForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { downloading: false, url: "", interval: null, jobid: "", state: 0 };

    this.handleURLChange = this.handleURLChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.makeRequest = this.makeRequest.bind(this);
    this.checkStatus = this.checkStatus.bind(this);
    this.restart = this.restart.bind(this);
  }

  handleURLChange(event) {
    this.setState({ url: event.target.value })
  }

  handleSubmit(event) {
    this.makeRequest();
    event.preventDefault();
  }

  restart() {
    this.setState({ downloading: false, url: "", interval: null, jobid: "", state: 0 })
  }

  makeRequest() {
    this.setState({ downloading: true })
    fetch('/api/job/request', {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "url": this.state.url }),
    }).then(response => response.json())
      .then(data => {
        this.setState({ state: 1, downloading: true, interval: setInterval(this.checkStatus, 500), jobid: data.id, percent: " 0%" })
      });
  }

  checkStatus() {
    if (this.state.jobid === null) {
      return;
    }
    fetch('/api/job/status', {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "id": this.state.jobid }),
    }).then(response => response.json())
      .then(data => {
        if (data.state === "downloading" && this.state.state !== 2) {
          this.setState({ state: 2, percent: data.percent })
        } else if (data.state === "downloading" && this.state.state === 2) {
          this.setState({ percent: data.percent })
        } else if (data.state === "processing" && this.state.state !== 3) {
          this.setState({ state: 3 })
        } else if ((data.state === "done" && this.state.state !== 4)) {
          this.setState({ state: 4, interval: clearInterval(this.state.interval), percent: " 100%" })
        } else if (data.state === "error") {
          this.setState({ state: -1, interval: null })
        }
      });
  }

  render() {
    var downloadBox = <p></p>;
    var stepOneClass, stepTwoClass, stepThreeClass, stepFourClass;
    stepOneClass = stepTwoClass = stepThreeClass = stepFourClass = "grey-lighter";
    var stepOneText, stepTwoText, stepThreeText, stepFourText;
    stepOneText = stepTwoText = stepThreeText = stepFourText = "";
    var downloadButton = null;
    var message = "";
    if (this.state.downloading) {
      if (this.state.state === 0) {
        stepOneClass = "has-text-info";
        stepOneText = <i className="fas fa-sync fa-spin"></i>;
      } else {
        stepOneClass = "has-text-success";
        stepOneText = <i className="fas fa-check"></i>;
      }

      if (this.state.state === 2 || this.state.state === 1) {
        stepTwoClass = "has-text-info";
        stepTwoText = <span><i className="fas fa-sync fa-spin"></i> {this.state.percent}</span>;
      } else if (this.state.state >= 3) {
        stepTwoClass = "has-text-success";
        stepTwoText = <i className="fas fa-check"></i>;
      }

      if (this.state.state === 3) {
        stepThreeClass = "has-text-info";
        stepThreeText = <i className="fas fa-sync fa-spin"></i>;
      } else if (this.state.state >= 4) {
        stepThreeClass = "has-text-success";
        stepThreeText = <i className="fas fa-check"></i>;
      }

      if (this.state.state === 4) {
        stepFourClass = "has-text-success";
        stepFourText = <i className="fas fa-check"></i>;
        downloadButton = <div className="container">
          <a className="button is-info" download href={"/api/job/download/" + this.state.jobid}>Download</a> <input className="button is-info" value="Reset" type="reset" />
        </div>;
      }

      if (this.state.state === -1) {
        stepOneClass = stepTwoClass = stepThreeClass = stepFourClass = "has-text-danger";
        message = <span><b>Message: </b>An error has occurred. Please check URL or contact an administrator!</span>;
        downloadButton = <div className="container">
          <input className="button is-info" value="Reset" type="reset" />
        </div>;
      }
    }

    if (this.state.downloading) {
      downloadBox = <div className="">
        <div className="container">
          <span className={stepOneClass}><b>Step 1: </b> Queue download request {stepOneText}</span><br />
          <span className={stepTwoClass}><b>Step 2: </b> Video downloading {stepTwoText}</span><br />
          <span className={stepThreeClass}><b>Step 3: </b> Post-processing and conversion {stepThreeText}</span><br />
          <span className={stepFourClass}><b>Step 4: </b> Ready to download {stepFourText}</span><br />
          <span className={stepOneClass}>{message}</span>
        </div>
        {downloadButton}
      </div>;
    }

    return (
      <form onSubmit={this.handleSubmit} onReset={this.restart}>
        <div className="field has-addons">
          <div className="control is-expanded">
            <input className="input" disabled={this.state.downloading} type="text" placeholder="Video URL" onChange={this.handleURLChange} value={this.state.url} />
          </div>
          <div className="control">
            <button disabled={this.state.downloading} className="button is-info">
              Download
            </button>
          </div>
        </div>
        {downloadBox}
        <Test />
      </form>
    );
  }
}

const domContainer = document.querySelector('#download_form');
ReactDOM.render(e(DownloadForm), domContainer);