---
layout: default
title: Box Plots
---

# Box Plots

`createBoxPlot` creates vertical or horizontal box plots from one categorical
field and one quantitative field. It derives immutable summary data and
composes ordinary ranged-bar, error-bar, rule, and optional point actions.

```javascript
import { chart } from "ggaction";

const program = chart()
  .createCanvas({
    width: 360,
    height: 460,
    margin: { top: 140, right: 40, bottom: 70, left: 80 }
  })
  .createData({ values: cars })
  .createBoxPlot({
    x: { field: "Origin", fieldType: "nominal" },
    y: { field: "Miles_per_Gallon" }
  });
```

## Signature

```javascript
createBoxPlot({
  id?, target?, data?, x?, y?, coordinate?, whisker?, width?, outliers?,
  box?, median?, outlier?
} = {})
```

| Option | Meaning | Default or inference |
| --- | --- | --- |
| `id` | box-body owner ID | first instance uses `"boxPlot"` |
| `target` | compatible encoded source layer | current, then unique eligible layer |
| `data` | source dataset | source layer, then current dataset |
| `x` | categorical or quantitative field and optional scale | inferred from `target` when omitted |
| `y` | categorical or quantitative field and optional scale | inferred from `target` when omitted |
| `coordinate` | Cartesian coordinate ID | source coordinate, then `"main"` |
| `whisker` | `{ type: "tukey", factor? }` or `{ type: "minmax" }` | Tukey with factor `1.5` |
| `width` | `{ band }`, where `0 < band < 1` | `{ band: 0.7 }` |
| `outliers` | create Tukey outlier resources | `true` |
| `box` | `fill`, `opacity`, `stroke`, `strokeWidth` | blue, opaque, `1.5` stroke |
| `median` | `stroke`, `strokeWidth` | dark stroke with width `1.5` |
| `outlier` | `shape`, `radius`, `opacity` | black diamond, radius `3`, opacity `0.75` |

`createBoxPlot()` may also establish an incomplete owner first. Compatible
`encodeX` and `encodeY` calls can follow later; the completed semantic and
graphical state is the same as supplying both channels at creation time.

The category/measure pairing determines orientation. This horizontal min–max
example creates no outlier resources:

```javascript
program.createBoxPlot({
  x: { field: "Horsepower" },
  y: { field: "Origin", fieldType: "nominal" },
  whisker: { type: "minmax" }
});
```

Tukey factor and component appearance can be changed together without exposing
the child marks:

```javascript
program.createBoxPlot({
  x: { field: "Origin", fieldType: "nominal" },
  y: { field: "Miles_per_Gallon" },
  whisker: { type: "tukey", factor: 1 },
  width: { band: 0.5 },
  box: { fill: "#f28e2b", opacity: 0.82, stroke: "#9a3412", strokeWidth: 2 },
  median: { stroke: "#431407", strokeWidth: 3 },
  outlier: { shape: "diamond", radius: 4, opacity: 0.9 }
});
```

Set `outliers: false` to keep the Tukey summary and whiskers without creating
an outlier dataset, layer, or graphic.

## Current statistical and visual defaults

- Quartiles use linear interpolation at `(n - 1) × p`.
- Whiskers use the most extreme observed values inside `1.5 × IQR` fences.
- `{ type: "minmax" }` instead uses each category's observed minimum and
  maximum and never creates an outlier dataset, layer, or graphic.
- Missing category or measure rows are omitted; non-missing non-finite measures
  are errors.
- Category order follows first valid source appearance.
- Box width is `0.7` of the category band and box opacity is `1`.
- Box borders, medians, whiskers, and caps use `1.5` logical pixels.
- Outliers are black diamonds with radius-equivalent size `3` and opacity
  `0.75`. No outlier resource is created when no outlier row exists.

The summary and optional outlier datasets, child layers, and graphics use
deterministic IDs derived from the owner. Canvas or shared-scale changes
explicitly rematerialize boxes, medians, whiskers, caps, and outliers.

## Current limitations

`createBoxPlot` is a create-only aggregate; there is no `editBoxPlot` action.
Subgroup offsets, notches, variable-width boxes, and custom whisker appearance
are not implemented.

## Related

[Marks](./marks.md) · [Encodings](./encodings.md) ·
[Error bars](./error-bars.md) · [Guides](./guides.md)
