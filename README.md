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
    const [data, setData] = React.useState<GridModel<Scalar>>([]);
    return (
	<Grid
	    data={data}
	/>
    );
}
```

