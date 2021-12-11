'use strict';
const e = React.createElement;

class StatusLine extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const prefix = "Step " + this.props.itemNumber + ": ";
    const body = this.props.text;
    const suffix = this.props.suffix;
    var status_color, icon;
    if (this.props.stateNumber === this.props.stateLoading && this.props.stateNumber !== this.props.stateDone) {
      status_color = "has-text-info";
      icon = <i className="fas fa-sync fa-spin"></i>;
    } else if (this.props.stateNumber >= this.props.stateDone) {
      status_color = "has-text-success";
      icon = <i className="fas fa-check"></i>;
    } else {
      status_color = "grey-lighter";
      icon = null;
    }
    return <span className={status_color}><b>{prefix}</b>{body + " " + suffix} {icon}</span>;
  }
}

class DownloadStatusBox extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    var out;
    if (this.props.state !== -1) {
      out = this.props.steps.map(
        (step) => <div><StatusLine itemNumber={step.number}
          text={step.text} 
          suffix={step.suffix}
          stateNumber={this.props.state}
          stateDone={step.stateDone}
          stateLoading={step.stateLoading} 
        /><br/></div>
      )
    } else {
      out = <span className="has-text-danger"><b>Message: </b>An error has occurred. Please check URL or contact an administrator.</span>;
    }
    return <div>{out}</div>;
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
        this.setState({ state: 1, downloading: true, interval: setInterval(this.checkStatus, 500), jobid: data.id, percent: "0%" })
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
          this.setState({ state: 4, interval: clearInterval(this.state.interval), percent: "100%" })
        } else if (data.state === "error") {
          this.setState({ state: -1, interval: null })
        }
      });
  }

  render() {
    var downloadBox, downloadStatus;
    var downloadButton = null;
    if (this.state.downloading) {
      var steps = [
        { "number": 1, "text": "Queue download request", "suffix": "", "stateLoading": 1, "stateDone": 2 },
        { "number": 2, "text": "Video downloading on server", "suffix": "("+this.state.percent+")", "stateLoading": 2, "stateDone": 3 },
        { "number": 3, "text": "Post-processing and conversion", "suffix": "", "stateLoading": 3, "stateDone": 4 },
        { "number": 4, "text": "Read to download", "suffix": "", "stateLoading": 4, "stateDone": 4 }
      ];
      downloadStatus = <DownloadStatusBox state={this.state.state} steps={steps} />;

      if (this.state.state === 4) {
        downloadButton = <div className="field is-grouped mt-1">
          <p class="control"><a className="button is-info" download href={"/api/job/download/" + this.state.jobid}>Download</a></p>
          <p class="control"><input className="button is-info" value="Reset" type="reset" /></p>
        </div>;
      } else if (this.state.state === -1) {
        downloadButton = <div className="field is-grouped mt-1">
          <p class="control"><input className="button is-info" value="Reset" type="reset" /></p>
        </div>;
      }

      downloadBox = <div className="">
        <div className="container">
          {downloadStatus}
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
      </form>
    );
  }
}

const domContainer = document.querySelector('#download_form');
ReactDOM.render(e(DownloadForm), domContainer);