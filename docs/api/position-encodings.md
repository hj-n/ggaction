---
layout: default
title: Position Encodings
---

# Position Encodings

## Point `encodeX(options)` and `encodeY(options)`

Map a quantitative field to concrete point positions.

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `target` | point mark ID | current mark |
| `fieldType` | `"quantitative"` | `"quantitative"` |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `scale` | continuous scale options | channel defaults |

```javascript
program.encodeX({
  field: "Horsepower",
  scale: { domain: [0, 250] }
});
```

Automatic domains combine fields that share a scale. Automatic ranges use the
current plot bounds; y runs bottom-to-top. Every encoded point value must be
finite.

x/y encodings ensure a Cartesian coordinate exists and attach it to the layer.
An explicitly selected coordinate is created if missing. A conflicting layer
coordinate or non-Cartesian coordinate produces an error.

## Ordinal bar `encodeX(options)`

Create a categorical horizontal position encoding for a bar mark.

```javascript
program.encodeX({
  field: "year",
  fieldType: "ordinal"
});
```

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `fieldType` | `"ordinal"` | required for ordinal bars |
| `target` | bar mark ID | current mark |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `scale.id` | scale ID | `"x"` |
| `scale.type` | `"ordinal"` | `"ordinal"` |
| `scale.domain` | `"auto"` or unique nominal values | `"auto"` |
| `scale.range` | `"auto"` or two finite numbers | `"auto"` |

An automatic domain preserves first-appearance order. An automatic range uses
the current horizontal plot bounds. The resolved scale stores `step` and
`bandwidth`; category centers are `rangeStart + (index + 0.5) * step`.
Explicit domains preserve their supplied order, and reversed numeric ranges
are supported. Ordinal position scales do not accept `nice` or `zero`.

This action deliberately leaves the rect collection empty. Aggregate y and
group layout are still required to materialize grouped bars.

## Aggregate ordinal bar `encodeY(options)`

After ordinal bar x is encoded, aggregate a quantitative field by x category
and resolve its vertical scale.

```javascript
program
  .encodeX({ field: "year", fieldType: "ordinal" })
  .encodeY({
    field: "perc",
    aggregate: "mean",
    scale: { nice: true, zero: false }
  });
```

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `fieldType` | `"quantitative"` | `"quantitative"` |
| `aggregate` | `"mean"` | `"mean"` |
| `stack` | `null` | `null` |
| `target` | bar mark ID | current mark |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `scale.id` | scale ID | `"y"` |
| `scale.type` | `"linear"` | `"linear"` |
| `scale.domain` | `"auto"` or two finite numbers | `"auto"` |
| `scale.range` | `"auto"` or two finite numbers | `"auto"` |
| `scale.nice` | boolean | `true` |
| `scale.zero` | boolean | `false` |

The automatic domain is computed from `mean(field)` per ordinal x category,
not from raw rows. Explicit domains remain unchanged and take precedence over
`nice` and `zero`. A near-constant automatic nice domain is stabilized as a
constant rather than magnifying floating-point summation noise.

This action resolves both position scales but keeps the rect collection empty.
The later grouping action supplies color/xOffset semantics and rematerializes
the concrete grouped rectangles.

## Binned bar `encodeX(options)`

Create a quantitative histogram bin encoding and resolve its horizontal scale.

```javascript
program.encodeX({
  field: "Displacement",
  bin: { maxBins: 10 },
  scale: { nice: true, zero: false }
});
```

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `target` | bar mark ID | current mark |
| `fieldType` | `"quantitative"` | `"quantitative"` |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `bin` | `{ maxBins? }` | required |
| `bin.maxBins` | positive integer | `10` |
| `scale.id` | scale ID | `"x"` |
| `scale.type` | `"linear"` | `"linear"` |
| `scale.domain` | `"auto"` or two ascending finite numbers | `"auto"` |
| `scale.range` | `"auto"` or two finite numbers | `"auto"` |
| `scale.nice` | boolean | `true` |
| `scale.zero` | boolean | `false` |

Automatic nice bins use `1, 2, 3, 5 × 10ⁿ` steps and never exceed
`maxBins`. An explicit domain is kept exactly and takes precedence over
`nice` and `zero`. The resolved x domain spans bin boundaries, while the
automatic range uses current plot bounds.

This action leaves the bar's rect collection empty until `encodeY()` resolves
count/zero-stack meaning and materializes the histogram rectangles.

## Count/stack bar `encodeY(options?)`

After binned bar x is encoded, create the histogram count meaning and resolve
its vertical scale.

```javascript
program
  .encodeX({ field: "Displacement", bin: { maxBins: 10 } })
  .encodeY();
```

| Option | Type | Default |
| --- | --- | --- |
| `field` | binned x field | inferred from x |
| `target` | bar mark ID | current mark |
| `fieldType` | `"quantitative"` | `"quantitative"` |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `aggregate` | `"count"` | `"count"` |
| `stack` | `"zero"` | `"zero"` |
| `scale.id` | scale ID | `"y"` |
| `scale.type` | `"linear"` | `"linear"` |
| `scale.domain` | `"auto"` or two finite numbers | `"auto"` |
| `scale.range` | `"auto"` or two finite numbers | `"auto"` |
| `scale.nice` | boolean | `true` |
| `scale.zero` | boolean | `true` |

An explicit field must match the binned x field. The automatic y domain uses
the largest total bin count, applies zero, and then applies a nice boundary.
Values outside an explicit x domain are not counted.

This action resolves the y scale and materializes one concrete rectangle per
non-empty bin. Without a color encoding, rectangles use the default blue fill,
white stroke, and `0.5` stroke width. Canvas geometry edits explicitly
rematerialize the connected scales and rectangles.

The equivalent atomic form is:

```javascript
program.encodeHistogram({
  field: "Displacement",
  maxBins: 10
});
```

## Temporal line `encodeX(options)`

Map a temporal field to the horizontal position scale of a line mark.

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

Temporal fields contain parseable date strings or finite timestamps. Values
are normalized to timestamps for scale resolution without changing the source
dataset. The path remains empty until y and any series grouping are known.

## Aggregate line `encodeY(options)`

After temporal x is encoded, aggregate a quantitative field and materialize a
renderable line.

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
| `fieldType` | `"quantitative"` | `"quantitative"` |
| `aggregate` | `"mean"` | required for line marks |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `scale.id` | scale ID | `"y"` |
| `scale.type` | `"linear"` | `"linear"` |
| `scale.domain` | `"auto"` or two finite numbers | `"auto"` |
| `scale.range` | `"auto"` or two finite numbers | `"auto"` |
| `scale.nice` | boolean | omitted |
| `scale.zero` | boolean | omitted |

The source dataset remains unchanged. The action groups by encoded
non-aggregate fields, computes each mean, and sorts every series by temporal x.
Automatic y domains use aggregate means rather than raw rows.

See [Scale options](./scales.md) for domain and range precedence.
