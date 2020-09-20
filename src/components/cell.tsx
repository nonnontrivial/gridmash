/**
 * @fileoverview Defines Cell component
 */
import * as React from "react";
import { Scalar } from "../model";

interface Props<S extends Scalar = Scalar> {
    value: S;
    ref?: React.Ref<any>;
    style?: {
	[key: string]: string | number;
    };
    onClick?(e: React.MouseEvent): void;
    onMouseEnter?(e: React.MouseEvent): void;
    onMouseLeave?(e: React.MouseEvent): void;
}

/**
 * Cell renders a value-holding cell.
 *
 * @param {Props} props Props passed to the component
 * @returns React node
 */
const Cell: React.FC<Props> = (props: Props): React.ReactElement => {
    return (
	<div
	    style={props.style}
	    ref={props.ref}
	    onClick={props.onClick}
	    onMouseEnter={props.onMouseEnter}
	    onMouseLeave={props.onMouseLeave}
	>
	    {props.value}
	</div>
    );
}

export {
    Cell,
}

