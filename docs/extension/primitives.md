---
layout: default
title: Primitive Extension API
---

# Primitive Extension API

These methods are the low-level public extension layer, not the recommended
chart-authoring API.

## `editSemantic({ property, value })`

Creates or replaces one supported semantic property and structurally copies the
changed path.

```javascript
program.editSemantic({
  property: "layer[points].mark.type",
  value: "point"
});
```

Property paths use singular user-ID selectors such as `layer[points]` and
library-defined keys such as `encoding.x.field`. Unknown paths are rejected.
Dataset values cannot be replaced after creation.

The primitive semantic grammar also supports the current line-chart contract,
including temporal field types, `mean` aggregation, `strokeDash` encodings,
scale `nice`/`zero` policies, combined series legends, and chart title text.

## `createGraphics({ id, type, length?, before?, after? })`

Creates one concrete object or a homogeneous drawable collection.

```javascript
program.createGraphics({ id: "points", type: "circle", length: 2 });
```

Supported types are `canvas`, `container`, `circle`, `rect`, `line`, `text`,
and `path`. `length` is a non-negative integer accepted only for drawable types.
Equivalent repeated creation is idempotent.

`before` or `after` can place a new top-level graphic relative to an existing
top-level graphic. They are mutually exclusive, the referenced graphic must
already exist, and no graphic can be placed before the Canvas. When neither is
provided, creation appends to `graphicSpec.order` as usual.

```javascript
program.createGraphics({
  id: "grid",
  type: "line",
  length: 5,
  before: "bars"
});
```

Line-chart series use backend-neutral `path.points` arrays rather than SVG `d`
strings. Each point is a finite `{ x, y }` object. `path.strokeDash` and
`line.strokeDash` accept non-negative finite number arrays; an empty array is a
solid stroke.

The complete low-level line-chart example is available in
[`carsLineChartPrimitives.js`](https://github.com/hj-n/ggaction/blob/main/test/programs/carsLineChartPrimitives.js).
It explicitly authors semantic line state, paths, axes, a combined legend, and
title graphics without chart-level convenience actions.

## `editGraphics({ target, property, value })`

Sets one validated concrete property.

```javascript
program.editGraphics({
  target: "points",
  property: "x",
  value: [32.5, 81.4]
});
```

For a collection, an outer array distributes values by index and must match its
length. A non-array value is broadcast. Nested arrays and objects remain one
value per child. Generated child IDs such as `points:1` can be targeted.

## Scale materialization

`createScale({ id, type?, domain?, range?, nice?, zero? })` creates an
idempotent semantic scale. `rematerializeScale({ id })` resolves all consumers
and invokes concrete graphic edits, including connected axis updates. Aggregate
line consumers resolve their domains from derived means rather than raw rows.
Ordinal ranges may contain color strings, the `tableau10` descriptor, or
validated even-length stroke-dash patterns for the matching channel.

```javascript
program
  .createScale({ id: "x", type: "linear" })
  .rematerializeScale({ id: "x" });
```

Rematerialization is explicit. It never runs merely because `semanticSpec`
changed.
