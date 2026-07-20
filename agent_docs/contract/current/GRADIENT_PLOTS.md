# Gradient plots

## Shared contract

Gradient plots belong to the same positional family as box plots. Exactly one of `x` and `y` is categorical and the other is
quantitative. The categorical role determines strip orientation. Explicit options win over uniquely inferable encoded state,
then documented defaults apply. Ambiguous state is rejected.

Each category produces one immutable semantic profile row and one concrete rect item. Profile rows contain sampled values,
sampled density intensities, extent, center, and count; they never contain colors, paint, Canvas coordinates, or backend
objects. Categories retain first source appearance order, use one shared observed or explicit value extent, and use one global
intensity domain.

The body fill is a backend-neutral `LinearGradientPaint`. With no color encoding, `gradient.palette` supplies the density
palette. A later categorical `encodeColor` owns category hue and density modulates that hue's lightness and opacity. The
neutral density legend remains independent from the categorical hue scale.

## `createGradientPlot`

```typescript
createGradientPlot({
  id?, target?, data?, x?, y?, coordinate?,
  density?: {
    bandwidth?: "auto" | PositiveFinite,
    extent?: "auto" | OrderedFinitePair,
    steps?: IntegerAtLeast2,
    kernel?: "gaussian" | "epanechnikov" | "uniform" | "triangular",
    normalization?: "unit" | "count"
  },
  width?: { band?: UnitIntervalExclusive },
  gradient?: { palette?: Palette, opacity?: [UnitInterval, UnitInterval] },
  center?: false | {
    type?: "mean" | "median",
    stroke?: NonEmptyString,
    strokeWidth?: NonNegativeFinite
  },
  guides?: false | CreateGuidesOptions
} = {})
```

- The first omitted ID is `"gradientPlot"`; another owner requires an explicit ID.
- `x` and `y` may be authored before creation, in the create call, or afterward with `encodeX`/`encodeY`. All complete forms
  converge on the same materialized owner.
- Defaults are Gaussian kernel, auto bandwidth and extent, 64 steps, unit normalization, width band `0.7`, palette `blues`,
  opacity `[0, 1]`, no strip outline, and an enabled median center rule with dark `1.5` pixel stroke.
- Omitted guides create applicable axes, the default Cartesian grid, and a right-side neutral density legend. `false` omits
  the complete guide branch; nested `false` values omit their component.
- The wrapped hierarchy owns `createGradientProfileData`, `createRectMark`, position encodings,
  `materializeGradientPlotFill`, optional `createGradientPlotCenter`, and guide components.
- A profile revision always reads the raw source dataset directly. Requested automatic parameters remain in provenance beside
  resolved bandwidth, extent, and intensity domain.

### Effects and errors

- Creates one stable rect owner, one namespaced profile dataset, one optional namespaced center rule, position scales, and
  selected guides.
- Rejects invalid or ambiguous data/target inference, non-categorical/quantitative role pairs, invalid density parameters,
  invalid width or opacity ranges, and unsupported center values before partial public state is returned.
- Incomplete compatible positions preserve an empty owner and deferred materialization intent rather than placeholder items.

### Coverage

- Complete explicit Cars call chain, encoded-source inference, deferred position order, categorical color after creation,
  wrapped trace, Browser Canvas, Node PNG, and primitive/public equivalence are executable Gate evidence.

### Formal values — `createGradientPlot`

- Implemented: `createGradientPlot({ id?: UserId; target?: UserId; data?: UserId; x?: GradientPlotPositionChannel; y?: GradientPlotPositionChannel; coordinate?: UserId; density?: GradientPlotDensityOptions; width?: { band?: UnitIntervalExclusive }; gradient?: { palette?: Palette; opacity?: readonly [UnitInterval, UnitInterval] }; center?: false | GradientPlotCenterOptions; guides?: false | CreateGuidesOptions } = {})`.
- Proposed (NOT IMPLEMENTED): subgroup offsets, multiple profile overlays, and independent per-category intensity domains.

### Value coverage — `createGradientPlot`

- ✅ Covered: explicit, inferred, deferred, categorical-color, guide, Canvas, PNG, and immutable profile cases.
- No proposal is required for the approved first implementation. Evidence: `test/unit/actions/statistics/create-gradient-plot.test.js` and `test/gates/cars-gradient-plot/`.

## `editGradientPlot`

```typescript
editGradientPlot({
  target?, density?, width?, gradient?,
  center?: false | GradientPlotCenterOptions
})
```

- Omission preserves current state. Empty edits are rejected.
- Density and center-statistic edits create a new namespaced immutable profile revision, rebind every direct consumer, and
  release only the unreferenced previous revision.
- Width, palette, opacity, and center appearance retain the existing profile dataset.
- `center: false` removes its semantic layer, graphic, and materialization config. A later center object recreates the same
  deterministic owned role.
- Every edit rematerializes affected strips, center span, and the density legend while preserving previous programs and
  caller-owned inputs.

### Formal values — `editGradientPlot`

- Implemented: `editGradientPlot({ target?: UserId; density?: GradientPlotDensityOptions; width?: { band?: UnitIntervalExclusive }; gradient?: GradientPlotAppearanceOptions; center?: false | GradientPlotCenterOptions })`.
- Proposed (NOT IMPLEMENTED): category/measure reassignment and guide replacement through this resource edit.

### Value coverage — `editGradientPlot`

- ✅ Covered: statistical revision, appearance-only retention, center removal/restoration, immutable options, and empty-edit rejection.
- No proposal is required for the approved first implementation. Evidence: `test/unit/actions/statistics/edit-gradient-plot.test.js`.

## FillPaint boundary

`FillPaint = string | LinearGradientPaint` is the concrete `fill` property contract. Structured paint uses item-local
normalized endpoints and nondecreasing `{ offset, color }` stops. Renderers create backend gradient objects ephemerally;
program state stores only immutable backend-neutral data. Rect and closed-path fills support structured paint. Open paths,
text, circles, and strokes reject it.
