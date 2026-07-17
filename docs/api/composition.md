---
layout: default
title: Program Composition
---

# Program Composition

{% include chart-example.html id="composition" %}

Combine already-authored chart programs without merging their datasets, marks,
scales, or guides. The result is another immutable `ChartProgram` whose parent
Canvas contains concrete snapshots of its named children.

## Arrange complete programs

```javascript
import { hconcat, vconcat } from "ggaction";

const row = hconcat({
  id: "overview",
  programs: [
    { id: "main", program: scatterplot },
    { id: "detail", program: barChart }
  ],
  gap: 20,
  align: "center",
  padding: 16
});

const dashboard = vconcat({
  programs: [row, trendChart],
  gap: 18
});
```

This is a composition fragment: `scatterplot`, `barChart`, and `trendChart`
must each be a complete program with one materialized Canvas. See the
[runnable repository example](https://github.com/hj-n/ggaction/tree/main/examples/program-composition)
for complete child construction and Browser Canvas rendering.

Both functions require at least two programs. A direct `ChartProgram` receives
the deterministic slot name `view-1`, `view-2`, and so on. Use
`{ id, program }` when later code must replace a stable slot.

| Option | Default | Effect |
| --- | --- | --- |
| `id` | `"composition"` | Names the composition for deterministic graphic namespaces |
| `programs` | required | Ordered complete child programs or `{ id?, program }` entries |
| `gap` | `16` | Non-negative distance between adjacent children |
| `align` | `"center"` | `"start"`, `"center"`, or `"end"` cross-axis placement |
| `padding` | `0` on every side | Non-negative scalar or partial four-side object |

## Automatic and explicit child sizes

The parent Canvas size is inferred from child dimensions, gap, and padding.
For `hconcat`, children whose height was omitted in `createCanvas` expand to the
largest child height. For `vconcat`, children whose width was omitted expand to
the largest child width. An explicitly authored child width or height is never
overwritten; `align` places any remaining cross-axis difference.

The parent background is white. Child Canvas backgrounds are preserved, and
nested compositions keep independent clipping and coordinate scopes.

## Edit the layout

```javascript
const revised = row.editCompositionLayout({
  gap: 28,
  align: "start",
  padding: { left: 12, right: 12 }
});
```

At least one option is required. Omitted values retain their current settings;
a partial padding object updates only the named sides. The action preserves all
child IDs and references and rebuilds the parent snapshot.

## Replace one stable slot

```javascript
const replaced = revised.replaceCompositionChild({
  target: "detail",
  program: donutChart
});
```

The replacement must be a complete unit or nested composition program. Its new
size participates in layout inference, while the target ID and position in the
ordered child list remain stable. Earlier parent and child programs are not
mutated.

## State, trace, and action scope

`children` maps stable slot IDs to retained immutable programs.
`compositionSpec` stores direction, order, gap, alignment, and padding. The
parent `graphicSpec` stores the fully materialized, namespaced child Canvas
tree; renderers read only that concrete state.

`hconcat` and `vconcat` trace `useProgram` children followed by
`materializeComposition`. Layout edits and replacement rematerialize from the
retained child programs. Ordinary data, mark, encoding, scale, and guide
actions apply only to unit programs and reject a composition parent. Edit a
child first, then replace its slot when a dashboard needs a changed chart.
