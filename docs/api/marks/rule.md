---
layout: default
title: Rule Marks
---

# Rule Marks

Rule marks represent reference lines and intervals. They use concrete line
primitives without exposing a renderer-specific path format.

## `createRuleMark({ id?, data? } = {})`

```javascript
const threshold = chart()
  .createData({ values: [{ limit: 25 }] })
  .createRuleMark()
  .encodeY({ field: "limit" })
  .encodeStroke({ value: "#dc2626" })
  .encodeStrokeWidth({ value: 2 });
```

The first ID is `"rule"`, data defaults to current data, and creation assigns no
position or style. A single x or y encoding creates a full plot-span rule. Add
`encodeY2` for a bounded vertical interval, `encodeX2` for a bounded horizontal
interval, or both secondary endpoints for a diagonal rule. Every endpoint may
use a field or constant datum.

Rule appearance is edited through encoding actions rather than a separate mark
editor:

- `encodeStroke`
- `encodeStrokeWidth`
- `encodeStrokeDash`
- `encodeOpacity`

Every complete rule stores concrete `x1`, `y1`, `x2`, and `y2` values. An
incomplete endpoint combination remains empty until another encoding completes
it. Canvas and scale changes recompute all endpoints.

## Related

[Appearance encodings](../appearance.md) · [Error bars](../error-bars.md) ·
[Advanced axis components](../../advanced/axis-components.md)
