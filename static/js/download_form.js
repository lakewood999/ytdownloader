'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var e = React.createElement;

var Test = function (_React$Component) {
  _inherits(Test, _React$Component);

  function Test() {
    _classCallCheck(this, Test);

    return _possibleConstructorReturn(this, (Test.__proto__ || Object.getPrototypeOf(Test)).apply(this, arguments));
  }

  _createClass(Test, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "p",
        null,
        "Hello!"
      );
    }
  }]);

  return Test;
}(React.Component);

var DownloadForm = function (_React$Component2) {
  _inherits(DownloadForm, _React$Component2);

  function DownloadForm(props) {
    _classCallCheck(this, DownloadForm);

    var _this2 = _possibleConstructorReturn(this, (DownloadForm.__proto__ || Object.getPrototypeOf(DownloadForm)).call(this, props));

    _this2.state = { downloading: false, url: "", interval: null, jobid: "", state: 0 };

    _this2.handleURLChange = _this2.handleURLChange.bind(_this2);
    _this2.handleSubmit = _this2.handleSubmit.bind(_this2);
    _this2.makeRequest = _this2.makeRequest.bind(_this2);
    _this2.checkStatus = _this2.checkStatus.bind(_this2);
    _this2.restart = _this2.restart.bind(_this2);
    return _this2;
  }

  _createClass(DownloadForm, [{
    key: "handleURLChange",
    value: function handleURLChange(event) {
      this.setState({ url: event.target.value });
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
      var _this3 = this;

      this.setState({ downloading: true });
      fetch('/api/job/request', {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ "url": this.state.url })
      }).then(function (response) {
        return response.json();
      }).then(function (data) {
        _this3.setState({ state: 1, downloading: true, interval: setInterval(_this3.checkStatus, 500), jobid: data.id, percent: " 0%" });
      });
    }
  }, {
    key: "checkStatus",
    value: function checkStatus() {
      var _this4 = this;

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
        if (data.state === "downloading" && _this4.state.state !== 2) {
          _this4.setState({ state: 2, percent: data.percent });
        } else if (data.state === "downloading" && _this4.state.state === 2) {
          _this4.setState({ percent: data.percent });
        } else if (data.state === "processing" && _this4.state.state !== 3) {
          _this4.setState({ state: 3 });
        } else if (data.state === "done" && _this4.state.state !== 4) {
          _this4.setState({ state: 4, interval: clearInterval(_this4.state.interval), percent: " 100%" });
        } else if (data.state === "error") {
          _this4.setState({ state: -1, interval: null });
        }
      });
    }
  }, {
    key: "render",
    value: function render() {
      var downloadBox = React.createElement("p", null);
      var stepOneClass, stepTwoClass, stepThreeClass, stepFourClass;
      stepOneClass = stepTwoClass = stepThreeClass = stepFourClass = "grey-lighter";
      var stepOneText, stepTwoText, stepThreeText, stepFourText;
      stepOneText = stepTwoText = stepThreeText = stepFourText = "";
      var downloadButton = null;
      var message = "";
      if (this.state.downloading) {
        if (this.state.state === 0) {
          stepOneClass = "has-text-info";
          stepOneText = React.createElement("i", { className: "fas fa-sync fa-spin" });
        } else {
          stepOneClass = "has-text-success";
          stepOneText = React.createElement("i", { className: "fas fa-check" });
        }

        if (this.state.state === 2 || this.state.state === 1) {
          stepTwoClass = "has-text-info";
          stepTwoText = React.createElement(
            "span",
            null,
            React.createElement("i", { className: "fas fa-sync fa-spin" }),
            " ",
            this.state.percent
          );
        } else if (this.state.state >= 3) {
          stepTwoClass = "has-text-success";
          stepTwoText = React.createElement("i", { className: "fas fa-check" });
        }

        if (this.state.state === 3) {
          stepThreeClass = "has-text-info";
          stepThreeText = React.createElement("i", { className: "fas fa-sync fa-spin" });
        } else if (this.state.state >= 4) {
          stepThreeClass = "has-text-success";
          stepThreeText = React.createElement("i", { className: "fas fa-check" });
        }

        if (this.state.state === 4) {
          stepFourClass = "has-text-success";
          stepFourText = React.createElement("i", { className: "fas fa-check" });
          downloadButton = React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "a",
              { className: "button is-info", download: true, href: "/api/job/download/" + this.state.jobid },
              "Download"
            ),
            " ",
            React.createElement("input", { className: "button is-info", value: "Reset", type: "reset" })
          );
        }

        if (this.state.state === -1) {
          stepOneClass = stepTwoClass = stepThreeClass = stepFourClass = "has-text-danger";
          message = React.createElement(
            "span",
            null,
            React.createElement(
              "b",
              null,
              "Message: "
            ),
            "An error has occurred. Please check URL or contact an administrator!"
          );
          downloadButton = React.createElement(
            "div",
            { className: "container" },
            React.createElement("input", { className: "button is-info", value: "Reset", type: "reset" })
          );
        }
      }

      if (this.state.downloading) {
        downloadBox = React.createElement(
          "div",
          { className: "" },
          React.createElement(
            "div",
            { className: "container" },
            React.createElement(
              "span",
              { className: stepOneClass },
              React.createElement(
                "b",
                null,
                "Step 1: "
              ),
              " Queue download request ",
              stepOneText
            ),
            React.createElement("br", null),
            React.createElement(
              "span",
              { className: stepTwoClass },
              React.createElement(
                "b",
                null,
                "Step 2: "
              ),
              " Video downloading ",
              stepTwoText
            ),
            React.createElement("br", null),
            React.createElement(
              "span",
              { className: stepThreeClass },
              React.createElement(
                "b",
                null,
                "Step 3: "
              ),
              " Post-processing and conversion ",
              stepThreeText
            ),
            React.createElement("br", null),
            React.createElement(
              "span",
              { className: stepFourClass },
              React.createElement(
                "b",
                null,
                "Step 4: "
              ),
              " Ready to download ",
              stepFourText
            ),
            React.createElement("br", null),
            React.createElement(
              "span",
              { className: stepOneClass },
              message
            )
          ),
          downloadButton
        );
      }

      return React.createElement(
        "form",
        { onSubmit: this.handleSubmit, onReset: this.restart },
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
              { disabled: this.state.downloading, className: "button is-info" },
              "Download"
            )
          )
        ),
        downloadBox,
        React.createElement(Test, null)
      );
    }
  }]);

  return DownloadForm;
}(React.Component);

var domContainer = document.querySelector('#download_form');
ReactDOM.render(e(DownloadForm), domContainer);