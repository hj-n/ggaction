---
layout: default
title: Canvas Actions
---

[Documentation home](./index.md) · [Core concepts](./core-concepts.md)

# Canvas Actions

Canvas actions provide chart-level control without exposing graphical IDs or
raw property paths.

## `createCanvas`

`createCanvas` creates the program's single canvas and establishes the bounds
available to later positioning actions:

```javascript
const program = chart().createCanvas({
  width: 640,
  height: 400,
  background: "white",
  margin: { top: 30, right: 30, bottom: 60, left: 70 }
});
```

All options are optional. The defaults are 640×400, a white background, and
margins of 30 top, 30 right, 60 bottom, and 70 left. A program may contain only
one canvas.

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

`createCanvas` is a composite action: it creates the concrete canvas and calls
`editCanvas` internally. The action trace retains this nested structure.
