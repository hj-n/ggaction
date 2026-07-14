# Axis action contracts

Current direct-action contracts for this domain. Shared notation and lifecycle rules live in [`../README.md`](../README.md).

## Shared complete-axis contract

`createXAxis`와 `createYAxis`는 같은 option shape를 사용한다.

- `scale`: optional scale ID. 생략하면 channel ID를 사용하거나 parent `createAxes`가 유일한 scale을 전달한다.
- `coordinate`: optional existing coordinate ID. 선택 channel/scale을 소비하는 layer가 실제로 연결돼야 한다.
- `position`: x는 Implemented `"bottom"`과 Planned `"top"`, y는 Implemented `"left"`와 Planned
  `"right"`를 사용하며 defaults는 bottom/left다.
- `line`: `{ color?, lineWidth? }`; axis-line child에 전달한다.
- `ticksAndLabels`: `{ count?, values?, ticks?, labels? }`; shared tick/label child에 전달한다.
- `title`: `{ text?, at?, offset?, rotation?, color?, fontSize?, fontFamily?, fontWeight? }`.
- Effect: line → ticks/labels → title wrapped action 순서로 semantic guide와 concrete graphics를 만든다.
- Planned: complete axis는 선택한 top/right position을 모든 child action에 전달한다.

## Shared axis-line contract

- Create parameters: `scale?`, `position?`, `color?`, `lineWidth?`.
- Edit parameters: `position?`, `color?`, `lineWidth?`; scale은 semantic guide에서 읽는다.
- `scale`: create-only ID, 기본 channel ID.
- `position`: x=`"bottom"`, y=`"left"`는 Implemented이고 x=`"top"`, y=`"right"`는 Planned다.
- `color`: non-empty string, 기본 theme text color.
- `lineWidth`: non-negative finite number, 기본값 `1`; 0은 보이지 않는 line을 허용한다.
- Effect: endpoint는 resolved scale range와 Canvas plot bounds에서 항상 재추론한다. semantic guide에는
  scale만 저장하고 style과 endpoints는 graphical state다.

## Shared axis-tick contract

- Create parameters: `scale?`, `position?`, `count?`, `values?`, `length?`, `color?`, `lineWidth?`.
- Edit parameters는 `scale`을 제외하고 동일하다.
- `count`: positive integer, 기본값 `5`; `values`와 mutually exclusive다.
- `values`: scale domain 안의 finite number/timestamp 또는 ordinal scalar array. histogram x는 둘 다
  생략하면 bin boundaries, ordinal x는 domain 전체를 사용한다.
- `length`: non-negative finite number, 기본 `6`.
- `color`: non-empty string, 기본 `"#64748b"`.
- `lineWidth`: non-negative finite number, 기본 `1`.
- Effect: tick values/config는 private guide config, scale reference는 semantic guide, concrete endpoints는
  line collection에 저장한다. Canvas/scale 변화는 values 정책을 유지한 채 positions를 다시 계산한다.

## Shared axis-label contract

- Create parameters: `scale?`, `position?`, `count?`, `values?`, `offset?`, `format?`, `color?`,
  `fontSize?`, `fontFamily?`, `fontWeight?`; edit에서는 scale을 제외한다.
- `count`/`values`: tick contract와 같으며 existing ticks가 있으면 생략 시 그 정책을 재사용한다.
- `offset`: non-negative finite number; x default `18`, y default `12`.
- `format`: Implemented `"auto" | { decimals: nonNegativeInteger }`와 Planned `AxisFormatString`.
  Planned numeric tokens는 quantitative, UTC tokens는 time에서만 허용하고 ordinal은 auto만 허용한다.
- `color`: non-empty string; `fontSize`: positive finite; `fontFamily`: non-empty string;
  `fontWeight`: string 또는 finite number.
- Effect: formatted text, aligned data-space coordinates와 font style을 text collection에 저장한다.
  ticks와 count/values 정책이 충돌하면 거부한다.

## Shared ticks-and-labels contract

- Create: `scale?`, `position?`, `count?`, `values?`, `ticks?`, `labels?`.
- Edit: create option에서 scale을 제외하며 빈 edit는 오류다.
- `ticks`: `{ length?, color?, lineWidth? }`.
- `labels`: `{ offset?, format?, color?, fontSize?, fontFamily?, fontWeight? }`.
- Effect: shared count/values를 tick과 label child에 원자적으로 전달한다. nested appearance는 해당 child만 바꾼다.

