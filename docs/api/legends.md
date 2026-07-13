---
layout: default
title: Legends
---

# Legends

## At a glance

| Action | Shortest call | Inference/defaults | Result |
| --- | --- | --- | --- |
| `createLegend` | `createLegend()` | Current/unique compatible mark; right position | Categorical or quantitative symbols, labels, and title |

## `createLegend(options?)`

Creates inferred legend blocks. It supports combined line-series,
color-stacked histogram, grouped ordinal-bar, composite point-series, and
quantitative point-size legends.

~~~javascript
program.createLegend();
~~~

Every categorical legend uses the same right-side default:

| Mark | Channels | Position | Symbol |
| --- | --- | --- | --- |
| line | encoded `color` and/or `strokeDash` | `right` | line |
| bar histogram | `color` | `right` | swatch |
| grouped ordinal bar | `color` | `right` | swatch |
| point + matching line | `color` + `shape` | `right` | line over typed point |
| quantitative point size | `size` | `right`, below point series | five equal-area circles |

| Option | Type | Default |
| --- | --- | --- |
| `target` | compatible mark ID | current or unique compatible mark |
| `channels` | unique categorical channel array | compatible encoded channels |
| `position` | `"right"` or `"bottom"` | `"right"` |
| `align` | `"left"`, `"center"`, or `"right"` | `"center"` |
| `title` | non-empty string | encoded field name |
| `symbol` | `"auto"`, shorthand object, or layered recipe | inferred from mark |
| `labels` | label style object | default sans-serif label style |
| `titleStyle` | title style object | default sans-serif title style |
| `itemGap` | positive number | `28` at right, `20` at bottom |
| `border` | boolean or border style object | `false` |
| `count` | size-legend symbol count of at least `2` | `5` for point legends |

Pass `position: "bottom"` explicitly for a horizontal legend. Bottom legends
can use left, center, or right alignment; right legends require center
alignment.

## Layered symbols

Legend symbols are graphical recipes composed from line, point, and swatch
layers. The default line shorthand remains supported:

~~~javascript
lineProgram.createLegend({
  symbol: { length: 32, lineWidth: 2 }
});
~~~

Histogram and grouped-bar swatch shorthand supports `width`, `height`,
`stroke`, and `strokeWidth`.

Use layers for a composite symbol:

~~~javascript
lineProgram.createLegend({
  symbol: {
    layers: [
      { type: "line", length: 32, lineWidth: 2 },
      { type: "point", shape: "circle", size: 4 }
    ]
  }
});
~~~

Supported layers are:

~~~javascript
{ type: "line", length?, lineWidth? }
{ type: "point", shape?: "circle", size?, fill?, stroke?, strokeWidth? }
{ type: "swatch", width?, height?, stroke?, strokeWidth? }
~~~

Every layer shares the same item anchors. A line and point therefore overlap
as one composite symbol. Recipes are private appearance configuration; the
final `graphicSpec` contains only concrete line, circle, and rect primitives.

## Items and semantics

Items follow the resolved ordinal domain order. Color and dash appearance come
from the matching resolved ranges. Combined line channels must encode the same
field and have identical ordered domains.

A bar color legend stores `guide.legend.color` with its scale and title. A
combined line legend stores `guide.legend.series` with its channels, scales, and
title. Positions, fonts, symbols, and border appearance are graphical state.

A point legend combines color and shape only when they encode the same nominal
field and share an ordered domain. If a matching line layer uses that field and
color scale, its line is layered behind each typed circle/square symbol. A
separate `guide.legend.size` block samples five evenly spaced domain values by
default and maps their areas through the resolved quantitative size scale.

## Optional border

The default creates no background. Pass true for default border settings or an
object with color, lineWidth, padding, and background.

~~~javascript
program.createLegend({
  border: {
    color: "#cbd5e1",
    lineWidth: 1,
    padding: 8,
    background: "white"
  }
});
~~~

The background is rendered before every symbol layer, label, and title.

## Updates and trace

Canvas changes and relevant encoding actions explicitly rematerialize the
legend from the latest ordinal domains and ranges. The renderer still reads
only concrete `graphicSpec` values.

~~~text
createLegend
├─ createCategoricalLegend
│  ├─ createLegendBackground?
│  ├─ createLegendSymbols
│  ├─ createLegendLabels
│  └─ createLegendTitle
├─ createPointSeriesLegend
└─ createSizeLegend
~~~

`createGuides()` selects line-series, histogram color, grouped-bar color, and
compatible point color/shape/size legends automatically.
Pass `createGuides({ legend: false })` to opt out.

## Errors and limitations

General continuous color legends and interactive legends are unsupported.
Point composite/size legends currently use right-side layout.
Right-side layout requires sufficient right margin; bottom layout must be
requested explicitly and requires sufficient bottom margin.

## Related

[Guides](./guides.md) · [Series encodings](./series-encodings.md) ·
[Canvas](./canvas.md) · [Troubleshooting](../troubleshooting.md)
