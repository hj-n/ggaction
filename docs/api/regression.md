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

The action namespaces every generated resource with the target point mark ID.
For a point mark named `points`, it creates immutable `pointsRegressionData`,
a `pointsRegressionBands` area layer, and a `pointsRegressionLines` line layer.
This allows multiple point layers to add independent regressions in one
program. The action delegates to wrapped statistical, encoding, and
materialization actions instead of compiling semantic state.

```text
createRegression
├─ createRegressionData
├─ createRegressionBand
│  ├─ createAreaMark
│  ├─ encodeX
│  ├─ encodeYRange
│  ├─ encodeGroup?
│  └─ rematerializeAreaMark
└─ createRegressionLine
   ├─ createLineMark
   ├─ encodeX
   ├─ encodeY
   ├─ encodeColor?
   ├─ encodeGroup?
   └─ rematerializeLineMark
```

## Related

[Regression scatterplot tutorial](../tutorials/regression-scatterplot.md) ·
[Data](./data.md) · [Marks](./marks.md) · [Encodings](./encodings.md) ·
[Guides](./guides.md)