## Shared axis-title contract

- Create: `text?`, `scale?`, `position?`, `at?`, `offset?`, `rotation?`, `color?`, `fontSize?`,
  `fontFamily?`, `fontWeight?`; edit에서는 scale을 제외한다.
- `text`: non-empty string. 생략하면 unique connected field/aggregate 또는 density provenance에서 추론한다.
- `at`: `"start" | "center" | "end"` 또는 scale domain 안의 data value; 기본 center.
- `offset`: non-negative finite; x default `42`, y default `52`.
- `rotation`: finite radians; x bottom/top default `0`, y left default `-Math.PI / 2`, Planned right
  default `Math.PI / 2`.
- font/color contract는 labels와 같고 default font size는 `13`, weight는 `600`이다.
- Effect: semantic axis title text와 graphical layout/style을 분리 저장한다.

## Shared grid-direction contract

- `scale`: optional continuous scale ID; horizontal은 y, vertical은 x에서 유일하게 추론한다.
- `coordinate`: optional Cartesian coordinate ID; encoded layers에서 추론한다.
- `count`: positive integer, `values`와 mutually exclusive다.
- `values`: non-empty finite number array이며 scale domain 안에 있어야 한다.
- `color`: non-empty string, 기본 `"#e2e8f0"`.
- `lineWidth`: non-negative finite number, 기본 `1`.
- `strokeDash`: even-length non-negative finite number array, 기본 `[]`.
- Effect: semantic guide에는 scale/coordinate, graphical config에는 tick policy/style, concrete line
  collection에는 endpoints를 저장한다. 관련 mark보다 앞에 graphic을 배치한다.

## Shared formal types

```typescript
type AxisPositionX = "bottom";
type AxisPositionY = "left";
type TickValue = string | boolean | Finite;
type TickOptions = {
  length?: NonNegativeFinite;
  color?: NonEmptyString;
  lineWidth?: NonNegativeFinite;
};
type LabelOptions = {
  offset?: NonNegativeFinite;
  format?: "auto" | { decimals: NonNegativeInteger };
  color?: NonEmptyString;
  fontSize?: PositiveFinite;
  fontFamily?: NonEmptyString;
  fontWeight?: FontWeight;
};
type TickAndLabelOptions = {
  count?: PositiveInteger;
  values?: readonly TickValue[];
  ticks?: TickOptions;
  labels?: LabelOptions;
};
type AxisTitleOptions<P extends string> = TextStyle & {
  text?: NonEmptyString;
  position?: P;
  at?: "start" | "center" | "end" | TickValue;
  offset?: NonNegativeFinite;
  rotation?: Finite;
};
type CompleteAxisOptions<P extends string> = {
  scale?: UserId;
  coordinate?: UserId;
  position?: P;
  line?: { color?: NonEmptyString; lineWidth?: NonNegativeFinite };
  ticksAndLabels?: TickAndLabelOptions;
  title?: AxisTitleOptions<P>;
};
```

## `createAxes`

- Signature: `createAxes({ coordinate?, x?, y? })`
- `coordinate.id`: existing coordinate ID. 생략하면 encoded Cartesian layers가 참조하는 유일한 ID를 추론한다.
- `coordinate.type`: `"auto" | "cartesian" | "polar"`, 기본값 `"auto"`; stored type assertion이다.
- `x`, `y`: `false`, `{}`, 또는 complete-axis options. 생략하면 해당 encoded channel을 자동 선택하고,
  `false`는 명시적으로 끈다.
- Effect: coordinate를 만들거나 고치지 않고 stored positional layers를 읽어 selected complete axes를 만든다.
- 오류: mixed Cartesian/Polar channel, ambiguous coordinate/scale, missing stored coordinate, no selected axis를 거부한다.
- Coverage: `test/unit/actions/guides/create-axes.test.js`와 temporal/ordinal/histogram axis tests가 inference,
  opt-out, ambiguity, stored coordinate와 rematerialization을 검증한다.
- Planned: Polar semantics는 Implemented지만 Polar guide graphics는 Planned capability다. theta/radial action
  이름과 concrete guide contract는 아직 Proposed 상태라 현재 API로 노출하지 않는다.

### Formal values — `createAxes`

