/*
Copyright 2022 Steven Su

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

import React from 'react';

const StatusLine = (props: { itemNumber: number, text: string, suffix: string, stateDone: number, stateNumber: number, stateLoading: number }) => {
    const prefix = "Step " + props.itemNumber + ": ";
    const body = props.text;
    const suffix = props.suffix;
    var status_color, icon;
    if (props.stateNumber === props.stateLoading && props.stateNumber !== props.stateDone) {
        status_color = "has-text-info";
        icon = <i className="fas fa-sync fa-spin"></i>;
    } else if (props.stateNumber >= props.stateDone) {
        status_color = "has-text-success";
        icon = <i className="fas fa-check"></i>;
    } else {
        status_color = "grey-lighter";
        icon = null;
    }
    return <span className={status_color}><b>{prefix}</b>{body + " " + suffix} {icon}</span>;
}

export default StatusLine;
