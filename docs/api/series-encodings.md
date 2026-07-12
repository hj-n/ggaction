---
layout: default
title: Series Encodings
---

# Series Encodings

## `encodeColor(options)`

Map a nominal field to point fills or line-series strokes. On line marks the
field also participates in series grouping.

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
`scale.range: { palette: "tableau10" }`. Do not provide both. Automatic domains
preserve first-appearance order.

## `encodeStrokeDash(options)`

Map a nominal field to line-series dash patterns.

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

The automatic range contains ten reusable patterns. An explicit pattern is an
empty array for a solid stroke or an even-length array of non-negative finite
numbers.

If color and stroke dash encode the same field, that field appears only once in
the series key and can be represented by one combined legend. Canvas changes
explicitly rematerialize both styles.

See [Scale options](./scales.md) and [Legends](./legends.md).
