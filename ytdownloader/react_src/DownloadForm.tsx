/*
Copyright 2022 Steven Su

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import React, { useState, useEffect, useRef } from 'react';
import DownloadStatusBox from './DownloadStatusBox';
import Reaptcha from 'reaptcha';

const DownloadForm = () => {
    const [downloading, setDownloading] = useState(false);
    const [url, setURL] = useState("");
    const [state, setState] = useState(0);
    const [format, setFormat] = useState("audio_only");
    const [message, setMessage] = useState("");
    const [error_retry, setErrorRetry] = useState(0);
    const [percent, setPercent] = useState("0%");
    const [jobid, setJobID] = useState("");
    const [downloadId, setDownloadId] = useState("");
    const [recaptcha, setRecaptcha] = useState("");
    const recaptchaRef = useRef<Reaptcha>(null);

    const restart = () => {
        setDownloading(false);
        setURL("");
        setJobID("");
        setState(0);
        setPercent("0%");
        setMessage("");
        setErrorRetry(0);
        setRecaptcha("");
        recaptchaRef.current!.reset();
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setDownloading(true);
        recaptchaRef.current!.execute();
    }

    const onVerify = (reCaptchaResponse: string) => {
        setRecaptcha(reCaptchaResponse);
        console.log(reCaptchaResponse);
        makeRequest(reCaptchaResponse);
    }

    const makeRequest = (token: string) => {
        fetch('/api/job/request', {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "url": url, "format": format, "recaptcha": token }),
        }).then(response => response.json())
            .then((data) => {
                if (data.state === "success") {
                    setState(1); setDownloading(true);
                    setJobID(data.id); setPercent("0%"); setErrorRetry(0);
                    setDownloadId(data.id);
                } else {
                    setJobID(""); setState(-1); setMessage(data.message);
                }
            },
                (error) => {
                    if (error_retry < 3) {
                        setErrorRetry(error_retry + 1);
                        makeRequest(token);
                    } else {
                        setJobID(""); setState(-1); setMessage("Error: " + error);
                    }
                });
    }

    const checkStatus = () => {
        if (jobid === null) {
            return;
        }
        fetch('/api/job/status', {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "id": jobid }),
        }).then(response => response.json())
            .then((data) => {
                if (data.state === "downloading" && state !== 2) {
                    setState(2); setPercent(data.percent); setErrorRetry(0);
                } else if (data.state === "downloading" && state === 2) {
                    setPercent(data.percent); setErrorRetry(0);
                } else if (data.state === "processing" && state !== 3) {
                    setState(3); setPercent("100%"); setErrorRetry(0);
                } else if ((data.state === "done" && state !== 4)) {
                    // NOTE: in the future, we might want to set downloadId here
                    setState(4); setPercent("100%"); setErrorRetry(0); setJobID("");
                } else if (data.state === "error") {
                    if (error_retry > 5) {
                        setJobID(""); setState(-1); setMessage(data.message); setErrorRetry(0);
                    } else {
                        setErrorRetry(error_retry + 1);
                    }
                }
            },
                (error) => {
                    if (error_retry > 5) {
                        setJobID(""); setState(-1); setMessage("Error: " + error); setErrorRetry(0);
                    } else {
                        setErrorRetry(error_retry + 1);
                    }
                });
    }

    // effect to check status
    useEffect(() => {
        if (jobid === "") {
            return;
        }
        const interval = setInterval(() => {
            checkStatus();
        }, 500);
        return () => clearInterval(interval);
    }, [jobid, error_retry, state]);

    let downloadStatus;
    let downloadButton = null;
    if (downloading) {
        var steps = [
            { "number": 1, "text": "Queue download request", "suffix": "", "stateLoading": 1, "stateDone": 2 },
            { "number": 2, "text": "Video downloading on server", "suffix": "(" + percent + ")", "stateLoading": 2, "stateDone": 3 },
            { "number": 3, "text": "Post-processing and conversion", "suffix": "", "stateLoading": 3, "stateDone": 4 },
            { "number": 4, "text": "Read to download", "suffix": "", "stateLoading": 4, "stateDone": 4 }
        ];
        downloadStatus = <DownloadStatusBox state={state} steps={steps} error_code={message} />;

        if (state === 4) {
            downloadButton = <div className="field is-grouped mt-1">
                <p className="control"><a className="button is-info" download href={`/api/job/download/${downloadId}/${format}`}>Download</a></p>
                <p className="control"><input className="button is-info" value="Reset" type="reset" /></p>
            </div>;
        } else if (state === -1) {
            downloadButton = <div className="field is-grouped mt-1">
                <p className="control"><input className="button is-info" value="Reset" type="reset" /></p>
            </div>;
        }
    }

    return (
        <form onSubmit={(e) => { handleSubmit(e) }} onReset={restart}>
            <div className="field has-addons has-addons-centered">
                <div className="control">
                    <span className="select">
                        <select disabled={downloading} onChange={(e) => setFormat(e.target.value)} value={format}>
                            <option value="audio_only">Audio Only</option>
                            <option value="video_only">Video Only</option>
                            <option value="both">Audio + Video</option>
                        </select>
                    </span>
                </div>
                <div className="control is-expanded">
                    <input className="input" required disabled={downloading} type="text" placeholder="Source URL" onChange={(e) => setURL(e.target.value)} value={url} />
                </div>
                <div className="control">
                    <button disabled={downloading} className="button is-info">
                        Download
                    </button>
                </div>
            </div>
            <div className="">
                <div className="container">
                    {downloadStatus}
                </div>
                {downloadButton}
            </div>
            <Reaptcha
                sitekey="6LeLwa4UAAAAAC_thqr9XaTPOMeyUFJIasdZfA7X"
                size="invisible"
                onVerify={onVerify}
                ref={recaptchaRef}
            />
        </form>
    );
}

export default DownloadForm;
