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
    onReconciliation(rs: ArrayLike<Reconciliation<S>>): void;
    className?: string;
}

/**
 * Grid renders event-reconciling grid
 * @param {Props} props Props passed to the component
 */
const Grid: React.FC<Props> = (props: Props): React.ReactElement => {
    // Define mapping between direction and key event name
    const keys = React.useMemo<Map<keyof typeof Motion, string>>(() => {
	if (props.keyMap) {
	    return props.keyMap;
	}
	return defaultKeyMap;
    }, [props.keyMap]);
    const data = React.useMemo(() => props.data, [props.data]);
    // Determine if a certain i and j paired with reconciliations should short
    // circuit a reconciliation loop
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
		    for (const [j, col] of row.entries()) {
			if (containsQuitCondition(reconciliations, i, j)) {
			    continue;
			}
			let jPrime = j;
			while (jPrime + 1 <= row.length -1) {
			    jPrime += 1;
			    // Match has been discovered and motion should halt
			    if (props.reconciliationCondition(row[jPrime])) {
				break;
			    }
			}
			// No reconciliation was found in this case
			if (jPrime === j) {
			    continue;
			}
			reconciliations.push({
			    id: v4(),
			    result: props.reconcile(col, row[jPrime]),
			    motion,
			    src: [i, j],
			    dst: [i, jPrime],
			});
		    }
		}
		break;
	}
	props.onReconciliation(reconciliations);
    }, [data]);
    // Use an event listener to trigger reconciliations
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
	const defaultKeyEvent = "keydown";
	const keyEvent = props.keyEvent ?? defaultKeyEvent;
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

