'use strict';

const e = React.createElement;

class DownloadForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { downloading: false, text: "", url: "abv", interval: null, jobid: "", state: 0 };

    this.handleURLChange = this.handleURLChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.makeRequest = this.makeRequest.bind(this);
    this.checkStatus = this.checkStatus.bind(this);
  }

  handleURLChange(event) {
    this.setState({ url: event.target.value })
  }

  handleSubmit(event) {
    this.makeRequest();
    event.preventDefault();
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
        console.log(data);
        this.setState({ state: 1, downloading: true, interval: setInterval(this.checkStatus, 500), jobid: data.id, percent: "" })
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
        console.log(data);
        if (data.state === "downloading" && this.state.state !== 2) {
          this.setState({ state: 2, percent: data.percent })
        } else if (data.state === "downloading" && this.state.state === 2) {
          this.setState({ percent: data.percent })
        } else if (data.state === "processing" && this.state.state !== 3) {
          this.setState({ state: 3 })
        } else if ((data.state === "done" && this.state.state !== 4)) {
          this.setState({ state: 4, interval: clearInterval(this.state.interval), percent: " 100%" })
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
    if (this.state.downloading) {
      if (this.state.state === 0) {
        stepOneClass = "has-text-info";
        stepOneText = <i className="fas fa-sync fa-spin"></i>;
      } else {
        stepOneClass = "has-text-success";
        stepOneText = <i className="fas fa-check"></i>;
      }

      if (this.state.state === 2) {
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
        downloadButton = <a className="button is-info" download href={"/api/job/download/" + this.state.jobid}>Download</a>;
      }
    }

    if (this.state.downloading) {
      downloadBox = <div className="">
        <p>
          <span className={stepOneClass}><b>Step 1: </b> Queue download request {stepOneText}</span><br />
          <span className={stepTwoClass}><b>Step 2: </b> Video downloading {stepTwoText}</span><br />
          <span className={stepThreeClass}><b>Step 3: </b> Post-processing and conversion {stepThreeText}</span><br />
          <span className={stepFourClass}><b>Step 4: </b> Ready to download {stepFourText}</span><br />
          {downloadButton}
        </p>
      </div>;
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field has-addons">
          <div className="control is-expanded">
            <input className="input" disabled={this.state.downloading} type="text" placeholder="Video URL" onChange={this.handleURLChange} />
          </div>
          <div className="control">
            <button disabled={this.state.downloading} className="button is-info">
              Download
            </button>
          </div>
        </div>
        {downloadBox}
      </form>
    );
  }
}

const domContainer = document.querySelector('#download_form');
ReactDOM.render(e(DownloadForm), domContainer);