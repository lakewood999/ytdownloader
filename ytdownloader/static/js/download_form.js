/*
Copyright 2022 Steven Su

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var e = React.createElement;

var StatusLine = function (_React$Component) {
  _inherits(StatusLine, _React$Component);

  function StatusLine(props) {
    _classCallCheck(this, StatusLine);

    return _possibleConstructorReturn(this, (StatusLine.__proto__ || Object.getPrototypeOf(StatusLine)).call(this, props));
  }

  _createClass(StatusLine, [{
    key: "render",
    value: function render() {
      var prefix = "Step " + this.props.itemNumber + ": ";
      var body = this.props.text;
      var suffix = this.props.suffix;
      var status_color, icon;
      if (this.props.stateNumber === this.props.stateLoading && this.props.stateNumber !== this.props.stateDone) {
        status_color = "has-text-info";
        icon = React.createElement("i", { className: "fas fa-sync fa-spin" });
      } else if (this.props.stateNumber >= this.props.stateDone) {
        status_color = "has-text-success";
        icon = React.createElement("i", { className: "fas fa-check" });
      } else {
        status_color = "grey-lighter";
        icon = null;
      }
      return React.createElement(
        "span",
        { className: status_color },
        React.createElement(
          "b",
          null,
          prefix
        ),
        body + " " + suffix,
        " ",
        icon
      );
    }
  }]);

  return StatusLine;
}(React.Component);

var DownloadStatusBox = function (_React$Component2) {
  _inherits(DownloadStatusBox, _React$Component2);

  function DownloadStatusBox(props) {
    _classCallCheck(this, DownloadStatusBox);

    return _possibleConstructorReturn(this, (DownloadStatusBox.__proto__ || Object.getPrototypeOf(DownloadStatusBox)).call(this, props));
  }

  _createClass(DownloadStatusBox, [{
    key: "render",
    value: function render() {
      var _this3 = this;

      var out;
      if (this.props.state !== -1) {
        out = this.props.steps.map(function (step) {
          return React.createElement(
            "div",
            { key: step.number },
            React.createElement(StatusLine, { itemNumber: step.number,
              text: step.text,
              suffix: step.suffix,
              stateNumber: _this3.props.state,
              stateDone: step.stateDone,
              stateLoading: step.stateLoading
            }),
            React.createElement("br", null)
          );
        });
      } else {
        out = React.createElement(
          "span",
          { className: "has-text-danger" },
          React.createElement(
            "b",
            null,
            "Message: "
          ),
          "An error has occurred. Please check URL or contact an administrator. Error details: ",
          this.props.error_code
        );
      }
      return React.createElement(
        "div",
        null,
        out
      );
    }
  }]);

  return DownloadStatusBox;
}(React.Component);

var DownloadForm = function (_React$Component3) {
  _inherits(DownloadForm, _React$Component3);

  function DownloadForm(props) {
    _classCallCheck(this, DownloadForm);

    var _this4 = _possibleConstructorReturn(this, (DownloadForm.__proto__ || Object.getPrototypeOf(DownloadForm)).call(this, props));

    _this4.state = { downloading: false, url: "", interval: null, jobid: "", state: 0, format: "audio_only", message: "" };

    _this4.handleURLChange = _this4.handleURLChange.bind(_this4);
    _this4.handleFormatChange = _this4.handleFormatChange.bind(_this4);
    _this4.handleSubmit = _this4.handleSubmit.bind(_this4);
    _this4.makeRequest = _this4.makeRequest.bind(_this4);
    _this4.checkStatus = _this4.checkStatus.bind(_this4);
    _this4.restart = _this4.restart.bind(_this4);
    return _this4;
  }

  _createClass(DownloadForm, [{
    key: "handleURLChange",
    value: function handleURLChange(event) {
      this.setState({ url: event.target.value });
    }
  }, {
    key: "handleFormatChange",
    value: function handleFormatChange(event) {
      this.setState({ format: event.target.value });
      console.log(event.target.value);
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit(event) {
      this.makeRequest();
      event.preventDefault();
    }
  }, {
    key: "restart",
    value: function restart() {
      this.setState({ downloading: false, url: "", interval: null, jobid: "", state: 0 });
    }
  }, {
    key: "makeRequest",
    value: function makeRequest() {
      var _this5 = this;

      this.setState({ downloading: true });
      fetch('/api/job/request', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "url": this.state.url, "format": this.state.format })
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        if (data.state === "success") {
          _this5.setState({ state: 1, downloading: true, interval: setInterval(_this5.checkStatus, 500), jobid: data.id, percent: "0%" });
        } else {
          _this5.setState({ state: -1, interval: null, message: data.message });
        }
      });
    }
  }, {
    key: "checkStatus",
    value: function checkStatus() {
      var _this6 = this;

      if (this.state.jobid === null) {
        return;
      }
      fetch('/api/job/status', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "id": this.state.jobid })
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        console.log(data);
        if (data.state === "downloading" && _this6.state.state !== 2) {
          _this6.setState({ state: 2, percent: data.percent });
        } else if (data.state === "downloading" && _this6.state.state === 2) {
          _this6.setState({ percent: data.percent });
        } else if (data.state === "processing" && _this6.state.state !== 3) {
          _this6.setState({ state: 3, percent: "100%" });
        } else if (data.state === "done" && _this6.state.state !== 4) {
          _this6.setState({ state: 4, interval: clearInterval(_this6.state.interval), percent: "100%" });
        } else if (data.state === "error") {
          _this6.setState({ state: -1, interval: null, message: data.message });
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var downloadBox, downloadStatus;
      var downloadButton = null;
      if (this.state.downloading) {
        var steps = [{ "number": 1, "text": "Queue download request", "suffix": "", "stateLoading": 1, "stateDone": 2 }, { "number": 2, "text": "Video downloading on server", "suffix": "(" + this.state.percent + ")", "stateLoading": 2, "stateDone": 3 }, { "number": 3, "text": "Post-processing and conversion", "suffix": "", "stateLoading": 3, "stateDone": 4 }, { "number": 4, "text": "Read to download", "suffix": "", "stateLoading": 4, "stateDone": 4 }];
        downloadStatus = React.createElement(DownloadStatusBox, { state: this.state.state, steps: steps, error_code: this.state.message });

        if (this.state.state === 4) {
          downloadButton = React.createElement(
            "div",
            { className: "field is-grouped mt-1" },
            React.createElement(
              "p",
              { className: "control" },
              React.createElement(
                "a",
                { className: "button is-info", download: true, href: "/api/job/download/" + this.state.jobid + "/" + this.state.format },
                "Download"
              )
            ),
            React.createElement(
              "p",
              { className: "control" },
              React.createElement("input", { className: "button is-info", value: "Reset", type: "reset" })
            )
          );
        } else if (this.state.state === -1) {
          downloadButton = React.createElement(
            "div",
            { className: "field is-grouped mt-1" },
            React.createElement(
              "p",
              { className: "control" },
              React.createElement("input", { className: "button is-info", value: "Reset", type: "reset" })
            )
          );
        }

        downloadBox = React.createElement(
          "div",
          { className: "" },
          React.createElement(
            "div",
            { className: "container" },
            downloadStatus
          ),
          downloadButton
        );
      }

      return React.createElement(
        "form",
        { onSubmit: this.handleSubmit, onReset: this.restart },
        React.createElement(
          "div",
          { className: "field has-addons has-addons-centered" },
          React.createElement(
            "div",
            { className: "control" },
            React.createElement(
              "span",
              { className: "select" },
              React.createElement(
                "select",
                { disabled: this.state.downloading, onChange: this.handleFormatChange, value: this.state.format },
                React.createElement(
                  "option",
                  { value: "audio_only" },
                  "Audio Only"
                ),
                React.createElement(
                  "option",
                  { value: "video_only" },
                  "Video Only"
                ),
                React.createElement(
                  "option",
                  { value: "both" },
                  "Audio + Video"
                )
              )
            )
          ),
          React.createElement(
            "div",
            { className: "control is-expanded" },
            React.createElement("input", { className: "input", disabled: this.state.downloading, type: "text", placeholder: "Source URL", onChange: this.handleURLChange, value: this.state.url })
          ),
          React.createElement(
            "div",
            { className: "control" },
            React.createElement(
              "button",
              { disabled: this.state.downloading, className: "button is-info" },
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