---
layout: default
title: Window Data Transforms
---

# Window Data Transforms

<div class="docs-concept-flow" role="img" aria-label="Source rows are partitioned, stably sorted, processed by ordered window operations, and returned in source row order">
  <span>source rows<strong>immutable input</strong></span>
  <span>partition + sort<strong>calculation order</strong></span>
  <span>operations<strong>derived fields</strong></span>
  <span>source order<strong>immutable output</strong></span>
</div>

`createWindowData` computes ordered values within optional partitions and stores
the result as a new immutable dataset. It is useful when a later mark needs rank,
running totals, or neighboring values without changing the source rows.

## `createWindowData({ id, source?, partitionBy?, sortBy?, operations })`

```javascript
const program = chart()
  .createData({
    id: "sales",
    values: [
      { region: "East", month: 2, amount: 30 },
      { region: "East", month: 1, amount: 20 },
      { region: "West", month: 1, amount: 15 }
    ]
  })
  .createWindowData({
    id: "rankedSales",
    partitionBy: "region",
    sortBy: [{ field: "month" }],
    operations: [
      { op: "rowNumber", as: "monthOrder" },
      { op: "cumulativeSum", field: "amount", as: "runningAmount" },
      { op: "lag", field: "amount", as: "previousAmount" }
    ]
  });
```

| Option | Type | Default |
| --- | --- | --- |
| `id` | new dataset ID | required |
| `source` | existing dataset ID | current dataset |
| `partitionBy` | field name or array of field names | one partition |
| `sortBy` | array of `{ field, order? }` | source order |
| `operations` | non-empty array of window operations | required |

`order` accepts `"ascending"` or `"descending"` and defaults to ascending.
Sorting is stable. Missing sort values are placed after present values for an
ascending sort and before them for a descending sort. Operations run in the
declared order, so a later operation may read a field created by an earlier one.

Supported operations are:

| Operation | Shape | Notes |
| --- | --- | --- |
| row number | `{ op: "rowNumber", as }` | one-based position |
| rank | `{ op: "rank", as }` | tied rows share a rank and leave gaps |
| dense rank | `{ op: "denseRank", as }` | tied rows share a rank without gaps |
| cumulative sum | `{ op: "cumulativeSum", field, as }` | requires finite numeric values |
| lag | `{ op: "lag", field, as, offset?, default? }` | defaults to offset `1` and value `null` |
| lead | `{ op: "lead", field, as, offset?, default? }` | defaults to offset `1` and value `null` |

The action computes each partition in sorted order, then returns the materialized
rows in their original source order. The source dataset remains unchanged. Output
fields must be unique and cannot replace fields already present in the source.
Dataset IDs are create-only: calling the action again with the same `id` throws
instead of replacing or rebinding consumers.

## Related

[Data overview](../data.md) · [Source and derived data](./source-and-derived.md) ·
[Action reference](../../reference/actions.md)
