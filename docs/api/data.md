---
layout: default
title: Data
---

# Data

## At a glance

| Action | Shortest call | Inference/defaults | Result |
| --- | --- | --- | --- |
| `createData` | `createData({ id: "rows", values })` | No ID or value inference | Immutable semantic dataset and current-data context |
| `filterData` | `filterData({ id: "selected", field, oneOf })` | Source: current dataset | Immutable derived dataset with filter provenance and materialized rows |

## `createData({ id, values })`

| Option | Type | Required |
| --- | --- | --- |
| `id` | string containing letters, numbers, `_`, or `-` | yes |
| `values` | array of plain row objects | yes |

```javascript
const program = chart().createData({
  id: "cars",
  values: [
    { horsepower: 130, mpg: 18 },
    { horsepower: 165, mpg: 15 }
  ]
});
```

Empty arrays are valid, and row properties may contain nested arrays or
objects. The action copies and freezes the supplied data. A dataset ID cannot
be created twice, and source values cannot be replaced after creation.

The most recently created dataset becomes the default for `createPointMark`,
`createLineMark`, or `createBarMark`. Creating data records semantic state only
and produces no graphics.

## `filterData({ id, source?, field, oneOf })`

Create a named derived dataset without replacing or mutating its source.

```javascript
const selected = chart()
  .createData({ id: "cars", values: cars })
  .filterData({
    id: "selectedCars",
    field: "Origin",
    oneOf: ["Japan", "USA"]
  });
```

| Option | Type | Required |
| --- | --- | --- |
| `id` | dataset ID | yes |
| `source` | existing dataset ID | no; defaults to current dataset |
| `field` | non-empty string | yes |
| `oneOf` | non-empty scalar array | yes |

The derived dataset stores its source ID, filter transform, and immutable
materialized values. Rows retain source order. Missing fields and values not in
`oneOf` are omitted. The new dataset becomes current data for the next mark.

## Errors and limitations

Values must be an array. Dataset IDs are unique, and an existing source dataset
cannot be replaced or mutated. Filtering requires a current or explicit source
and does not permit an empty `oneOf` list.

## Related

[Marks](./marks.md) · [ChartProgram and immutability](../concepts/chart-program.md)
