---
layout: default
title: Error Bars
---

# Error Bars

`createErrorBar()` derives grouped statistical intervals and materializes one
vertical rule with two fixed-width caps per group. It can infer its inputs from
an already encoded layer or accept the two required fields directly.

## At a glance

| Action | Shortest call | Result |
| --- | --- | --- |
| `createErrorBar` | `createErrorBar()` after one eligible encoded layer | Mean 95% confidence intervals sharing that layer's data, coordinate, and scales |

## `createErrorBar(options?)`

```javascript
const intervals = chart()
  .createCanvas()
  .createData({ values })
  .createErrorBar({
    x: { field: "group", fieldType: "nominal" },
    y: { field: "value" }
  });
```

```typescript
createErrorBar({
  id?: string;
  target?: string;
  data?: string;
  x?: {
    field?: string;
    fieldType?: "nominal" | "ordinal" | "temporal";
    scale?: ScaleOptions;
  };
  y?: {
    field?: string;
    center?: "mean" | "median";
    extent?: "stderr" | "stdev" | "ci" | "iqr";
    level?: number;
    scale?: ScaleOptions;
  };
  groupBy?: string;
  coordinate?: string;
} = {})
```

The current action creates vertical statistical intervals. The x field must be
nominal, ordinal, or temporal; y must be quantitative. Mean defaults to a
two-sided `0.95` Student-t confidence interval. Median is supported only with
`extent: "iqr"`. A supplied `level` is valid only for `extent: "ci"`.

The independent x field is always part of the grouping. `groupBy` can add one
more grouping field when separate intervals are required at each x position.
Group order follows first appearance in the source data. Groups without enough
valid quantitative values are omitted.

## Inference from an encoded layer

```javascript
const overlay = chart()
  .createCanvas()
  .createData({ values })
  .createPointMark()
  .encodeX({ field: "group", fieldType: "ordinal" })
  .encodeY({ field: "value" })
  .createErrorBar();
```

With omitted x and y, `target` selects an existing layer. Without `target`, the
action uses the current eligible layer, then one unique eligible layer. The
layer may use any compatible mark type; eligibility comes from its complete
field-based x/y encodings. Data, coordinate, and x/y scale IDs are reused.

A semantic `group` encoding is inferred as statistical grouping. Color remains
appearance and does not silently change the statistic. Ambiguous eligible
layers fail instead of selecting one arbitrarily.

## Defaults and graphical result

| Behavior | Default |
| --- | --- |
| ID | `"errorBar"` when available |
| Center and extent | mean, confidence interval |
| Confidence level | `0.95` |
| Coordinate | inferred, otherwise `"main"` Cartesian |
| Main rule and caps | `#4c78a8`, width `2`, solid, opacity `1` |
| Cap width | `8` logical Canvas pixels |

Caps preserve their logical-pixel width when the Canvas or positional scales
change. `createGuides()` infers the independent field title and a statistical
y title such as `mean(value)`.

## Errors and current limitations

The action rejects missing data, incompatible or ambiguous source layers,
unsupported x/y orientation, invalid statistics, and occupied generated IDs.
Failed calls leave the earlier immutable program unchanged.

Horizontal intervals, precomputed lower/upper fields, cap removal, custom cap
size, and custom error-bar appearance are not supported by this action yet.

## Related

[Error-bar tutorial](../tutorials/error-bar.md) ·
[Interval data](./data.md#createintervaldata-id-source-field-groupby-center-extent-level-as) ·
[Rule marks](./marks.md) · [Guides](./guides.md)
