---
layout: default
title: Bar Chart Recipe
---

# Bar Chart Recipe

The current complete bar-chart example uses grouped bars. Grouping is a layout
choice inside the bar chart, not a separate top-level chart type.

## Minimal grouped flow

```javascript
const program = chart()
  .createCanvas({ margin: { right: 140 } })
  .createData({ id: "data", values })
  .createBarMark({ id: "bars" })
  .encodeX({ field: "category", fieldType: "ordinal" })
  .encodeY({ field: "value", aggregate: "mean" })
  .encodeColor({ field: "group", layout: "group" })
  .encodeBarWidth()
  .createGuides();
```

## You must decide

- Ordinal x field
- Quantitative y field
- Nominal grouping/color field

## The library infers

- First-appearance x and group order
- Mean y at the final x/group grain
- xOffset slots from grouped color layout
- A `0.72` bar-band fraction
- Ordinal/linear axes, horizontal grid, and right-side legend

Missing x/group combinations are omitted. Change `layout` to `stack`, `fill`,
`overlay`, or `diverging` to use the other supported series arrangements.
The current API does not synthesize zero bars or support horizontal bars.

## Continue

[Bar chart tutorial](../tutorials/grouped-bar.md) ·
[Ordinal bar positions](../api/position/ordinal-bars.md) ·
[Ordinal offsets](../api/position/offsets.md)
