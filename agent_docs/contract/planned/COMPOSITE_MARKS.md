# Planned Composite Mark contracts

These accepted contracts define future aggregate mark APIs. They are not current public behavior.

## createErrorBar remaining variants

```typescript
type IntervalChannel =
  | {
      field: FieldName;
      center?: "mean" | "median";
      extent?: "stderr" | "stdev" | "ci" | "iqr";
      level?: UnitIntervalExclusive;
    }
  | {
      center: FieldName;
      lower: FieldName;
      upper: FieldName;
    };

type PositionChannel = {
  field: FieldName;
  fieldType: FieldType;
  scale?: PositionScale;
};

createErrorBar({
  // Current vertical statistical parameters remain available.
  caps?: boolean;
  capSize?: PositiveFinite;
  stroke?: NonEmptyString;
  strokeWidth?: NonNegativeFinite;
  strokeDash?: DashPattern;
  opacity?: UnitInterval;
}): ChartProgram;
```

- Vertical statistical intervals, encoded-layer inference, default caps, immutable interval data and fixed-span
  rematerialization are Current. This section owns only the remaining horizontal, explicit and appearance variants.
- `target` identifies an already encoded source layer. When either x or y is omitted, the action resolves the
  source in this order: explicit `target`, current eligible layer, unique eligible layer, then error. Eligibility
  depends on persisted data, coordinate and complete field-based x/y encodings, not on the source mark type.
- Explicit x/y options override the corresponding inferred source encoding. An inferred pair must have exactly
  one quantitative axis and one positional categorical/ordinal/temporal axis; two quantitative axes are
  ambiguous unless the caller explicitly identifies the interval channel. Missing or multiple eligible sources
  fail rather than choosing a layer or orientation arbitrarily.
- Omitted data, coordinate and position scale IDs reuse the selected layer's persisted resources. A persisted
  nominal `group` encoding, when present, contributes its field to interval grouping. Appearance encodings such
  as color do not silently become statistical grouping. These rules apply consistently when the source is a
  point, line, area, bar, rule, or a later compatible semantic mark.
- Exactly one of x/y is an interval channel and the other is its positional channel. An interval may request
  a statistic from source rows or reference already materialized center/lower/upper fields. Statistical mode
  calls wrapped `createIntervalData`; explicit mode does not derive data.
- The independent position field is always part of the statistical grouping. Optional `groupBy` adds one
  more grouping field and duplicate fields are removed while preserving order. The derived result therefore
  retains the independent position needed by the rule children without requiring callers to repeat it.
- The aggregate creates one main `createRuleMark`. Vertical intervals use x/y/y2; horizontal intervals use
  y/x/x2. `caps` defaults to `true`; lower and upper cap rules are namespaced children whose perpendicular
  concrete span is `capSize`, default `8` logical pixels.
- Omitted `id` resolves to the persisted representative rule ID `"errorBar"` only when that role is unique.
  A second error bar requires an explicit ID; no numbered public ID is generated. The main rule uses the
  resolved owner ID and derived data/cap resources are namespaced from it.
- Appearance is assigned by wrapped `encodeStroke`, `encodeStrokeWidth`, `encodeStrokeDash`, and
  `encodeOpacity`; defaults come from one shared rule theme. There is no `editErrorBar` or `editRuleMark`.
  Reauthor appearance or endpoints through the owned encoding actions.
- Cap rules keep their data-space anchor in ordinary position encodings. Their fixed perpendicular pixel span
  is immutable graphical materialization config, not a fabricated data-domain endpoint. Canvas or position
  scale changes rematerialize the cap endpoints into concrete `line` coordinates.
- IDs for derived data, main rule and cap rules are deterministically namespaced from `id`. The aggregate is
  create-only, and its complete child hierarchy remains visible in trace.
- Status: Planned, NOT IMPLEMENTED. Horizontal computed orientation, explicit interval rows, caps on/off and
  size, and custom style assignment require Gate C approval and public parity.

## createErrorBand

```typescript
createErrorBand({
  id: UserId;
  data?: UserId;
  x: PositionChannel | IntervalChannel;
  y: PositionChannel | IntervalChannel;
  groupBy?: FieldName;
  coordinate?: UserId;
  fill?: NonEmptyString;
  opacity?: UnitInterval;
  boundaries?: false | {
    stroke?: NonEmptyString;
    strokeWidth?: NonNegativeFinite;
    strokeDash?: DashPattern;
    opacity?: UnitInterval;
    curve?: CurveInterpolation;
  };
  curve?: CurveInterpolation;
}): ChartProgram;
```

