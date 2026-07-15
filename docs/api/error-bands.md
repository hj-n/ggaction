---
layout: default
title: Error Bands
---

# Error Bands

`createErrorBand()` creates a vertical confidence or interval ribbon as one
ordinary area layer. It can derive grouped interval rows or consume existing
center/lower/upper fields.

## `createErrorBand(options?)`

The following runnable fragment assumes `gapminder` is an in-memory array of
row objects loaded by the application.

```javascript
import { chart } from "ggaction";

const program = chart()
  .createCanvas({
    width: 760,
    height: 480,
    margin: { top: 90, right: 150, bottom: 70, left: 80 }
  })
  .createData({ values: gapminder })
  .createErrorBand({
    x: { field: "year", fieldType: "temporal" },
    y: { field: "life_expect" },
    groupBy: "cluster"
  })
  .encodeColor({
    target: "errorBand",
    field: "cluster",
    scale: { palette: "tableau10" }
  })
  .createGuides();
```

```typescript
createErrorBand({
  id?: string;
  target?: string;
  data?: string;
  x?: PositionChannel;
  y?: StatisticalIntervalChannel | ExplicitIntervalChannel;
  groupBy?: string;
  coordinate?: string;
  fill?: string;
  opacity?: number;
} = {})
```

The current vertical contract uses:

```typescript
type PositionChannel = {
  field?: string;
  fieldType?: "quantitative" | "temporal";
  scale?: ScaleOptions;
};

type StatisticalIntervalChannel = {
  field?: string;
  center?: "mean" | "median";
  extent?: "stderr" | "stdev" | "ci" | "iqr";
  level?: number;
  scale?: ScaleOptions;
};

type ExplicitIntervalChannel = {
  center: string;
  lower: string;
  upper: string;
  scale?: ScaleOptions;
};
```

Statistical mode defaults to a mean, two-sided `0.95` Student-t confidence
interval. The independent x field is always part of grouping; `groupBy` adds
one series field. Group and path order follow first appearance in the source.

Explicit mode uses the current dataset directly. It retains the center field
for the inferred axis title, while the closed area geometry uses lower and
upper fields.

## Inference and ownership

If x or y is omitted, the action selects an encoded source by explicit
`target`, then the current eligible layer, then one unique eligible layer. It
reuses that layer's data, coordinate, scales, and explicit group encoding.
Two quantitative source axes are ambiguous unless an interval option identifies
the interval axis.

The first omitted ID is `"errorBand"`; statistical rows use
`"errorBandIntervalData"`. A second band requires an explicit ID. The action
records one `createErrorBand` trace node with wrapped interval-data, area,
position-range, and grouping children.

`fill` and `opacity` default to the area defaults. Field-driven fill remains an
explicit `encodeColor` call so color, grouping, and legend ownership stay
separate.

## Current boundary

Horizontal bands, curved area edges, and optional lower/upper boundary lines
are not implemented yet. Supplying those options is rejected instead of being
silently ignored.
