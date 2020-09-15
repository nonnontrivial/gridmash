/**
 * @fileoverview Defines Cell component
 */
import * as React from "react";
import { Scalar } from "../model";

interface Props<V extends Scalar = Scalar> {
    value: V;
    style?: {
	[key: string]: string | number;
    };
}

/**
 * Cell renders a cell which holds a value
 * @param {Props} props Props passed to the component
 */
const Cell: React.FC<Props> = (props: Props): React.ReactElement => {
    return (
	<div style={{ display: "inline-block", ...props.style }}>
	    {props.value}
	</div>
    );
}

export default Cell;