- x/y interval selection and optional `createIntervalData` are identical to `createErrorBar`. Explicit mode
  consumes existing center/lower/upper fields; the center field is retained for provenance and optional
  downstream use even though band geometry uses lower/upper bounds.
- The aggregate calls `createAreaMark`, the positional action for the independent channel, and
  `encodeYRange` or Planned `encodeXRange` for the interval bounds. It forwards one shared coordinate,
  scales, grouping and curve decision to every child.
- `boundaries` defaults to `false`. When present, the aggregate adds lower and upper `createLineMark` children
  with namespaced IDs and forwards the boundary style. Rendering order is band first and boundaries second.
- The aggregate is create-only. Band appearance changes use the owned area/encoding actions and boundary
  changes use the owned line/encoding actions; no `editErrorBand` action is introduced.
- Status: Planned, NOT IMPLEMENTED. vertical/horizontal computed/explicit bounds, grouped paths, boundary
  options, curves, scale sharing, render order, rematerialization, trace and renderer parity가 필요하다.

## regression band delegation

```text
createRegression
├─ createRegressionData
├─ createRegressionBand
│  └─ createErrorBand (explicit interval mode)
└─ createRegressionLine
```

- `createRegressionBand` remains the regression-specific advanced action and compatibility boundary. It
  validates regression result provenance and shared resources, then delegates graphical composition to
  `createErrorBand` with the existing fitted/lower/upper fields.
- `createRegression` keeps its current public hierarchy and default inference. Regression-specific naming,
  confidence/method semantics and style forwarding stay owned by regression actions; generic error-band code
  does not infer regression.
- Equivalent regression programs before and after delegation must converge on the same semantic bindings,
  concrete paths, rendering order, rematerialization consumers and visible trace hierarchy.
- Status: Planned, NOT IMPLEMENTED. compatibility fixtures, grouped/ungrouped bands, style/curve forwarding,
  trace nesting, scale sharing and primitive-equivalence coverage가 필요하다.

## createBoxPlot

```typescript
createBoxPlot({
  id: UserId;
  data?: UserId;
  x: PositionChannel;
  y: PositionChannel;
  groupBy?: FieldName;
  coordinate?: UserId;
  whisker?: BoxWhisker;
  width?: { band: UnitIntervalExclusive };
  outliers?: boolean;
  box?: {
    fill?: NonEmptyString;
    opacity?: UnitInterval;
    stroke?: NonEmptyString;
    strokeWidth?: NonNegativeFinite;
  };
  median?: {
    stroke?: NonEmptyString;
    strokeWidth?: NonNegativeFinite;
  };
  outlier?: {
    shape?: PointShape;
    radius?: PositiveFinite;
    opacity?: UnitInterval;
  };
}): ChartProgram;
```

- One positional channel is categorical and the other is quantitative; vertical and horizontal orientation
  are inferred from that pair. `data` is inferred by the normal current/unique rules. Unsupported or ambiguous
  combinations fail instead of choosing an orientation arbitrarily.
- Internal wrapped data actions create the immutable summary and optional outlier datasets. The aggregate then
  composes: `createErrorBar` in explicit whisker mode, a ranged `createBarMark` for q1→q3, a
  `createRuleMark` for the median, and optional `createPointMark` outliers.
- The bar layer reuses `encodeYRange` or Planned `encodeXRange`; this extends ranged position materialization
  to bars without adding a box-specific range channel. `width.band` defaults to `0.7` and remains graphical
  mark configuration.
- `whisker` defaults to Tukey factor `1.5`; `outliers` defaults to `true` for Tukey and has no effect in minmax
  mode. Concrete order is whiskers/caps behind the box, then median, then outliers.
- Child IDs and datasets are namespaced from `id`. The aggregate is create-only; users modify stable child
  marks through their assignment actions rather than through `editBoxPlot`. Missing categorical combinations
  are not synthesized.
- Status: Planned, NOT IMPLEMENTED. both orientations, Tukey/minmax, width/outlier/style options, empty and
  sparse groups, ranged bars, child edits, ordering, trace, rematerialization and browser/PNG parity가 필요하다.

## composite ownership and storage

- No `semanticSpec.composites` registry is introduced. Each child remains an ordinary semantic layer and each
  derived dataset uses the existing dataset/provenance model.
- The user ID identifies the representative component; every repeatable child layer, dataset and graphic ID is
  deterministically namespaced by owner and role. Generated IDs remain implementation details.
- Aggregate actions orchestrate wrapped child actions and never duplicate their validation or materialization.
  They are create-only because later changes are assignments to stable child resources.
- A composite's rematerialization is the ordered, deduplicated union of its child consumer plans. Earlier
  immutable programs retain every old dataset, semantic binding and concrete graphic unchanged.