- Implemented: `createAxes({ coordinate?: { id?: UserId; type?: "auto" | "cartesian" | "polar" }; x?: false | CompleteAxisOptions<"bottom">; y?: false | CompleteAxisOptions<"left"> } = {})`; Polar 선택은 현재 validation error다.
- Planned (NOT IMPLEMENTED): `{ x?: false | CompleteAxisOptions<"bottom" | "top">; y?: false | CompleteAxisOptions<"left" | "right"> }`
- Proposed (NOT IMPLEMENTED): Polar axis option schema; x/y에 Polar 값을 억지로 추가하지 않는다.

### Value coverage — `createAxes`

- `coordinate.id`
  - ✅ Covered: omission with unique coordinate, explicit matching ID, unknown/ambiguous IDs.
- `coordinate.type`
  - ✅ Covered: omission/`"auto"`, `"cartesian"`, stored `"polar"` rejection, unknown value.
  - 🟣 Proposed: `"polar"` execution after Polar guide materialization exists; currently it is assertion-only and rejected.
- `x`, `y`
  - ✅ Covered: omission inference, `{}` explicit selection, `false` opt-out, nested options, neither selected error.
  - ⚠️ Partial: multi-layer shared coordinate with one disabled axis and multiple candidate scales pairwise cases.
  - 🟡 Planned: x top/y right complete-axis forwarding while preserving channel defaults.
- Proposed: future Polar axes should use coordinate channels rather than force x/y objects into Polar semantics.
- Evidence: `test/unit/actions/guides/create-axes.test.js`.

## `createXAxis`

- Signature: `createXAxis({ scale?, coordinate?, position?, line?, ticksAndLabels?, title? })`
- Parameter contract와 effect는 Shared complete-axis contract를 따른다. x default는 bottom이고 top은 Planned다.
- Coverage: `test/unit/actions/guides/axis-actions.test.js`가 defaults, routing, coordinate와 duplicates를 검증한다.

### Formal values — `createXAxis`

- Implemented: `createXAxis(options?: CompleteAxisOptions<"bottom">)`
- Planned (NOT IMPLEMENTED): `CompleteAxisOptions<"bottom" | "top">`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createXAxis`

- `scale`, `coordinate`
  - ✅ Covered: defaults, explicit IDs, missing/unused/conflicting resources.
- `position`
  - ✅ Covered: omission→`"bottom"`, explicit bottom, unsupported value rejection.
  - 🟡 Planned: `"top"`; outward baseline/ticks, labels/title offsets와 top-margin validation.
- `line`, `ticksAndLabels`, `title`
  - ✅ Covered: omission/default objects, nested representative overrides, unknown nested keys, partial duplicate failure.
  - ⚠️ Partial: all three nested appearance objects customized simultaneously.
- Evidence: `test/unit/actions/guides/axis-actions.test.js`.

## `createYAxis`

- Signature: `createYAxis({ scale?, coordinate?, position?, line?, ticksAndLabels?, title? })`
- Parameter contract와 effect는 Shared complete-axis contract를 따른다. y default는 left이고 right는 Planned다.
- Coverage: `test/unit/actions/guides/axis-actions.test.js`가 symmetric behavior를 검증한다.

### Formal values — `createYAxis`

- Implemented: `createYAxis(options?: CompleteAxisOptions<"left">)`
- Planned (NOT IMPLEMENTED): `CompleteAxisOptions<"left" | "right">`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createYAxis`

- `scale`, `coordinate`
  - ✅ Covered: defaults, explicit IDs and conflicts.
- `position`
  - ✅ Covered: omission→`"left"`, explicit left, unsupported value rejection.
  - 🟡 Planned: `"right"`; mirrored tick/label/title geometry와 right-margin validation.
- `line`, `ticksAndLabels`, `title`
  - ✅ Covered: defaults, representative nested overrides and invalid nested keys.
- Evidence: `test/unit/actions/guides/axis-actions.test.js`.

## `createXAxisLine`

- Signature: `createXAxisLine({ scale?, position?, color?, lineWidth? })`.
- Shared axis-line contract를 따르며 missing graphic을 만든다.
- Coverage: `test/unit/actions/guides/axis-line-actions.test.js`.

### Formal values — `createXAxisLine`

