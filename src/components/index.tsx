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
    // Effectively transpose the matrix in the data prop. 
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
    // Keep a local copy of the data that does not change across renders.
    const rows = React.useMemo(() => {
	return props.data.map(row => row);
    }, [props.data]);
    // Finds all reconciliations in the data and sends them to the callback prop.
    const reconcile = React.useCallback((motion: keyof typeof Motion): void => {
	const [column] = columns;
	const [row] = props.data;
	const columnSize = column.length;
	const rowSize = row.length;
	// Each motion established the locations where reconciliations should
	// take place.
	switch (motion) {
	    case Motion.UP:
		for (let j = columnSize - 1; j >= 0; j -= 1) {
		    const locationsInColumn: Set<[Scalar, Scalar]> = new Set([]);
		    const i = rowSize - 1;
		    let ii = i;
		    while (ii - 1 >= 0) {
			ii -= 1;
			const value = props.data[ii][j];
			if (props.reconciliationCondition(value)) {
			    locationsInColumn.add([ii, j]);
			}
		    }
		    // In the case that there are not an even number of elements
		    // to reconcile, the last added element should be removed.
		    if (locationsInColumn.size % 2 !== 0) {
			locationsInColumn.delete([ii, j]);
		    }
		    let prev: [Scalar, Scalar] | null = null;
		    let index = 0;
		    for (const l of locationsInColumn) {
			index += 1;
			if (index % 2 === 0) {
			    prev = l;
			    continue;
			}
			const [rowIndexA, colIndexA] = prev;
			const [rowIndexB, colIndexB] = l;
			const a = props.data[rowIndexA][colIndexA];
			const b = props.data[rowIndexB][colIndexB];
			props.onReconciliation({
			    id: v4(),
			    motion,
			    args: new Set([a, b]),
			    result: props.reconcile(a, b),
			    location: {
				src: new Set([rowIndexA, colIndexA]),
				dst: new Set([rowIndexB, colIndexB]),
			    },
			});
		    }
		}
		break;
	    case Motion.DOWN:
		break;
	    case Motion.LEFT:
		break;
	    case Motion.RIGHT:
		break;
	}
    }, [
	rows,
	columns,
	props.reconciliationCondition,
	props.reconcile,
	props.onReconciliation
    ]);
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
