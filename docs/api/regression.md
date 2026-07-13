---
layout: default
title: Regression
---

# Regression

`createRegression()` layers a grouped linear fit and mean-response confidence
band over an existing quantitative point mark.

```javascript
const program = points.createRegression();
```

The shortest call infers the target from the current or only eligible point
mark, x/y from its quantitative positions, and group from the unique nominal
field used by color and/or shape. Dataset, Cartesian coordinate, and x/y scales
come from that point layer. Inference fails rather than choosing among multiple
targets or group fields. Explicit `groupBy: undefined` requests one model.

```javascript
program.createRegression({
  confidence: 0.95,
  band: { color: "#111111", opacity: 0.18 },
  line: { strokeWidth: 3 }
});
```

| Option | Type | Default |
| --- | --- | --- |
| `target` | eligible point mark ID | inferred |
| `x`, `y` | quantitative field names | target x/y fields |
| `groupBy` | nominal field name or `undefined` | unique color/shape field |
| `confidence` | number strictly between `0` and `1` | `0.95` |
| `band.color` | color string | `"#111111"` |
| `band.opacity` | number from `0` to `1` | `0.18` |
| `line.strokeWidth` | non-negative finite number | `3` |

The action keeps each fitted dataset, band, and line associated with its target
point mark, so multiple point layers can add independent regressions in one
program. The exact generated IDs are internal and are not required in ordinary
chart-authoring code.

Its trace records `createRegressionData`, `createRegressionBand`, and
`createRegressionLine` as meaningful children. See
[Actions and trace trees](../concepts/actions-and-trace.md) when that
decomposition matters.

## Related

[Regression scatterplot tutorial](../tutorials/regression-scatterplot.md) ·
[Data](./data.md) · [Marks](./marks.md) · [Encodings](./encodings.md) ·
[Guides](./guides.md)