- Implemented: `createXAxisLine({ scale?: UserId; position?: "bottom"; color?: NonEmptyString; lineWidth?: NonNegativeFinite } = {})`
- Planned (NOT IMPLEMENTED): `{ position?: "bottom" | "top" }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createXAxisLine`

- `scale`: ✅ Covered default `"x"`, explicit ID, unknown/unconsumed/unresolved scale.
- `position`: ✅ Covered `"bottom"`, invalid; 🟡 Planned `"top"`.
- `color`: ✅ Covered default, explicit non-empty, empty/non-string rejection.
- `lineWidth`: ✅ Covered default `1`, zero, positive, negative/non-finite rejection.
- Evidence: `test/unit/actions/guides/axis-line-actions.test.js`.

## `createYAxisLine`

- Signature와 contract는 x와 같고 position/geometry가 left y-axis 기준이다.
- Coverage: `test/unit/actions/guides/axis-line-actions.test.js`.

### Formal values — `createYAxisLine`

- Implemented: `createYAxisLine({ scale?: UserId; position?: "left"; color?: NonEmptyString; lineWidth?: NonNegativeFinite } = {})`
- Planned (NOT IMPLEMENTED): `{ position?: "left" | "right" }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createYAxisLine`

- `scale`: ✅ Covered default `"y"`, explicit and invalid resources.
- `position`: ✅ Covered `"left"`, invalid; 🟡 Planned `"right"`.
- `color`, `lineWidth`: ✅ Covered default/representative/boundary/invalid classes shared with x.
- Evidence: `test/unit/actions/guides/axis-line-actions.test.js`.

## `editXAxisLine`

- Signature: `editXAxisLine({ position?, color?, lineWidth? })`.
- 기존 x-axis line이 필요하고 geometry를 다시 추론한 뒤 appearance를 적용한다.
- Coverage: axis-line tests가 partial edit, invalid style와 Canvas rematerialization을 검증한다.

### Formal values — `editXAxisLine`

- Implemented: `editXAxisLine({ position?: "bottom"; color?: NonEmptyString; lineWidth?: NonNegativeFinite } = {})`
- Planned (NOT IMPLEMENTED): `{ position?: "bottom" | "top" }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editXAxisLine`

- `position`: ✅ Covered omitted/existing and `"bottom"`; 🟡 Planned `"top"` with create/edit parity.
- `color`, `lineWidth`: ✅ Covered partial edits, unchanged omissions and invalid values.
- Empty options: ⚠️ Partial. 현재 geometry re-inference 용도로 `{}`가 허용되는 동작을 더 명시적으로 고정할 필요가 있다.
- Evidence: `test/unit/actions/guides/axis-line-actions.test.js`.

## `editYAxisLine`

- Signature와 edit contract는 x와 같고 y geometry를 사용한다.
- Coverage: `test/unit/actions/guides/axis-line-actions.test.js`.

### Formal values — `editYAxisLine`

- Implemented: `editYAxisLine({ position?: "left"; color?: NonEmptyString; lineWidth?: NonNegativeFinite } = {})`
- Planned (NOT IMPLEMENTED): `{ position?: "left" | "right" }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editYAxisLine`

- `position`, `color`, `lineWidth`: ✅ Covered symmetric left-side partial edit and errors.
- 🟡 Planned: right-side edit with mirrored create/edit geometry.
- Evidence: `test/unit/actions/guides/axis-line-actions.test.js`.

## `createXAxisTicks`

- Shared tick create contract를 사용하며 bottom ticks를 만들고 Planned top ticks는 바깥쪽 위를 향한다.
- Coverage: axis-tick, histogram-axis, ordinal-axis, temporal-axis tests.

### Formal values — `createXAxisTicks`

- Implemented: `createXAxisTicks({ scale?: UserId; position?: "bottom"; count?: PositiveInteger; values?: readonly TickValue[]; length?: NonNegativeFinite; color?: NonEmptyString; lineWidth?: NonNegativeFinite } = {})`; `count | values` 중 최대 하나.
- Planned (NOT IMPLEMENTED): `{ position?: "bottom" | "top" }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createXAxisTicks`

