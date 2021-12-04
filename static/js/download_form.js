'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var e = React.createElement;

var DownloadForm = function (_React$Component) {
  _inherits(DownloadForm, _React$Component);

  function DownloadForm(props) {
    _classCallCheck(this, DownloadForm);

    var _this = _possibleConstructorReturn(this, (DownloadForm.__proto__ || Object.getPrototypeOf(DownloadForm)).call(this, props));

    _this.state = { downloading: false, text: "", url: "" };

    _this.handleURLChange = _this.handleURLChange.bind(_this);
    _this.handleSubmit = _this.handleSubmit.bind(_this);
    return _this;
  }

  _createClass(DownloadForm, [{
    key: "handleURLChange",
    value: function handleURLChange(event) {
      this.setState({ value: event.target.value });
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit(event) {
      this.makeRequest();
      event.preventDefault();
    }
  }, {
    key: "makeRequest",
    value: function makeRequest() {
      var _this2 = this;

      this.setState({ downloading: true });
      fetch('/api/request', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "url": this.state.url })
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        console.log(data);
        _this2.setState({ text: data.info, downloading: false });
      });
    }
  }, {
    key: "render",
    value: function render() {
      var downloadBox = React.createElement("p", null);
      if (this.state.downloading) {
        downloadBox = React.createElement(
          "p",
          null,
          "Downloading"
        );
      } else if (!this.state.downloading && this.state.text !== "") {
        downloadBox = React.createElement(
          "p",
          null,
          "Resp: ",
          this.state.text
        );
      }

      return React.createElement(
        "form",
        { onSubmit: this.handleSubmit },
        React.createElement(
          "div",
          { className: "field has-addons" },
          React.createElement(
            "div",
            { className: "control is-expanded" },
            React.createElement("input", { className: "input", disabled: this.state.downloading, type: "text", placeholder: "Video URL", onChange: this.handleURLChange, value: this.state.url })
          ),
          React.createElement(
            "div",
            { className: "control" },
            React.createElement(
              "button",
              { className: "button is-info" },
              "Download"
            )
          )
        ),
        downloadBox
      );
    }
  }]);

  return DownloadForm;
}(React.Component);

var domContainer = document.querySelector('#download_form');
ReactDOM.render(e(DownloadForm), domContainer);