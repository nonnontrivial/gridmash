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
|Cell      |-            |-   |-      |

## Installation

```shell
npm install gridmash
```

## API Overview

### Basic Rendering

The following example shows how to use `Grid` and `Cell` to render a reconciler.

`<Grid />` will map arrow key press events to reconciliations in the grid between
two viable cell values.

> `Grid` does not have internal state. It assumes that any reconciliation it
identifies should be passed back into its `data` prop.

```tsx
import * as React from "react";
import {
    Grid,
    GridModel,
    Scalar,
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
	    data={data}
	    reconcile={(a, b) => a + b}
	    reconciliationCondition={n => n % 2 === 0 && n !== 0}
	    onReconciliation={reconciliations => {
		for (const r of reconciliations) {
		    console.log(r);
		}
	    }}
	/>
    );
}
```

### Mapping Custom Input Keys

`Grid` can accept a `keyMap` prop which allows you to define what events should be mapped to which directions of movement in the grid.

The default mapping is shown in the example below.

```tsx
import {
    Grid,
    Motion,
} from "gridmash";

export default () => {
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

