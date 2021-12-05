'use strict';

const e = React.createElement;

class DownloadForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { downloading: false, text: "", url: "abv" };

    this.handleURLChange = this.handleURLChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    fetch('/api/request', {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ "url": this.state.url }),
    }).then(response => response.json())
      .then(data => {
        console.log(data);
        this.setState({ text: data.info, downloading: true })
      });
  }

  render() {
    var downloadBox = <p></p>;
    var stepOneClass, stepTwoClass, stepThreeClass, stepFourClass;
    stepOneClass = stepTwoClass = stepThreeClass = stepFourClass = "grey-lighter";
    var stepOneText, stepTwoText, stepThreeText, stepFourText;
    stepOneText = stepTwoText = stepThreeText = stepFourText = "";
    if (this.state.downloading && this.state.text === "") {
      stepOneClass = "has-text-info";
      stepOneText = <i className="fas fa-sync fa-spin"></i>;
    }
    if (this.state.downloading && this.state.text !== "") {
      stepOneClass = "has-text-success";
      stepOneText = <i className="fas fa-check"></i>;
    }
    if (this.state.downloading || this.state.text==="success") {
      downloadBox = <div className="">
        <p>
          <span className={stepOneClass}><b>Step 1: </b> Queue download request {stepOneText}</span><br/>
          <span className={stepTwoClass}><b>Step 2: </b> Video downloading {stepTwoText}</span><br/>
          <span className={stepThreeClass}><b>Step 3: </b> Post-processing and conversion {stepThreeText}</span><br/>
          <span className={stepFourClass}><b>Step 4: </b> Ready to download {stepFourText}</span>
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