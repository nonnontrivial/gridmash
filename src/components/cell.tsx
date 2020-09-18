/**
 * @fileoverview Defines Cell component
 */
import * as React from "react";
import { Scalar } from "../model";

interface Props<S extends Scalar = Scalar> {
    value: S;
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
	<div style={{ ...props.style }}>
	    {props.value}
	</div>
    );
}

export {
    Cell,
}