- `scale`: ✅ Covered default/explicit and invalid resources.
- `position`: ✅ Covered `"bottom"`/invalid; 🟡 Planned `"top"`.
- `count`: ✅ Covered omission→5, positive integer, zero/negative/non-integer, count+values conflict.
- `values`: ✅ Covered finite values/timestamps, histogram boundaries, ordinal domain/subset, out-of-domain/invalid values.
- `length`: ✅ Covered default `6`, zero, positive and negative rejection.
- `color`, `lineWidth`: ✅ Covered defaults, representatives and invalid values.
- Evidence: `test/unit/actions/guides/axis-tick-actions.test.js`, histogram/ordinal/temporal axis tests.

## `createYAxisTicks`

- Shared tick create contract를 사용하며 left ticks를 만들고 Planned right ticks는 바깥쪽 오른쪽을 향한다.
- Coverage: axis-tick와 chart axis tests.

### Formal values — `createYAxisTicks`

- Implemented: x tick schema와 같고 `position?: "left"`.
- Planned (NOT IMPLEMENTED): `{ position?: "left" | "right" }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createYAxisTicks`

- `scale`, `position`, `count`, `values`, `length`, `color`, `lineWidth`
  - ✅ Covered: linear y defaults, explicit values and shared invalid classes.
  - ⚠️ Partial: reversed y domain with explicit values and very dense count.
- 🟡 Planned: right position after mirrored y-axis contract.
- Evidence: axis-tick and chart guide tests.

## `editXAxisTicks`

- Shared tick edit contract를 사용한다. existing tick config가 필요하다.
- Coverage: `test/unit/actions/guides/axis-tick-actions.test.js`.

### Formal values — `editXAxisTicks`

- Implemented: create x tick schema에서 `scale`을 제외한다.
- Planned (NOT IMPLEMENTED): `{ position?: "bottom" | "top" }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editXAxisTicks`

- `position`: ✅ Covered bottom/invalid.
- `count`, `values`: ✅ Covered mode switch, mutually exclusive inputs, rematerialization and invalid domains.
- `length`, `color`, `lineWidth`: ✅ Covered partial appearance edits and invalid values.
- 🟡 Planned: top-position geometry with create/edit parity.
- Evidence: `test/unit/actions/guides/axis-tick-actions.test.js`.

## `editYAxisTicks`

- x와 같은 edit contract를 y scale에 적용한다.
- Coverage: `test/unit/actions/guides/axis-tick-actions.test.js`.

### Formal values — `editYAxisTicks`

- Implemented: create y tick schema에서 `scale`을 제외한다.
- Planned (NOT IMPLEMENTED): `{ position?: "left" | "right" }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editYAxisTicks`

- 모든 parameter는 x edit과 같은 value classes를 사용한다.
  - ✅ Covered: representative values, mode policy and invalid options.
  - ⚠️ Partial: repeated count↔values switching sequence.
- 🟡 Planned: right-position geometry with create/edit parity.
- Evidence: axis-tick and tick-group tests.

## `createXAxisLabels`

- Shared label create contract를 사용한다.
- Coverage: axis-label, temporal/ordinal/histogram axis tests.

### Formal values — `createXAxisLabels`

- Implemented: `createXAxisLabels({ scale?: UserId; position?: "bottom"; count?: PositiveInteger; values?: readonly TickValue[]; ...LabelOptions } = {})`; `count | values` 중 최대 하나.
- Planned (NOT IMPLEMENTED): `{ position?: "bottom" | "top"; format?: AxisFormatString }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createXAxisLabels`

- `scale`, `position`, `count`, `values`
  - ✅ Covered: linear/time/ordinal modes, existing tick reuse, conflict/out-of-domain rejection.
- `offset`: ✅ Covered default `18`, zero/positive, negative rejection.
- `format`
  - ✅ Covered: `"auto"`, `{ decimals: 0 }`, positive decimals, invalid object.
  - ✅ Covered: non-auto time/ordinal rejection.
  - 🟡 Planned: closed `AxisFormatString` numeric/UTC tokens with deterministic browser/Node parity.
- `color`, `fontSize`, `fontFamily`, `fontWeight`
  - ✅ Covered: defaults, representative string/numeric weight and invalid classes.
- Evidence: `test/unit/actions/guides/axis-label-actions.test.js`, temporal/ordinal axis tests.

## `createYAxisLabels`

- Shared label create contract를 y channel에 적용한다.
- Coverage: axis-label 및 chart tests.

### Formal values — `createYAxisLabels`

- Implemented: x label schema와 같고 `position?: "left"`.
- Planned (NOT IMPLEMENTED): `{ position?: "left" | "right"; format?: AxisFormatString }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createYAxisLabels`

