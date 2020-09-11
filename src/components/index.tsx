/**
 * @fileoverview Exports all public components
 */
import * as React from "react";
import { v4 } from "uuid";
import {
    Scalar,
    defaultKeyMap,
    Grid as GridModel,
    Keys,
    KeyEvent,
    Reconciliation,
} from "../model";
import { default as Cell } from "./cell";

export * from "./cell";
export {
    Grid as GridModel,
    Scalar,
    Reconciliation,
    Keys,
    KeyEvent,
} from "../model";

interface Props<S extends Scalar = Scalar> {
    data: GridModel<S>
    keyMap?: Map<keyof typeof Keys, string>;
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
    const keys = React.useMemo<Map<keyof typeof Keys, string>>(() => {
	if (props.keyMap) {
	    return props.keyMap;
	}
	return defaultKeyMap;
    }, [props.keyMap]);
    const data = React.useMemo(() => props.data, [props.data]);
    // TODO: implement remaining motions
    const reconcile = React.useCallback((direction: keyof typeof Keys): void => {
	const reconciliations: Reconciliation<Scalar>[] = [];
	switch (direction) {
	    case Keys.RIGHT:
		for (const [i, row] of data.entries()) {
		    for (let [j, col] of row.entries()) {
			const jPrime = j;
			if (!props.reconciliationCondition(col)) {
			    continue;
			}
			// Skip in the case that this is already a target of a
			// reconciliation
			if (reconciliations.find(r => r.dst[1] === j)) {
			    continue;
			}
			while (++j <= row.length -1) {
			    // Match has been discovered
			    if (props.reconciliationCondition(row[j])) {
				break;
			    }
			}
			reconciliations.push({
			    id: v4(),
			    result: props.reconcile(col, row[j]),
			    direction,
			    src: [i, jPrime],
			    dst: [i, j],
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
		case keys.get(Keys.UP):
		    reconcile(Keys.UP);
		    break;
		case keys.get(Keys.DOWN):
		    reconcile(Keys.DOWN);
		    break;
		case keys.get(Keys.LEFT):
		    reconcile(Keys.LEFT);
		    break;
		case keys.get(Keys.RIGHT):
		    reconcile(Keys.RIGHT);
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

