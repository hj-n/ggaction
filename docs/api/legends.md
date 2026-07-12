---
layout: default
title: Legends API
---

[Documentation home](../index.md) · [Guides](./guides.md) · [Encodings](./encodings.md) · [Action reference](../reference/actions.md)

# Legends API

## `createLegend(options?)`

Creates one series legend for a line mark. With no options, it combines the
mark's color and stroke-dash encodings when they describe the same field and
ordered domain.

```javascript
program.createLegend();
```

Each legend item uses a concrete line symbol, so color and dash pattern can be
shown together.

| Option | Type | Default |
| --- | --- | --- |
| `target` | line mark ID | current or unique encoded line mark |
| `channels` | unique array of `"color"` and/or `"strokeDash"` | encoded channels in that order |
| `position` | `"right"` | `"right"` |
| `title` | non-empty string | shared field name |
| `symbol` | `{ length?, lineWidth? }` | `{ length: 32, lineWidth: 2 }` |
| `labels` | label style object | default sans-serif label style |
| `titleStyle` | title style object | default sans-serif title style |
| `itemGap` | positive number | `28` |
| `border` | boolean or border style object | `false` |

`labels` accepts `offset`, `color`, `fontSize`, `fontFamily`, and `fontWeight`.
`titleStyle` accepts the same font and color properties except `offset`.

The selected scales must be resolved ordinal scales. Combined channels must
encode the same field and have identical domains in identical order. Otherwise,
`createLegend` rejects the ambiguous or incompatible definition. A legend with
only color or only stroke dash is also supported.

## Optional border

The default `border: false` creates no background graphic. Pass `true` to use
the default background and border settings:

```javascript
program.createLegend({ border: true });
```

Equivalent defaults are:

```javascript
{
  color: "#cbd5e1",
  lineWidth: 1,
  padding: 12,
  background: "transparent"
}
```

Pass an object to override any of `color`, `lineWidth`, `padding`, or
`background`.

## Stored result and updates

The semantic guide stores its channels, scale IDs, and title. Concrete symbols,
labels, title text, and the optional background are stored in `graphicSpec`.
Canvas size and margin changes explicitly rematerialize the legend layout, and
legend rematerialization reads the latest shared resolved scale domain.

The current scope supports one right-positioned line-series legend. Point
legends, multiple legends, other positions, and interactive legends are not
implemented.
