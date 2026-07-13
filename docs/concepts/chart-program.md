---
layout: default
title: ChartProgram and Immutability
---

# ChartProgram and Immutability

`chart()` returns an empty `ChartProgram`. A program contains the authored chart
state and the history used to produce it.

```javascript
import { chart } from "ggaction";

const empty = chart();
const withCanvas = empty.createCanvas();

console.log(empty === withCanvas); // false
```

Every action returns a new program. Earlier programs and caller-owned input are
not mutated.

## Program state

| Property | Purpose |
| --- | --- |
| `semanticSpec` | Data, layers, encodings, scales, coordinates, and guides |
| `graphicSpec` | Fully materialized backend-neutral graphics |
| `resolvedScales` | Resolved domains and concrete output ranges |
| `materializationConfigs` | Immutable appearance and layout inputs needed for later rematerialization |
| `context` | Current authoring selections used to interpret omitted action targets |
| `trace` | Hierarchical action history |

`context` helps later actions interpret omitted parameters, such as the current
dataset or mark. Canvas margin is canonical materialization state rather than
transient context, and plot bounds are derived from it and the concrete Canvas
dimensions. Rendering does not depend on `context` or `trace`.

Use [Semantic and graphical state](./semantic-and-graphics.md) to understand the
boundary between intent and concrete output.
