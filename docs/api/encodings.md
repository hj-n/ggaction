---
layout: default
title: Encoding API
---

[Documentation home](../index.md) · [Marks](./marks.md) · [Coordinates](./coordinates.md)

# Encoding API

## Point `encodeX(options)` and `encodeY(options)`

Map a quantitative field to concrete point positions.

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `target` | point mark ID | current mark |
| `fieldType` | `"quantitative"` | `"quantitative"` |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `scale` | scale options | channel defaults |

Scale options are:

| Option | Type | Default |
| --- | --- | --- |
| `id` | scale ID | channel name (`x` or `y`) |
| `type` | `"linear"` | `"linear"` |
| `domain` | `"auto"` or two finite numbers | `"auto"` |
| `range` | `"auto"` or two finite numbers | `"auto"` |
| `nice` | boolean | omitted |
| `zero` | boolean | omitted |

```javascript
program.encodeX({
  field: "Horsepower",
  scale: { domain: [0, 250] }
});
```

An automatic domain combines every field consuming the same scale. An automatic
range uses current Canvas bounds; y runs bottom-to-top. Every encoded value must
currently be finite. For an automatic linear domain, `zero: true` expands the
domain to include zero and `nice: true` then expands it to rounded boundaries.
An explicit domain overrides both policies.

x/y encodings ensure a Cartesian coordinate exists and attach it to the layer.
An explicitly selected coordinate is created if missing. A conflicting layer
coordinate or non-Cartesian coordinate produces an error.

## Temporal line `encodeX(options)`

`encodeX` also maps a temporal field to the horizontal position scale of a
line mark.

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
| `fieldType` | `"temporal"` | required for the current line API |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `scale.id` | scale ID | `"x"` |
| `scale.type` | `"time"` | `"time"` |
| `scale.domain` | `"auto"` or two finite timestamps | `"auto"` |
| `scale.range` | `"auto"` or two finite numbers | `"auto"` |
| `scale.nice` | boolean | omitted |

Temporal fields contain parseable date strings or finite timestamps. Values
are normalized to timestamps for scale resolution without changing the source
dataset. An automatic `nice` domain expands outward to UTC calendar boundaries;
an explicit domain remains unchanged. Time scales reject `zero`.

At this stage x encoding resolves and stores the time scale but leaves the line
path empty. Later line actions materialize paths after y and series grouping are
known.

## Aggregate line `encodeY(options)`

After temporal x is encoded, `encodeY` can aggregate a quantitative field and
materialize a renderable line.

```javascript
program.encodeY({
  field: "Acceleration",
  fieldType: "quantitative",
  aggregate: "mean",
  scale: { nice: true, zero: false }
});
```

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `target` | line mark ID | current mark |
| `fieldType` | `"quantitative"` | `"quantitative"` |
| `aggregate` | `"mean"` | required for the current line API |
| `coordinate` | coordinate ID | layer coordinate, then `"main"` |
| `scale.id` | scale ID | `"y"` |
| `scale.type` | `"linear"` | `"linear"` |
| `scale.domain` | `"auto"` or two finite numbers | `"auto"` |
| `scale.range` | `"auto"` or two finite numbers | `"auto"` |
| `scale.nice` | boolean | omitted |
| `scale.zero` | boolean | omitted |

The source dataset remains unchanged. The action groups by the currently
encoded non-aggregate fields, computes each mean, and sorts every series by its
normalized temporal x value. With only x and y encodings, this produces one
series grouped by x. Later series encodings can split the same aggregate model
into multiple paths.

Automatic y domains use the aggregate means, not the raw rows. `zero` is
applied before `nice`; an explicit domain overrides both. The first complete
line uses a solid default stroke and is immediately renderable. Canvas size or
margin edits explicitly rematerialize its scales and path points while
preserving existing line appearance.

## `encodeColor(options)`

Maps a nominal field to concrete point fills or line-series strokes. On a line
mark, the field also participates in series grouping.

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `target` | point or line mark ID | current mark |
| `fieldType` | `"nominal"` | `"nominal"` |
| `scale.id` | scale ID | `"color"` |
| `scale.type` | `"ordinal"` | `"ordinal"` |
| `scale.domain` | `"auto"` or category array | `"auto"` |
| `scale.range` | `"auto"`, color array, or palette descriptor | `"auto"` |
| `scale.palette` | `"tableau10"` | omitted |

```javascript
program.encodeColor({
  field: "Origin",
  scale: { palette: "tableau10" }
});
```

`scale.palette` is the concise form of
`scale.range: { palette: "tableau10" }`. Do not provide `palette` and `range`
together. Automatic domains preserve first-appearance order. Point marks
receive `fill`; line paths receive `stroke` and are regrouped when needed.

## `encodeStrokeDash(options)`

Maps a nominal field to line-series dash patterns.

```javascript
program.encodeStrokeDash({ field: "Origin" });
```

| Option | Type | Default |
| --- | --- | --- |
| `field` | non-empty string | required |
| `target` | line mark ID | current mark |
| `fieldType` | `"nominal"` | `"nominal"` |
| `scale.id` | scale ID | `"strokeDash"` |
| `scale.type` | `"ordinal"` | `"ordinal"` |
| `scale.domain` | `"auto"` or category array | `"auto"` |
| `scale.range` | `"auto"` or dash-pattern array | `"auto"` |

The automatic range contains ten patterns and cycles for additional categories:

```javascript
[
  [], [8, 4], [3, 3], [12, 4], [8, 3, 2, 3],
  [12, 3, 3, 3], [2, 2], [10, 3, 2, 3, 2, 3],
  [14, 4, 4, 4], [6, 2, 2, 2]
]
```

An explicit range must contain at least one pattern. Each pattern is empty
(`solid`) or contains an even number of non-negative finite values. If color
and strokeDash use the same field, it appears only once in the series key.
Canvas rematerialization reapplies both semantic styles.

## `encodeRadius({ value, target? })`

Broadcasts a non-negative finite graphical radius to a point mark.

```javascript
program.encodeRadius({ value: 3 });
```

This is fixed appearance, not a semantic field encoding or Polar radial
position.
