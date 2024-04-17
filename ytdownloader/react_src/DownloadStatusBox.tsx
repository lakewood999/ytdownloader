/*
Copyright 2022 Steven Su

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import React from 'react';
import StatusLine from './StatusLine';

export type DownloadStep = { number: number, text: string, suffix: string, stateDone: number, stateLoading: number };

const DownloadStatusBox = (props: {
    state: number,
    steps: DownloadStep[],
    error_code: string
}) => {
    let out = null;
    if (props.state !== -1) {
        out = props.steps.map(
            (step) => <div key={step.number}><StatusLine itemNumber={step.number}
                text={step.text}
                suffix={step.suffix}
                stateNumber={props.state}
                stateDone={step.stateDone}
                stateLoading={step.stateLoading}
            /><br /></div>
        )
    } else {
        out = <span className="has-text-danger"><b>Message: </b>An error has occurred. Please check URL or contact an administrator. Error details: {props.error_code}</span>;
    }
    return <div>{out}</div>;
}

export default DownloadStatusBox;
