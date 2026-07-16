---
layout: default
title: Bar Marks
---

# Bar Marks

Bar marks represent binned counts, aggregate categories, grouped or stacked
partitions, and observed quantitative intervals.

## `createBarMark({ id?, data? } = {})`

```javascript
const program = chart()
  .createData({ values: cars })
  .createBarMark()
  .encodeHistogram({ field: "Displacement" });
```

The first ID is `"bar"` and data defaults to current data. Creation starts with
an empty rect collection because binning, aggregation, stacking, grouping, and
width determine the final rectangle count and geometry.

For an aggregate bar, combine an ordinal position, quantitative aggregate, and
width:

```javascript
program
  .encodeX({ field: "year", fieldType: "ordinal" })
  .encodeY({ field: "perc", aggregate: "mean" })
  .encodeBarWidth({ band: 0.72 });
```

`encodeColor({ layout })` can arrange partitions with `stack`, `fill`, `group`,
`overlay`, or `diverging`. Group layout invokes `encodeXOffset` internally.
Observed interval bars instead combine one categorical axis with `encodeYRange`
or `encodeXRange`.

## `editBarMark({ target?, fill?, opacity?, stroke?, strokeWidth? })`

```javascript
program.editBarMark({
  opacity: 0.8,
  stroke: "#111827",
  strokeWidth: 1.5
});
```

The current or only bar is inferred when `target` is omitted. Constant fill
conflicts with field-driven color, while opacity and outline remain editable.
Geometry and semantic aggregation are unchanged and appearance is reapplied
after Canvas or scale rematerialization.

## Related

[Histogram positions](../position/histogram.md) ·
[Ordinal bars](../position/ordinal-bars.md) ·
[Series encodings](../series-encodings.md)
