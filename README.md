# gridmash

![Node.js CI](https://github.com/nonnontrivial/gridmash/workflows/Node.js%20CI/badge.svg)

> components for reconciling grids of scalar values

> **Note:** Project is **unstable** and extremely **early phase**

## Purpose

`gridmash` is designed for _reconciliing grids of values in a user-definable and predictable way_.

## Components

|Component | Implemented | PR | Issue |
|:---------|:-----------:|:--:|:-----:|
|Grid      |✔️            |-   |-      |
|Cell      |✔️            |-   |-      |

## Installation

```shell
npm install gridmash
```

## API Overview

### Basic Rendering

The following example shows how to use `Grid` and `Cell` to render a reconciler.

`<Grid />` will map arrow key press events to **reconciliations** in the grid between
two viable cell values.

A reconciliation is defined by `props.reconcile`, and occurs when two cell values
fulfill `props.reconciliationCondition` and are in the motion-dependant path of
one another.

> `Grid` **does not have internal state**. It assumes that any reconciliation it
identifies should be passed back into its `data` prop if it is desired to have
`Grid` update with new cell values.

```tsx
import * as React from "react";
import {
    Grid,
    GridModel,
    Scalar,
    Cell,
} from "gridmash";

interface Props {}

export default (props: Props): React.ReactElement => {
    const [data, setData] = React.useState<GridModel<Scalar>>([
	[0, 0, 0],
	[0, 0, 0],
	[0, 3, 3],
    ]);
    return (
	<Grid
	    // 2d array of scalar values that each cell should hold.
	    data={data}
	    // How each inner value should be rendered.
	    cell={(value: Scalar, key: string) => {
		return (
		    <Cell
			value={value}
			key={key}
			style={{
			    display: "inline-block",
			    padding: "20px",
			}}
		    />
		);
	    }}
	    // The operation to perform between two cells when they reconcile.
	    reconcile={(a, b) => a + b}
	    // What must be true about a cell in order for it to reconcile.
	    reconciliationCondition={a => a % 2 === 0 && a !== 0}
	    // What to do when a reconciliation is found.
	    onReconciliation={(reconciliation) => {
		console.log(reconciliation);
	    }}
	/>
    );
}
```

### Mapping Custom Input Keys

`Grid` can accept a `keyMap` prop which allows you to define what events should be mapped to which directions of movement in the grid.

```tsx
import {
    Grid,
    Motion,
} from "gridmash";

interface Props {}

export default (props: Props): React.ReactElement => {
    // This is the default mapping which relates motions to keydown events.
    const keyMap = new Map([
	[Motion.UP, "ArrowUp"],
	[Motion.DOWN, "ArrowDown"],
	[Motion.LEFT, "ArrowLeft"],
	[Motion.RIGHT, "ArrowRight"],
    ]);
    return (
	<Grid
	    data={[[]]}
	    keyMap={keyMap}
	/>
    );
}
```

