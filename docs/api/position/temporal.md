---
layout: default
title: Temporal Line Positions
---

# Temporal Line Positions

## At a glance

| Action | Shortest call | Required state | Result |
| --- | --- | --- | --- |
| temporal `encodeX` | `encodeX({ field: "date", fieldType: "temporal" })` | line mark | Resolved UTC time scale |
| aggregate `encodeY` | `encodeY({ field: "value", aggregate: "mean" })` | temporal x | Sorted scalar-aggregate path(s) |

## Temporal line `encodeX(options)`

```javascript
program.encodeX({
  field: "Year",
  fieldType: "temporal",
  scale: { nice: true }
});
```

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `target` | line mark ID | current mark |
| `fieldType` | `"temporal"` | required for line marks |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `scale.id` | scale ID | `"x"` |
| `scale.type` | `"time"` | `"time"` |
| `scale.domain` | `"auto"` or two finite timestamps | `"auto"` |
| `scale.range` | `"auto"` or two finite numbers | `"auto"` |
| `scale.nice` | boolean | omitted |

Parseable date strings and finite timestamps are normalized for scale
resolution without changing the source dataset. The path remains empty until y
is encoded.

## Aggregate line `encodeY(options)`

```javascript
program.encodeY({
  field: "Acceleration",
  aggregate: "mean",
  scale: { nice: true, zero: false }
});
```

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `target` | line mark ID | current mark |
| `fieldType` | `"quantitative"`, or `"nominal"` for count operations | `"quantitative"` |
| `aggregate` | scalar aggregate operation | required for temporal line marks |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `scale.id` | scale ID | `"y"` |
| `scale.type` | `"linear"` | `"linear"` |
| `scale.domain` | `"auto"` or two finite numbers | `"auto"` |
| `scale.range` | `"auto"` or two finite numbers | `"auto"` |
| `scale.nice` | boolean | omitted |
| `scale.zero` | boolean | omitted |

The action groups by temporal x and encoded series fields, computes the selected
scalar summary, sorts each series by x, and materializes concrete path commands.
Automatic y domains use final aggregate values rather than raw rows.

Supported operations are `count`, `sum`, `mean`, `median`, `min`, `max`,
`distinct`, `valid`, `missing`, `variance`, `varianceP`, `stdev`, `stdevP`,
`stderr`, `q1`, `q3`, `ciLower`, and `ciUpper`. `distinct`, `valid`, `missing`,
and `count` also accept nominal input fields; their output scale remains linear.
Missing finite samples are omitted instead of becoming zero-valued points.
Sample dispersion, standard error, and confidence endpoints require at least
two finite values per final group.

## Errors and limitations

The current line slice requires temporal x, a compatible scalar aggregate y,
and at least two complete points per materialized series. Parameterized
quantiles and ordered selection are not yet public.

## Related

[Position encoding index](../position-encodings.md) ·
[Series encodings](../series-encodings.md) ·
[Line chart tutorial](../../tutorials/line-chart.md)
