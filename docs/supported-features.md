---
layout: default
title: Supported Features
---

[Documentation home](./index.md) · [Action index](./reference/actions.md)

# Supported Features

This page describes implemented behavior only.

| Area | Supported now |
| --- | --- |
| Program model | Immutable `ChartProgram`, hierarchical action trace |
| Canvas | Create/edit width, height, background, margin |
| Data | Immutable arrays of plain row objects |
| Marks | Semantic point/circle mark; semantic line with aggregate path materialization |
| Position | Quantitative point x/y; temporal line x and aggregate quantitative line y |
| Aggregation | Immutable mean aggregation grouped by current non-aggregate line encodings |
| Color | Nominal point fill or line stroke with ordinal scale and `tableau10` palette |
| Stroke dash | Nominal line series with explicit or automatic ten-pattern range |
| Constant appearance | Circle radius |
| Coordinates | Named Cartesian and Polar semantic resources; x/y use Cartesian |
| Guides | Bottom/left linear or UTC time axes; one right-side line-series legend combining color and stroke dash |
| Rendering | Browser Canvas and Node PNG |
| Graphics | Concrete canvas, circle, line, rect, text, and point-array path nodes |

Polar guide graphics, additional mark types, public transforms, facets,
additional legend types or positions, and program composition are not
implemented in the current phase. They are not part of the current API
reference.
