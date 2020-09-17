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
import { Props as CellProps } from "./cell";

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
    cell: React.FC<CellProps>;
    keyMap?: Map<keyof typeof Motion, string>;
    keyEvent?: KeyEvent;
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
    type Pair = [Scalar, Scalar]
    type Locations = Set<Pair>;
    // TODO: document
    const reconcileMarkedLocations = React.useCallback(
	(locations: Locations, lastLocation: Pair, motion: keyof typeof Motion): void => {
	    const [ii, jj] = lastLocation;
	    const markedLocations = locations;
	    // In the case that there are not an even number of elements
	    // to reconcile, the last added element should be removed.
	    if (markedLocations.size % 2 !== 0) {
		markedLocations.delete([ii, jj]);
	    }
	    let prev: [Scalar, Scalar] | null = null;
	    let index = 0;
	    for (const l of markedLocations) {
		if (index % 2 === 0) {
		    prev = l;
		    index += 1;
		    continue;
		}
		index += 1;
		const [rowIndexA, colIndexA] = prev;
		const [rowIndexB, colIndexB] = l;
		const a = props.data[rowIndexA][colIndexA];
		const b = props.data[rowIndexB][colIndexB];
		props.onReconciliation({
		    id: v4(),
		    motion,
		    args: [a, b],
		    result: props.reconcile(a, b),
		    location: {
			src: [rowIndexA, colIndexA],
			dst: [rowIndexB, colIndexB],
		    },
		});
	    }
	}, [rows, columns]);
    // Finds all reconciliations in the data and sends them to the callback prop.
    const reconcile = React.useCallback((motion: keyof typeof Motion): void => {
	const [column] = columns;
	const [row] = props.data;
	const columnSize = column.length;
	const rowSize = row.length;
	// Motions establish locations where reconciliations should take place.
	switch (motion) {
	    case Motion.UP:
		for (let j = columnSize - 1; j >= 0; j -= 1) {
		    const locationsInColumn: Locations = new Set([]);
		    const i = rowSize - 1;
		    let ii = i;
		    while (ii - 1 >= 0) {
			const value = props.data[ii][j];
			if (props.reconciliationCondition(value)) {
			    locationsInColumn.add([ii, j]);
			}
			ii -= 1;
		    }
		    reconcileMarkedLocations(locationsInColumn, [ii, j], motion);
		}
		break;
	    case Motion.DOWN:
		for (const [j] of columns.entries()) {
		    const locationsInColumn: Locations = new Set([]);
		    const i = 0;
		    let ii = i;
		    while (ii + 1 <= rowSize - 1) {
			ii += 1;
			const value = props.data[ii][j];
			if (props.reconciliationCondition(value)) {
			    locationsInColumn.add([ii, j]);
			}
		    }
		    reconcileMarkedLocations(locationsInColumn, [ii, j], motion);
		}
		break;
	    case Motion.LEFT:
		for (const [i, r] of rows.entries()) {
		    const locationsInRow: Locations = new Set([]);
		    let jj = rowSize - 1;
		    for (let j = jj; j >= 0; j -= 1) {
			jj = j;
			const value = r[j];
			if (props.reconciliationCondition(value)) {
			    locationsInRow.add([i, j]);
			}
		    }
		    reconcileMarkedLocations(locationsInRow, [i, jj], motion);
		}
		break;
	    case Motion.RIGHT:
		for (const [i, r] of rows.entries()) {
		    const locationsInRow: Locations = new Set([]);
		    let jj = 0;
		    for (const [j, value] of r.entries()) {
			jj = j;
			if (props.reconciliationCondition(value)) {
			    locationsInRow.add([i, j]);
			}
		    }
		    reconcileMarkedLocations(locationsInRow, [i, jj], motion);
		}
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
    // Store the cells to render.
    const cells = React.useMemo(() => {
	const { cell: Cell } = props;
	return props.data.map((row, i) => {
	    return (
		<div
		    key={i}
		>
		    {row.map((col, j) => {
			return (
			    <Cell
				key={j}
			    >
				<span>{col}</span>
			    </Cell>
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
