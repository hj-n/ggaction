---
layout: default
title: Series Encodings
---

# Series Encodings

{% include chart-example.html id="line" %}

## At a glance

| Action | Shortest call | Inference/defaults | Result |
| --- | --- | --- | --- |
| `encodeColor` | `encodeColor({ field: "group" })` | Current mark, nominal default or explicit ordinal field type, color scale | Semantic grouping and concrete color |
| `encodeStrokeDash` | `encodeStrokeDash({ field: "group" })` | Current line/rule mark and dash scale | Field-driven or constant concrete dash |
| `encodeStrokeWidth` | `encodeStrokeWidth({ field: "weight" })` | Current line/rule; independent quantitative scale | Rule-item or line-series widths |

Series appearance is authored through color, stroke-dash, and stroke-width families. Each
focused page owns the complete options, replacement behavior, and errors for
that encoding.

## Focused series families

<div class="docs-entry-grid docs-entry-grid--two">
  <a href="{{ '/api/series/color/' | relative_url }}"><strong>Color</strong><span>Categorical and continuous color, grouping layouts, and aggregate bars.</span></a>
  <a href="{{ '/api/series/stroke-dash/' | relative_url }}"><strong>Stroke dash</strong><span>Constant and field-driven dash patterns for lines and rules.</span></a>
</div>

## Errors and limitations

Stroke-dash and explicit group fields must be nominal. Color fields may be
nominal or ordinal. Area color must match its group encoding. Line group,
color, and field-driven stroke dash must use one compatible field.
Combined line legends also require matching ordered domains.
Stroke width is quantitative and independent of point size. A line series must
have exactly one width value across all contributing rows; segment-local and
tapered widths are unsupported.

## Related

[Scale options](./scales.md) · [Legends](./legends.md) ·
[Position encodings](./position-encodings.md)
