---
layout: default
title: Canvas Actions
---

[Documentation home](./index.md) · [Core concepts](./core-concepts.md)

# Canvas Actions

Canvas actions provide chart-level control without exposing graphical IDs or
raw property paths.

## `editCanvas`

`editCanvas` updates selected properties on an existing canvas and returns a
new program:

```javascript
const resized = program.editCanvas({
  width: 800,
  margin: { left: 80 }
});
```

Supported options are `width`, `height`, `background`, and `margin`. Omitted
options retain their existing values. A numeric margin applies to all sides;
an object may update `top`, `right`, `bottom`, or `left` independently.

Margin is authoring context rather than a drawable canvas property. It defines
the bounds available to later positioning actions without adding an abstract
margin instruction to the concrete `graphicSpec`.
