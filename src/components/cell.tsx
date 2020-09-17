/**
 * @fileoverview Defines Cell component
 */
import * as React from "react";

export interface Props {
    children: React.ReactElement;
    style?: {
	[key: string]: string | number;
    };
}

/**
 * Cell renders a value-holding cell.
 *
 * @param {Props} props Props passed to the component
 * @returns React node
 */
const Cell: React.FC<Props> = (props: Props): React.ReactElement => {
    return (
	<div style={{ display: "inline-block", ...props.style }}>
	    {props.children}
	</div>
    );
}

export {
    Cell,
}