- `scale`, `position`, `count`, `values`, `offset`, `format`, font style
  - ✅ Covered: linear y defaults, explicit/derived values, decimal formatting and conflicts.
  - ⚠️ Partial: numeric fontWeight boundaries and reversed range alignment.
- 🟡 Planned: right-side label alignment and shared format tokens.
- Evidence: axis-label and chart guide tests.

## `editXAxisLabels`

- Shared label edit contract를 사용하며 existing config/graphic이 필요하다.
- Coverage: `test/unit/actions/guides/axis-label-actions.test.js`.

### Formal values — `editXAxisLabels`

- Implemented: create x label schema에서 `scale`을 제외한다.
- Planned (NOT IMPLEMENTED): `{ position?: "bottom" | "top"; format?: AxisFormatString }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editXAxisLabels`

- `position`, `count`, `values`, `offset`, `format`, color/font parameters
  - ✅ Covered: partial style edit, decimal format, tick conflict and Canvas rematerialization.
- 🟡 Planned: top position and shared format tokens follow create labels.
- Evidence: `test/unit/actions/guides/axis-label-actions.test.js`.

## `editYAxisLabels`

- x와 같은 edit contract를 y channel에 적용한다.
- Coverage: `test/unit/actions/guides/axis-label-actions.test.js`.

### Formal values — `editYAxisLabels`

- Implemented: create y label schema에서 `scale`을 제외한다.
- Planned (NOT IMPLEMENTED): `{ position?: "left" | "right"; format?: AxisFormatString }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editYAxisLabels`

- 모든 edit parameter
  - ✅ Covered: representative partial edits and shared invalid classes.
  - ⚠️ Partial: switching between auto and decimal format across repeated edits.
- 🟡 Planned: right-side alignment and shared format tokens follow `createYAxisLabels`.
- Evidence: axis-label tests.

## `createXAxisTicksAndLabels`

- Shared aggregate create contract를 x에 적용한다.
- Coverage: `test/unit/actions/guides/axis-tick-group-actions.test.js`.

### Formal values — `createXAxisTicksAndLabels`

- Implemented: `createXAxisTicksAndLabels({ scale?: UserId; position?: "bottom"; ...TickAndLabelOptions } = {})`
- Planned (NOT IMPLEMENTED): `{ position?: "bottom" | "top"; labels?: { format?: AxisFormatString } }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createXAxisTicksAndLabels`

- `scale`, `position`, `count`, `values`
  - ✅ Covered: shared forwarding, count/values conflict and default inference.
- `ticks.length/color/lineWidth`, `labels.offset/format/color/fontSize/fontFamily/fontWeight`
  - ✅ Covered: representative nested overrides, unknown nested keys and independent child effects.
  - ⚠️ Partial: all nested properties explicitly set in one call.
- 🟡 Planned: top position and label format tokens follow leaf actions.
- Evidence: `test/unit/actions/guides/axis-tick-group-actions.test.js`.

## `createYAxisTicksAndLabels`

- Shared aggregate create contract를 y에 적용한다.
- Coverage: axis-tick-group tests.

### Formal values — `createYAxisTicksAndLabels`

- Implemented: x aggregate schema와 같고 `position?: "left"`.
- Planned (NOT IMPLEMENTED): `{ position?: "left" | "right"; labels?: { format?: AxisFormatString } }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createYAxisTicksAndLabels`

- shared and nested parameters
  - ✅ Covered: y defaults, explicit values and trace hierarchy.
  - ⚠️ Partial: full nested option object.
- 🟡 Planned: right position and label format tokens follow both y leaf actions.
- Evidence: axis-tick-group tests.

## `editXAxisTicksAndLabels`

- Shared aggregate edit contract를 x에 적용한다.
- Coverage: axis-tick-group tests가 shared/nested edit와 trace를 검증한다.

### Formal values — `editXAxisTicksAndLabels`

- Implemented: create x aggregate schema에서 `scale`을 제외하며 최소 한 option이 필요하다.
- Planned (NOT IMPLEMENTED): `{ position?: "bottom" | "top"; labels?: { format?: AxisFormatString } }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editXAxisTicksAndLabels`

- `position`, `count`, `values`
  - ✅ Covered: atomic policy changes and invalid mutual use.
