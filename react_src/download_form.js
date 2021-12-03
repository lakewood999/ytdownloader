'use strict';

const e = React.createElement;

class DownloadForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { downloading: false, text: "" };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    this.makeRequest();
    event.preventDefault();
  }

  makeRequest() {
    this.setState({downloading: true})
    fetch('/api/request')
      .then(response => response.json())
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
        <div class="field has-addons">
            <div class="control is-expanded">
                <input class="input" type="text" placeholder="Video URL" />
            </div>
            <div class="control">
                <button class="button is-info">
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