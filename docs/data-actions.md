---
layout: default
title: Data Actions
---

[Documentation home](./index.md) · [Core concepts](./core-concepts.md)

# Data Actions

## `createData`

`createData` adds an immutable named dataset to a chart program:

```javascript
const program = chart().createData({
  id: "cars",
  values: [
    { horsepower: 130, mpg: 18 },
    { horsepower: 165, mpg: 15 }
  ]
});
```

Dataset IDs may contain letters, numbers, `_`, and `-`. `values` must be an
array of plain row objects; an empty array is valid. Rows may contain nested
objects and arrays.

The program copies and freezes the supplied rows. Later changes to the caller's
array or objects cannot change the dataset stored in an existing program. A
dataset ID cannot be created twice, and source dataset values cannot be edited
after creation. Future data changes use transforms or derived datasets instead.

Multiple datasets are supported:

```javascript
const program = chart()
  .createData({ id: "cars", values: cars })
  .createData({ id: "fit", values: regression });
```

Creating data records semantic intent only. It does not automatically create
marks or graphical output.
