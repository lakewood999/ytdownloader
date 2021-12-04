'use strict';

const e = React.createElement;

class DownloadForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {downloading: false, text: "", url: ""};

    this.handleURLChange = this.handleURLChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleURLChange(event) {
    this.setState({value: event.target.value})
  }

  handleSubmit(event) {
    this.makeRequest();
    event.preventDefault();
  }

  makeRequest() {
    this.setState({downloading: true})
    fetch('/api/request', {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({"url":this.state.url}),
    }).then(response => response.json())
      .then(data=>{
        console.log(data);
        this.setState({text: data.info, downloading: false})
      });
  }

  render() {
    var downloadBox =<p></p>;
    if (this.state.downloading) {
      downloadBox = <p>Downloading</p>;
    } else if (!this.state.downloading && this.state.text !== "") {
      downloadBox = <p>Resp: {this.state.text}</p>;
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="field has-addons">
            <div className="control is-expanded">
                <input className="input" disabled={this.state.downloading} type="text" placeholder="Video URL" onChange={this.handleURLChange} value={this.state.url} />
            </div>
            <div className="control">
                <button className="button is-info">
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