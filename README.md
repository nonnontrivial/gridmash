# gridmash

![Node.js CI](https://github.com/nonnontrivial/gridmash/workflows/Node.js%20CI/badge.svg)

> components for reconciling grids of scalar values

> **Note:** Project is **unstable** and extremely **early phase**

## Purpose

`gridmash` is designed for _reconciliing grids of values in a predictable way_.

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

```tsx
import * as React from "react";
import {
    Grid,
    GridModel,
    Scalar,
} from "gridmash";

interface Props {}

export default (props: Props): React.ReactElement => {
    const [data, setData] = React.useState<GridModel<Scalar>>([[]]);
    return (
	<Grid
	    data={data}
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
    Keys,
} from "gridmash";

export default () => {
    const keyMap = new Map([
	[Keys.UP, "ArrowUp"],
	[Keys.DOWN, "ArrowDown"],
	[Keys.LEFT, "ArrowLeft"],
	[Keys.RIGHT, "ArrowRight"],
    ]);
    return (
	<Grid
	    data={[[]]}
	    keyMap={keyMap}
	/>
    );
}
```

