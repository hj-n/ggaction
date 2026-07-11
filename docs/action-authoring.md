---
layout: default
title: Action Authoring
---

[Documentation home](./index.md) · [Core concepts](./core-concepts.md)

# Action Authoring

The extension API is for developers who want to add traceable authoring actions
instead of only consuming the default chart-building API.

## Import the extension API

```javascript
import { action, ChartProgram } from "ggaction/extension";
```

The default `ggaction` entry point remains focused on chart authors. The
extension entry point deliberately exposes lower-level authoring contracts.

## Define an action

Subclass `ChartProgram` so an extension does not overwrite methods on the shared
base prototype.

```javascript
class MyProgram extends ChartProgram {}

MyProgram.prototype.recordNote = action(
  {
    op: "recordNote",
    description: "Record a custom trace note."
  },
  function ({ label } = {}) {
    return this;
  }
);

const program = new MyProgram().recordNote({ label: "example" });
```

An action definition has two parts:

- Metadata contains a stable `op` and a short human-readable `description`.
- The implementation receives one argument object and must return a
  `ChartProgram`.

Wrapped actions called by another wrapped action are recorded as children of
the calling action. Completed actions return with an empty action stack.

## Primitive actions

The extension layer also includes the low-level `editSemantic`,
`createGraphics`, and `editGraphics` methods on chart programs. They let action
authors define explicit semantic and graphical changes without an automatic
semantic-to-graphic compiler.

The primitive methods are part of the STEP 1 contract but are not implemented
yet. Their API reference will be added as each primitive becomes available.
