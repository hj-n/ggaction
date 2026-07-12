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
| Color | Nominal field with ordinal scale and `tableau10` palette |
| Constant appearance | Circle radius |
| Coordinates | Named Cartesian and Polar semantic resources; x/y use Cartesian |
| Guides | Bottom x-axis and left y-axis, including lines, ticks, labels, titles |
| Rendering | Browser Canvas and Node PNG |
| Graphics | Concrete canvas, circle, line, text, and point-array path nodes |

Line color/strokeDash authoring actions, Polar guide graphics, additional mark
types, public transforms, facets, legends, and program composition are not
implemented in the current phase. They are not part of the current API
reference.
