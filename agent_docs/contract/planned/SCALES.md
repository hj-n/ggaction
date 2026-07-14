# Planned scale contracts

These contracts are accepted future API work; they are not current public behavior.

## editScale

```typescript
type EditableCurrentScale = {
  id?: UserId;
  type?: never;
  domain?: "auto" | readonly unknown[];
  range?: "auto" | readonly unknown[];
  nice?: boolean;
  zero?: boolean;
  clamp?: boolean;
  reverse?: boolean;
  unknown?: never;
};

editScale(options: EditableCurrentScale): ChartProgram;
```

- `id` selects an existing named scale. When omitted, the action uses the current scale or the only
  existing scale; no candidate or multiple candidates require an explicit ID.
- The first implementation edits domain, range, `nice`, `zero`, `clamp`, and `reverse` for the current
  `linear | time | ordinal` vocabulary. At least one editable property is required.
- Scale `type` is not editable. A type change creates a new scale and the owning encoding action explicitly
  rebinds its consumer. `editScale` rejects `type` rather than partially changing incompatible consumers.
- `unknown` is intentionally deferred to the Phase 10 scale-vocabulary expansion and is not accepted by the
  first implementation.
- Explicit domain takes precedence over `zero` and `nice`: stored policies remain but do not rewrite explicit
  bounds. Setting domain to `"auto"` resolves `zero` first and `nice` second. Explicit range takes precedence
  over Canvas/palette auto resolution, and `reverse` applies after the final auto or explicit range is resolved.
- Setting domain or range to `"auto"` is the only reset syntax. Omission means preserve the stored property;
  `undefined` is not a removal value.
- The complete patch is normalized and checked against every shared consumer before changing the program.
  Scale-type/channel compatibility continues to restrict which properties and values are valid; for example,
  ordinal rejects `nice`, `zero`, and `clamp`, while time rejects `zero`.
- On success the action performs one semantic scale update and invokes the registered scale materialization
  plan. Marks, related axes/grids, and legends are rematerialized in deterministic deduplicated order. It does
  not delete named scales, rebind consumers, or infer a different scale.
- Any validation or downstream materialization failure leaves semantic, graphic, context, and trace state of
  the previous program unchanged.
- Status: Planned, NOT IMPLEMENTED. Current linear/time/ordinal edits, inference/ambiguity, auto reset,
  explicit precedence, shared-consumer compatibility, atomic failure, trace order and Canvas/guide/legend
  rematerialization coverage are required. Phase 10 adds `unknown` and applies the same lifecycle to new types.

## Scale type vocabulary

```typescript
type CurrentScaleType = "linear" | "time" | "ordinal";
type PositiveFiniteExceptOne = number; // finite && value > 0 && value !== 1

type PlannedScaleType =
  | CurrentScaleType
  | "log"
  | "pow"
  | "sqrt"
  | "symlog"
  | "utc"
  | "band"
  | "point"
  | "sequential"
  | "quantize"
  | "quantile"
  | "threshold";

type PlannedScaleOptions = {
  type?: PlannedScaleType;
  base?: PositiveFiniteExceptOne;
  exponent?: PositiveFinite;
  constant?: PositiveFinite;
};
```

- `log` maps one strictly positive or one strictly negative quantitative domain. The domain may not
  contain or cross zero. `base` defaults to `10`, affects ticks and nice boundaries, and is valid
  only for `log`.
- `pow` uses a sign-preserving power transform. `exponent` defaults to `1` and is valid only for
  `pow`.
- `sqrt` is the named `pow` specialization with exponent `0.5`; it does not accept an explicit
  `exponent`.
- `symlog` accepts negative, zero and positive quantitative values. `constant` defaults to `1`,
  controls the approximately linear region around zero, and is valid only for `symlog`.
- `utc` has the same input model as `time` but resolves domain boundaries, ticks and labels in UTC
  rather than local calendar time.
- `band` maps a unique ordered discrete domain to contiguous numeric bands and exposes bandwidth.
  `point` maps the same domain to zero-width centers. Their padding and alignment vocabulary remains
  owned by the accepted bar-width and offset geometry contracts.
- `sequential` maps a quantitative or temporal domain to concrete colors. Its range, palette,
  interpolation and gradient-guide behavior are owned by the accepted continuous-color vertical contract.
- `quantize` divides one finite continuous domain pair into equal intervals for a discrete range.
  A range of length `n` creates `n` intervals.
- `quantile` infers thresholds from a non-empty finite sample domain for a discrete range. A range of
  length `n` creates `n` quantile classes.
- `threshold` takes strictly increasing explicit thresholds. `n` thresholds require exactly
  `n + 1` discrete range values.
- Position channels accept `linear | log | pow | sqrt | symlog | time | utc | ordinal | band | point`
  when their field and mark grain are compatible. Appearance channels may use the discretizing types
  only when every resolved range value is valid for that channel.
- `nice` is valid for transformed quantitative, `time` and `utc` auto domains. `zero` remains
  valid only where zero is representable and is rejected for `log`, temporal and discrete scales.
- Automatic domains, explicit-domain precedence, shared-consumer compatibility and deterministic
  rematerialization follow the existing scale contract.
- `identity` and `bin-ordinal` remain Proposed. Identity bypasses normal mapping, while bin-ordinal
  overlaps the current histogram bin owner.
- Status: Planned, NOT IMPLEMENTED. Each type needs domain/range validation, mapping, ticks where
  applicable, mark and guide rematerialization, TypeScript declarations, and representative boundary
  coverage before becoming Implemented.

## Scale mapping policies

```typescript
type PlannedScalePolicies = {
  clamp?: boolean;
  reverse?: boolean;
  unknown?: unknown;
};
```

- `clamp` defaults to `false`. For continuous numeric and temporal scales it constrains mapped
  values outside the resolved domain to the nearest range endpoint. It does not mutate the domain and
  is rejected for ordinal, band, point, quantile and threshold scales.
- `reverse` defaults to `false` and reverses the final resolved range after auto or explicit range
  resolution. Therefore an already reversed explicit range plus `reverse: true` is intentionally
  reversed a second time.
- `unknown` is absent by default, preserving each action's current missing/invalid-row behavior.
  When present, it supplies the mapped value for a missing or invalid input and must pass the target
  channel's concrete value validation. It does not add a domain member.
- Policies are stored in semantic scale state. Any change must rematerialize every registered consumer
  of the shared scale in deterministic plan order and must leave the previous program unchanged when
  validation fails.
- Status: Planned, NOT IMPLEMENTED. Coverage must include omitted/true/false policies, reversed explicit
  ranges, out-of-domain values, shared consumers, channel-valid and invalid unknown values, Canvas
  rematerialization and renderer parity.
