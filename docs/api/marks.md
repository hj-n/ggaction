---
layout: default
title: Marks
---

# Marks

## At a glance

| Action | Shortest call | Inference/defaults | Initial graphic |
| --- | --- | --- | --- |
| `createPointMark` | `createPointMark({ id: "points" })` | Current dataset; circle shape | Empty/concrete point collection |
| `editPointMark` | `editPointMark({ shape: "diamond" })` | Current or unique point mark | Rematerialized equal-area symbols |
| `createLineMark` | `createLineMark({ id: "lines" })` | Current dataset; linear curve | Empty path collection |
| `editLineMark` | `editLineMark({ curve: "monotone" })` | Current or unique line mark | Rematerialized path commands |
| `createBarMark` | `createBarMark({ id: "bars" })` | Current dataset | Empty rect collection |
| `createAreaMark` | `createAreaMark({ id: "band" })` | Current dataset; blue fill; opacity `0.2` | Empty path collection |

## `createPointMark({ id, data?, shape? })`

| Option | Type | Default |
| --- | --- | --- |
| `id` | valid user-defined ID | required |
| `data` | existing dataset ID | current dataset |
| `shape` | supported point shape | `"circle"` |

```javascript
const program = chart()
  .createData({ id: "cars", values: cars })
  .createPointMark({ id: "points" });
```

The semantic mark type is `point`; a fixed shape is graphical appearance.
Circle is the default. Square uses a rect, while the remaining shapes use
backend-neutral Z-closed command paths. A later field-driven `encodeShape` converts the
mark into one typed mixed collection.
Points are not renderable until later actions assign the required position,
size, and fill properties.

Point creation does not assign a coordinate or scale. Position encodings create
and attach the appropriate semantic coordinate when needed.

## `editPointMark({ target?, shape })`

Change a point mark's constant shape without changing its data or encodings:

```javascript
const diamonds = program.editPointMark({
  target: "points",
  shape: "diamond"
});
```

`target` may be omitted when the current or only point mark is unambiguous.
Supported shapes are `circle`, `square`, `diamond`, the four directional
triangles, `plus`, `cross`, `star`, `hexagon`, and `wye`. All recipes preserve
the same logical target area. A constant edit is rejected when the mark already
has a field-driven shape encoding.

## `createAreaMark({ id, data?, fill?, opacity? })`

Create a semantic area mark backed by an initially empty path collection.
`data` defaults to current data, `fill` defaults to `"#4c78a8"`, and opacity
defaults to `0.2`. The fixed fill and opacity are graphical appearance.

An area becomes renderable after quantitative x and atomic `encodeYRange`
encodings exist. Optional `encodeGroup` creates one Z-closed filled path per
nominal group without creating a scale or legend. A density-derived dataset may
instead use value/density x and y encodings: the density axis is closed against
zero, while the value axis determines sample order. Both horizontal-density and
vertical-density orientations are supported.

## `createLineMark({ id, data?, strokeWidth?, curve? })`

| Option | Type | Default |
| --- | --- | --- |
| `id` | valid user-defined ID | required |
| `data` | existing dataset ID | current dataset |
| `strokeWidth` | non-negative finite number | materializer default `2` |
| `curve` | supported curve interpolation | `"linear"` |

```javascript
const program = chart()
  .createData({ id: "cars", values: cars })
  .createLineMark({ id: "trends" });
```

The semantic mark type is `line`. Its graphical realization starts as an empty
`path` collection because series cardinality depends on later grouping
encodings rather than raw dataset length.

```javascript
program.graphicSpec.objects.trends;
// { type: "path", children: [] }
```

Line mark creation does not infer one default series, coordinates, encodings,
or path commands. Temporal `encodeX` resolves the horizontal scale while leaving
the collection empty. Aggregate line `encodeY` then derives the currently known
series, resizes the collection, and materializes sorted concrete commands.
`encodeColor` and `encodeStrokeDash` can further regroup those paths and apply
semantic series styles. Regression-derived quantitative x/y values may be
materialized directly without temporal aggregation.

`curve` accepts `linear`, `step`, `step-before`, `step-after`, `basis`,
`cardinal`, `monotone`, and `natural`. Linear and step curves materialize `L`
commands; smooth curves materialize cubic `C` commands. Smooth curves with only
two points fall back to linear. A monotone curve requires strictly increasing
materialized x values.

## `editLineMark({ target?, strokeWidth?, curve? })`

Edit line appearance without changing fields, grouping, coordinates, or scales:

```javascript
const smooth = program.editLineMark({
  target: "trends",
  curve: "monotone",
  strokeWidth: 4
});
```

`target` may be omitted for the current or only line mark. At least one of
`strokeWidth` and `curve` is required. A complete line is rematerialized
immediately; an incomplete line retains the choice until its encodings make it
renderable. Canvas resizing and later series regrouping preserve both settings.

## `createBarMark({ id, data? })`

| Option | Type | Default |
| --- | --- | --- |
| `id` | valid user-defined ID | required |
| `data` | existing dataset ID | current dataset |

```javascript
const program = chart()
  .createData({ id: "cars", values: cars })
  .createBarMark({ id: "bars" });
```

The semantic mark type is `bar`. Its graphical realization starts as an empty
`rect` collection because binning, aggregation, stacking, and optional grouping
determine the eventual rectangle count.

```javascript
program.graphicSpec.objects.bars;
// { type: "rect", children: [] }
```

Bar mark creation does not assign coordinates, encodings, bins, or concrete
rectangles. A subsequent binned `encodeX` can store the horizontal histogram
meaning and resolve its scale. `encodeY()` then infers count/zero-stack meaning
and resolves its scale, then materializes one concrete rectangle per non-empty
bin.

`encodeColor({ field })` can then split each non-empty bin into category rects.
The color scale domain controls stack and fill order, while the y scale remains
based on total bin counts.

## Errors and limitations

Mark IDs must be unique and the selected dataset must exist. Current semantic
marks are point, line, bar, and area; additional mark types are not implemented.

## Related

[Encodings](./encodings.md) · [Position encodings](./position-encodings.md) ·
[Constant appearance](./appearance.md)
