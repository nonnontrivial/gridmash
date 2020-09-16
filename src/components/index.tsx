/**
 * @fileoverview Exports all public components
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
    reconciliationCondition(a: S): boolean;
    reconcile(a: S, b: S): S;
    onReconciliation(rs: Reconciliation<S>): void;
    className?: string;
}

/**
 * Grid renders event-reconciling grid.
 *
 * When a motion is inputted this component attempts to produce an array of
 * reconciliations. Reconciliations are locations in the grid where 2 columns
 * should combine based on rules provided to the props and the values between
 * those columns. These reconciliations are each sent to the onReconciliation
 * callback prop.
 *
 * @param {Props} props Props passed to the component
 * @returns React node
 */
const Grid: React.FC<Props> = (props: Props): React.ReactElement => {
    // Mapping between direction and key event name.
    const keys = React.useMemo<Map<keyof typeof Motion, string>>(() => {
	if (props.keyMap) {
	    return props.keyMap;
	}
	return defaultKeyMap;
    }, [props.keyMap]);
    const data = React.useMemo(() => props.data, [props.data]);
    // Determine if an i and j paired with reconciliations should short circuit
    // a reconciliation loop.
    const containsQuitCondition = React.useCallback(
	(rs: Reconciliation[], i: number, j: number): boolean => {
	    const col = data[i][j];
	    if (!props.reconciliationCondition(col)) {
		return true;
	    } else if (rs.find(reconciliation => {
		const [x, y] = reconciliation.dst;
		return x === i && y === j;
	    })) {
		return true;
	    }
	    return false;
	}, [props.reconciliationCondition, data]);
    // TODO: implement remaining motions
    // Iterates over data in the direction of the motion.
    // This is done in order to have reconciliations built up in order.
    const reconcile = React.useCallback((motion: keyof typeof Motion): void => {
	const reconciliations: Reconciliation<Scalar>[] = [];
	switch (motion) {
	    case Motion.UP:
		break;
	    case Motion.DOWN:
		break;
	    case Motion.LEFT:
		break;
	    case Motion.RIGHT:
		for (const [i, row] of data.entries()) {
		    for (const [j] of row.entries()) {
			if (containsQuitCondition(reconciliations, i, j)) {
			    continue;
			}
			let jPrime = j;
			while (jPrime + 1 <= row.length -1) {
			    jPrime += 1;
			    if (props.reconciliationCondition(row[jPrime])) {
				break;
			    }
			}
			if (jPrime === j) {
			    continue;
			}
			reconciliations.push({
			    id: v4(),
			    result: props.reconcile(row[j], row[jPrime]),
			    motion,
			    src: [i, j],
			    dst: [i, jPrime],
			});
		    }
		}
		break;
	}
	for (const r of reconciliations) {
	    props.onReconciliation(r);
	}
    }, [data, props.reconciliationCondition, props.reconcile]);
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
    // TODO: allow cells to be passed as children
    const cells = React.useMemo(() => {
	return data.map((row, i) => {
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
    }, [data]);
    return (
	<div className={props.className}>
	    {cells}
	</div>
    );
};

export default Grid;

export {
    Grid,
}
