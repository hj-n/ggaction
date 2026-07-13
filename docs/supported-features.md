---
layout: default
title: Supported Features
---

# Supported Features

This page describes implemented behavior only. A dash means that the current
chart-authoring API does not support that combination.

## Complete chart support

| Capability | Scatterplot | Line chart | Histogram | Bar chart (grouped example) |
| --- | --- | --- | --- | --- |
| Semantic mark | point | line | bar | bar |
| Position | quantitative x/y | temporal x, mean y | binned x, count y | ordinal x, mean y |
| Nominal color | point fill | series stroke | zero-stacked fill | grouped fill and xOffset |
| Stroke dash | — | nominal series | — | — |
| Constant appearance | radius | — | — | band width |
| Automatic axes | linear | UTC time and linear | bin-aligned and linear | ordinal and linear |
| Automatic grid | horizontal | horizontal | horizontal | horizontal |
| Categorical legend | — | right | right; explicit bottom available | right; explicit bottom available |
| Chart title | optional | optional | optional | optional |
| Browser Canvas | ✓ | ✓ | ✓ | ✓ |
| Node PNG | ✓ | ✓ | ✓ | ✓ |

## Shared foundations

| Area | Supported now |
| --- | --- |
| Program model | Immutable `ChartProgram`, hierarchical action trace |
| Canvas | Create/edit width, height, background, margin |
| Data | Immutable arrays of plain row objects |
| Coordinates | Named Cartesian and Polar semantic resources; x/y use Cartesian |
| Scales | Linear, UTC time, ordinal position, color, stroke dash, and band-local xOffset |
| Guides | Automatic axes, horizontal/vertical Cartesian grids, and categorical legends |
| Titles | One plot-aligned top title with one optional single-line subtitle |
| Rendering | Browser Canvas and Node PNG |
| Graphics | Concrete canvas, circle, line, rect, text, and point-array path nodes |

## Current limitations

Polar guide graphics, additional mark types, public transforms, facets,
additional legend types or positions, and program composition are not
implemented. Point legends, additional title positions, automatic text
wrapping, and text measurement are also unsupported. These features are not
part of the current API reference.
