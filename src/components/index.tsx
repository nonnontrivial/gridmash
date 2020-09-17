/**
 * @fileoverview Defines Grid and exports all public components
 */
import * as React from "react";
import { v4 } from "uuid";
import {
    Scalar,
    defaultKeyMap,
    Grid as GridModel,
    Motion,
    KeyEvent,
    Reconciliation,
} from "../model";
import { default as Cell } from "./cell";

export * from "./cell";
export {
    Grid as GridModel,
    Scalar,
    Reconciliation,
    Motion,
    KeyEvent,
} from "../model";

interface Props<S extends Scalar = Scalar> {
    data: GridModel<S>
    keyMap?: Map<keyof typeof Motion, string>;
    keyEvent?: KeyEvent;
    cell?: React.ReactNode;
    reconciliationCondition(a: S): boolean;
    reconcile(a: S, b: S): S;
    onReconciliation(rs: Reconciliation<S>): void;
    className?: string;
}

/**
 * Grid renders an event-reconciling grid.
 *
 * When a motion is inputted this component attempts to produce an array of
 * reconciliations. Reconciliations are locations in the grid where 2 columns
 * should combine based on rules provided to the props and the values between
 * those columns. These reconciliations are each sent to the onReconciliation
 * callback prop. The component does not keep internal state.
 *
 * @param {Props} props Props passed to the component
 * @returns React node
 */
const Grid: React.FC<Props> = (props: Props): React.ReactElement => {
    const columns = React.useMemo(() => {
	const cs: GridModel<Scalar | number> = [];
	for (const [, row] of props.data.entries()) {
	    for (const [j, col] of row.entries()) {
		if (!cs[j]) {
		    cs.push([col]);
		} else {
		    cs[j].push(col);
		}
	    }
	}
	return cs;
    }, [props.data]);
    const rows = React.useMemo(() => {
	return props.data.map(row => row);
    }, [props.data]);
    // Determines if an i and j paired with reconciliations should short circuit
    // reconciliation loop.
    const containsQuitCondition = React.useCallback(
	(rs: Reconciliation[], i: number, j: number): boolean => {
	    const col = props.data[i][j];
	    if (!props.reconciliationCondition(col)) {
		return true;
	    } else if (rs.find(reconciliation => {
		const [x, y] = reconciliation.dst;
		return x === i && y === j;
	    })) {
		return true;
	    }
	    return false;
	}, [props.reconciliationCondition, props.data]);
    // TODO: Implement remaining motions and refactor
    // Finds all reconciliations in the data and sends them to the callback prop.
    const reconcile = React.useCallback((motion: keyof typeof Motion): void => {
	const reconciliations: Reconciliation<Scalar>[] = [];
	type Data = {
	    row: Scalar[],
	    i: number,
	    j: number,
	    jPrime: number,
	};
	const formReconciliation = (data: Data): Reconciliation<number> => {
	    const { row, i, j, jPrime } = data;
	    return {
		id: v4(),
		result: props.reconcile(row[j], row[jPrime]),
		motion,
		src: [i, j],
		dst: [i, jPrime],
	    }
	}
	switch (motion) {
	    case Motion.UP:
		break;
	    case Motion.DOWN:
		break;
	    case Motion.LEFT:
		break;
	    case Motion.RIGHT:
		break;
	}
	for (const r of reconciliations) {
	    props.onReconciliation(r);
	}
    }, [rows, columns, props.reconciliationCondition, props.reconcile]);
    // Mapping between direction and key event name.
    const keys = React.useMemo<Map<keyof typeof Motion, string>>(() => {
	if (props.keyMap) {
	    return props.keyMap;
	}
	return defaultKeyMap;
    }, [props.keyMap]);
    // Register event listener on motions to trigger reconciliations.
    React.useEffect(() => {
	const onKeyEvent = (e: React.KeyboardEvent<HTMLDivElement>) => {
	    switch (e.key) {
		case keys.get(Motion.UP):
		    reconcile(Motion.UP);
		    break;
		case keys.get(Motion.DOWN):
		    reconcile(Motion.DOWN);
		    break;
		case keys.get(Motion.LEFT):
		    reconcile(Motion.LEFT);
		    break;
		case keys.get(Motion.RIGHT):
		    reconcile(Motion.RIGHT);
		    break;
	    }
	};
	const keyEvent = props.keyEvent ?? "keydown";
	window.addEventListener(keyEvent, onKeyEvent as any);
	return () => {
	    window.removeEventListener(keyEvent, onKeyEvent as any);
	}
    }, [props.keyMap]);
    // TODO: Figure out API around cells.
    const cells = React.useMemo(() => {
	return props.data.map((row, i) => {
	    return (
		<div
		    key={i}
		>
		    {row.map((col, j) => {
			return (
			    <Cell
				key={j}
				value={col}
			    />
			);
		    })}
		</div>
	    );
	});
    }, [props.data]);
    return (
	<div
	    className={props.className}
	>
	    {cells}
	</div>
    );
};

export default Grid;

export {
    Grid,
}