- `ticks`, `labels`
  - ✅ Covered: only requested child edit, both child edit and empty edit rejection.
- 🟡 Planned: top position and label format tokens follow leaf actions.
- Evidence: `test/unit/actions/guides/axis-tick-group-actions.test.js`.

## `editYAxisTicksAndLabels`

- Shared aggregate edit contract를 y에 적용한다.
- Coverage: axis-tick-group tests.

### Formal values — `editYAxisTicksAndLabels`

- Implemented: create y aggregate schema에서 `scale`을 제외하며 최소 한 option이 필요하다.
- Planned (NOT IMPLEMENTED): `{ position?: "left" | "right"; labels?: { format?: AxisFormatString } }`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editYAxisTicksAndLabels`

- shared/nested edit parameters
  - ✅ Covered: representative values, child selection and invalid options.
- 🟡 Planned: right-position aggregate edit follows both leaf actions.
- Evidence: axis-tick-group tests.

## `createXAxisTitle`

- Shared title create contract를 bottom x-axis에 적용하며 top은 Planned다.
- Coverage: `test/unit/actions/guides/axis-title-actions.test.js`.

### Formal values — `createXAxisTitle`

- Implemented: `createXAxisTitle({ scale?: UserId; ...AxisTitleOptions<"bottom"> } = {})`
- Planned (NOT IMPLEMENTED): `AxisTitleOptions<"bottom" | "top">`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createXAxisTitle`

- `text`: ✅ Covered inferred field/aggregate/density text, explicit non-empty, ambiguous/empty rejection.
- `scale`: ✅ Covered default/explicit/conflicting scale.
- `position`: ✅ Covered `"bottom"`/invalid; 🟡 Planned `"top"`.
- `at`: ✅ Covered `"start" | "center" | "end"`, in-domain number/category and out-of-domain/invalid.
- `offset`: ✅ Covered default `42`, zero/positive, negative rejection.
- `rotation`: ✅ Covered default `0`, finite explicit and non-finite rejection.
- `color`, `fontSize`, `fontFamily`, `fontWeight`: ✅ Covered defaults, representatives and invalid classes.
- Evidence: `test/unit/actions/guides/axis-title-actions.test.js`.

## `createYAxisTitle`

- Shared title create contract를 left y-axis에 적용하며 right는 Planned다.
- Coverage: axis-title tests.

### Formal values — `createYAxisTitle`

- Implemented: `createYAxisTitle({ scale?: UserId; ...AxisTitleOptions<"left"> } = {})`
- Planned (NOT IMPLEMENTED): `AxisTitleOptions<"left" | "right">`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createYAxisTitle`

- `text`, `scale`, `at`, style: ✅ Covered symmetric inference, data positions and invalid values.
- `position`: ✅ Covered `"left"`; 🟡 Planned `"right"` with default positive half-turn rotation.
- `offset`: ✅ Covered default `52`; `rotation`: ✅ Covered default `-Math.PI / 2` and explicit finite values.
- Evidence: axis-title tests.

## `editXAxisTitle`

- Shared title edit contract를 사용하며 text 또는 appearance를 immutable하게 편집한다.
- Coverage: axis-title tests가 data-space `at`, rematerialization과 invalid values를 검증한다.

### Formal values — `editXAxisTitle`

- Implemented: create x title schema에서 `scale`을 제외한다.
- Planned (NOT IMPLEMENTED): `AxisTitleOptions<"bottom" | "top">`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editXAxisTitle`

- `text`, `position`, `at`, `offset`, `rotation`, style
  - ✅ Covered: semantic text edit, graphical-only appearance edit, data-space relocation, invalid values.
- 🟡 Planned: top position follows `createXAxisTitle`.
- Evidence: axis-title tests.

## `editYAxisTitle`

- x와 같은 edit contract를 y-axis에 적용한다.
- Coverage: axis-title tests.

### Formal values — `editYAxisTitle`

- Implemented: create y title schema에서 `scale`을 제외한다.
- Planned (NOT IMPLEMENTED): `AxisTitleOptions<"left" | "right">`
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editYAxisTitle`

- 모든 edit parameter
  - ✅ Covered: representative semantic/graphical edits and rematerialization.
  - ⚠️ Partial: repeated rotation/at interactions.
- 🟡 Planned: right position follows `createYAxisTitle`.
- Evidence: axis-title tests.

