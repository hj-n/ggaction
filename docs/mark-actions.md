---
layout: default
title: Mark Actions
---

[Documentation home](./index.md) · [Core concepts](./core-concepts.md)

# Mark Actions

## `createPointMark`

`createPointMark` creates a semantic point mark and its concrete graphical
collection:

```javascript
const program = chart()
  .createData({ id: "cars", values: cars })
  .createPointMark({ id: "points" });
```

The action uses the current dataset by default. Pass `data` to select another
named dataset explicitly:

```javascript
program.createPointMark({
  id: "points",
  data: "cars",
  shape: "circle"
});
```

The public mark is semantic `point`; its initial graphical realization is a
`circle` collection with one empty child per dataset row. The only supported
shape is currently `circle`.

Point creation does not assign x, y, fill, radius, a coordinate system, or a
scale. Use [`encodeX` and `encodeY`](./encoding-actions.md) to materialize
positions. Constant appearance still requires a later graphical or domain
action. The renderer never infers missing properties.

A constant shape selects graphical appearance. A future field-driven shape
encoding will record semantic intent and explicitly materialize its graphics.
