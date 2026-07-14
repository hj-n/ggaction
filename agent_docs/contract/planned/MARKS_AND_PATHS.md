# Planned Mark And Path contracts

These contracts are accepted future API work; they are not current public behavior.

## curve interpolation and concrete path commands

```typescript
type CurveInterpolation =
  | "linear"
  | "step"
  | "step-before"
  | "step-after"
  | "basis"
  | "cardinal"
  | "monotone"
  | "natural";

type ConcretePathCommand =
  | { op: "M" | "L"; x: Finite; y: Finite }
  | { op: "C"; x1: Finite; y1: Finite; x2: Finite; y2: Finite; x: Finite; y: Finite }
  | { op: "Z" };
```

- `createLineMark.curve`와 `createAreaMark.curve`는 shared closed vocabulary를 사용하며 default는
  `"linear"`다. Curve is graphical mark materialization config: it does not change fields, grouping,
  coordinates or scale semantics.
- `"linear"` emits `M` followed by `L` commands. For each pair `(x0, y0)`→`(x1, y1)`, `"step"` emits
  horizontal/vertical segments at midpoint `(x0 + x1) / 2`; `"step-before"` changes y at `x0`, and
  `"step-after"` changes y at `x1`.
- `"basis"` uses a uniform cubic B-spline, `"cardinal"` a cardinal spline with fixed tension `0`,
  `"monotone"` a monotone-x cubic Hermite interpolation, and `"natural"` a natural cubic spline with
  zero second derivative at both endpoints. They emit only concrete cubic `C` commands after `M`.
- Curves that require three or more distinct ordered points fall back to linear for shorter input.
  `monotone` requires strictly increasing finite x after existing series ordering and grain resolution;
  duplicate or decreasing x is a materialization error rather than silently reordered curve input.
- Area materialization starts the upper boundary with `M`, interpolates it in forward order, connects to the
  lower/baseline endpoint with `L`, interpolates that boundary in reverse order without a new `M`, then emits
  `Z`. It never smooths across the upper-to-lower connector. Line paths never emit `Z`.
- Path materialization resolves curve tokens into `ConcretePathCommand[]` before writing `graphicSpec`.
  Renderers execute commands only and do not know curve names or calculate control points. Implementation
  migrates existing path `points` to commands atomically rather than storing two canonical geometries.
- Canvas/scale/data/group changes and Planned mark edits regenerate commands through one pure shared curve
  grammar. Browser and Node use the same command list, and invalid input leaves the previous program unchanged.
- Regression line/band actions forward their curve options to the corresponding line/area mark actions.
  Density and ranged-area charts reuse `createAreaMark.curve` without a density-specific interpolation API.
- Status: Planned, NOT IMPLEMENTED. Every token needs exact command fixtures, two/three/many-point and
  reversed-area cases, monotone validation, edit/rematerialization trace, renderer parity, declaration and
  primitive-schema coverage.
