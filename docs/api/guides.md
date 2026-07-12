---
layout: default
title: Guides
---

# Guides

## `createGuides(options?)`

Creates the axes and line-series legend supported by the current semantic
encodings. This is the recommended guide action when a chart needs both.

```javascript
program.createGuides();
```

Pass child options to customize either guide:

```javascript
program.createGuides({
  axes: {
    y: { ticksAndLabels: { count: 6 } }
  },
  legend: {
    title: "Origin"
  }
});
```

| Option | Type | Default |
| --- | --- | --- |
| `axes` | `createAxes` options or `false` | automatic |
| `legend` | `createLegend` options or `false` | automatic |

`false` explicitly skips that guide:

```javascript
program.createGuides({ legend: false });
```

Axes are automatically selected when an x or y encoding exists. A legend is
automatically selected when a line mark has a color or stroke-dash scale
encoding. Unsupported point legends are not selected.

`createGuides` only selects and calls existing wrapped actions. Coordinate,
scale, target, field, and domain validation remains the responsibility of
`createAxes` and `createLegend`, so ambiguous charts still require their
explicit child options. If nothing is selected, the action reports an error.

The trace preserves the composition:

```text
createGuides
├─ createAxes?
└─ createLegend?
```

Chart titles are not guides. Create them separately with
[`createTitle`](./titles.md).
