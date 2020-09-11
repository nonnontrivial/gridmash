/**
 * @fileoverview Exports all public components
 */
import * as React from "react";
import { v4 } from "uuid";
import {
    Scalar,
    Keys,
    Grid as GridModel,
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
    reconciler(a: S, b: S): S;
    onReconciliation(rs: ArrayLike<Reconciliation<S>>): void;
    className?: string;
}

/**
 * Grid renders event-reconciling grid
 * @param {Props} props Props passed to the component
 * @abstract
 * 	Each non-zero element finds nearest non-zero element in direction
 * 	supplied by key event. `props.reconciler` is applied to these elements
 * 	taken together and an object describing the location and result of the
 * 	reconciliation is created.
 */
const Grid: React.FC<Props> = (props: Props): React.ReactElement => {
    // Define mapping between direction and key event name
    const keys = React.useMemo<Map<keyof typeof Keys, string>>(() => {
	if (props.keyMap) {
	    return props.keyMap;
	}
	return new Map([
	    [Keys.UP, "ArrowUp"],
	    [Keys.DOWN, "ArrowDown"],
	    [Keys.LEFT, "ArrowLeft"],
	    [Keys.RIGHT, "ArrowRight"],
	]);
    }, [props.keyMap]);
    const isNonzero = React.useCallback((n: Scalar | number) => {
	return n !== 0;
    }, []);
    const data = React.useMemo(() => props.data, [props.data]);
    const reconcile = React.useCallback((direction: keyof typeof Keys): void => {
	const reconciliations: Reconciliation<Scalar>[] = [];
	for (const [i, row] of data.entries()) {
	    for (const [j, col] of row.entries()) {
		if (!isNonzero(col)) {
		    continue;
		}
		const { length: rowLength } = row;
		const firstNonZeroScalar = col;
		let secondNonZeroScalar = col;
		let rowIndexOfTarget = i;
		let colIndexOfTarget = j;
		// Find row and column indices of cell to reconcile; skip in the
		// case that the current column is already direction-most
		switch (direction) {
		    case Keys.UP:
			if (i === 0) {
			    continue;
			}
			while (rowIndexOfTarget - 1 >= 0) {
			    rowIndexOfTarget -= 1;
			    if (isNonzero(data[rowIndexOfTarget][colIndexOfTarget])) {
				break;
			    }
			}
			break;
		    case Keys.DOWN:
			if (i === rowLength - 1) {
			    continue;
			}
			while (rowIndexOfTarget + 1 <= rowLength - 1) {
			    rowIndexOfTarget += 1;
			    if (isNonzero(data[rowIndexOfTarget][colIndexOfTarget])) {
				break;
			    }
			}
			break;
		    case Keys.LEFT:
			if (j === 0) {
			    continue;
			}
			while (colIndexOfTarget - 1 >= 0) {
			    colIndexOfTarget -= 1;
			    if (isNonzero(row[colIndexOfTarget])) {
				break;
			    }
			}
			break;
		    case Keys.RIGHT:
			if (j === rowLength - 1) {
			    continue;
			}
			while (colIndexOfTarget + 1 <= rowLength - 1) {
			    colIndexOfTarget += 1;
			    if (isNonzero(row[colIndexOfTarget])) {
				break;
			    }
			}
			break;
		}
		reconciliations.push({
		    id: v4(),
		    input: direction,
		    args: [firstNonZeroScalar, secondNonZeroScalar],
		    result: props.reconciler(firstNonZeroScalar, secondNonZeroScalar),
		    source: [i, j],
		    target: [rowIndexOfTarget, colIndexOfTarget],
		});
	    }
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

