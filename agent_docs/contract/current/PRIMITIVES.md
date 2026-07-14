# Primitive action contracts

Current direct-action contracts for this domain. Shared notation and lifecycle rules live in [`../README.md`](../README.md).

## `editSemantic`

- Signature: `editSemantic({ property, value })`.
- `property`: 필수 supported semantic path string. user ID selector는 `dataset[id]`, `layer[id]`,
  `scale[id]`, `coordinate[id]`; system guide keys는 `guide.axis.x` 같은 closed path를 사용한다.
- `value`: selected path schema에 맞는 scalar, object 또는 array. caller-owned nested value를 복사/freeze한다.
- Effect: 해당 path만 structural copy하고 기존 program을 보존한다. path가 dataset/layer/scale/coordinate를
  가리키면 current context를 내부적으로 갱신할 수 있다. graphic rematerialization은 자동으로 하지 않는다.
- 오류: unknown path, closed vocabulary 위반, invalid transform/scale/guide value, existing source dataset
  values 교체를 거부한다.
- Coverage: `test/unit/actions/primitives/edit-semantic.test.js`가 structural copy, ownership,
  dataset immutability, path/schema validation과 trace summary를 검증한다.

### Formal values — `editSemantic`

- Implemented: `editSemantic({ property: SemanticPropertyPath; value: ValueForSemanticPath<typeof property> })`; path/value pair는 semantic grammar의 closed schema다.
- Proposed (NOT IMPLEMENTED): wildcard path, multi-property object 또는 batch edit.

### Value coverage — `editSemantic`

- `property`
  - ✅ Covered: supported dataset/layer/encoding/scale/coordinate/guide/title paths, user IDs, unknown path rejection.
  - ⚠️ Partial: every supported leaf path does not yet have one direct primitive case.
  - 🟣 Proposed: no wildcard/batch paths; primitive remains one-property-per-action by design.
- `value`
  - ✅ Covered: scalar, nested object/array ownership, closed vocabulary/schema validation, trace summarization.
  - ✅ Covered: source dataset values cannot be replaced.
  - ⚠️ Partial: every transform schema leaf and every guide semantic leaf direct coverage.
- Effect
  - ✅ Covered: structural copy and context inference without automatic graphic compilation.
- Evidence: `test/unit/actions/primitives/edit-semantic.test.js`.

## `createGraphics`

- Signature: `createGraphics({ id, type, length?, before?, after? })`.
- `id`: 필수 새 top-level graphic ID. equivalent repeated definition은 idempotent하다.
- `type`: `"canvas" | "collection" | "circle" | "rect" | "line" | "text" | "path"`.
- `length`: non-negative integer. homogeneous drawable type에 지정하면 generated child collection을 만들며
  생략 시 single graphic, `0`이면 empty collection이다. heterogeneous `collection`은 children edit로 채운다.
- `before`, `after`: existing top-level graphic ID; mutually exclusive다. concrete rendering order를
  명시하며 Canvas 앞 배치는 허용하지 않는다.
- Effect: backend-neutral concrete object와 order를 structural copy로 추가한다. visual property는 아직 없다.
- 오류: invalid ID/type/length, conflicting repeated definition/placement, unknown anchor를 거부한다.
- Coverage: `test/unit/actions/primitives/create-graphics.test.js`가 all creation modes, idempotence,
  placement와 invalid definitions를 검증한다.

### Formal values — `createGraphics`

- Implemented: `createGraphics({ id: UserId; type: "canvas" | "collection" | "circle" | "rect" | "line" | "text" | "path"; length?: NonNegativeInteger; before?: UserId; after?: UserId })`; `before | after` 중 최대 하나.
- Planned (NOT IMPLEMENTED): `{ parent?: UserId }` for backend-neutral graphic-tree attachment.
- Proposed (NOT IMPLEMENTED): renderer-specific `svg | g` types는 추가하지 않는다.

### Value coverage — `createGraphics`

- `id`: ✅ Covered valid/invalid IDs, equivalent idempotence and conflicts.
- `type`
  - ✅ Covered: `"canvas" | "collection" | "circle" | "rect" | "line" | "text" | "path"` creation paths.
  - ✅ Covered: unknown type rejection.
  - 🟣 Proposed: no renderer-specific `svg/g`; new backend-neutral primitive only when multiple actions need it.
- `length`
  - ✅ Covered: omitted single, zero empty, positive collection, invalid negative/non-integer and resize transition.
- `before`, `after`
  - ✅ Covered: each placement, mutual exclusion, unknown anchor, Canvas-before restriction, idempotent/conflicting placement.
- 🟡 Planned: collection/Canvas parent attachment, sibling ordering, global target lookup and depth-first rendering.
- Evidence: `test/unit/actions/primitives/create-graphics.test.js`.

## `editGraphics`

- Signature: `editGraphics({ target, property, value })`.
- `target`: existing top-level graphic ID 또는 generated child ID(`points:1`).
- `property`: selected graphic type가 지원하는 concrete property. 공통 opaque style bag은 허용하지 않는다.
- `value`
  - single graphic: property schema에 맞는 scalar, nested array 또는 object.
  - collection + scalar/non-distributed value: compatible children 모두에 broadcast.
  - collection + outer array: child count와 길이가 같으면 index별 distribute. path `points`처럼 property
    자체가 nested array인 경우 한 child value 단위를 보존한다.
  - `children`: heterogeneous collection의 typed child object array를 원자적으로 교체한다.
- Effect: concrete graphic path만 structural copy한다. semantic state나 automatic compiler는 관여하지 않는다.
- 오류: unknown target/property, incompatible child type, mismatched distributed length, non-finite geometry,
  negative dimensions/strokes, opacity 밖의 값과 invalid Canvas text vocabulary를 거부한다.
- Coverage: `test/unit/actions/primitives/edit-graphics.test.js`와
  `test/contracts/shared-graphic-validation.test.js`가 distribution, broadcast, nested paths,
  heterogeneous children, resize, structural copy와 renderer-shared validation을 검증한다.

### Formal values — `editGraphics`

- Implemented: `editGraphics({ target: UserId | GeneratedChildId; property: GraphicPropertyForTarget; value: GraphicValueForProperty })`; one property per action, collection scalar broadcast 또는 exact-length distribution.
- Proposed (NOT IMPLEMENTED): multi-property dictionary/batch edit는 현재 one-change trace invariant와 충돌하므로 제안하지 않는다.

### Value coverage — `editGraphics`

- `target`
  - ✅ Covered: top-level ID, generated child ID, unknown target.
- `property`
  - ✅ Covered: type-specific canvas/circle/rect/line/text/path properties, `length`, heterogeneous `children`.
  - ⚠️ Partial: every valid property does not yet have all boundary classes in direct primitive tests.
- `value` distribution
  - ✅ Covered: scalar broadcast, outer array distribution, mismatched length, nested points arrays preserved,
    heterogeneous child replacement and shared compatible-property broadcast.
- concrete value classes
  - ✅ Covered: finite geometry, non-negative dimensions/strokes, `[0,1]` opacity, non-empty appearance strings,
    Canvas text vocabulary and renderer-shared validation.
  - ⚠️ Partial: extreme finite magnitudes and every fontWeight/string color accepted by each backend.
- 🟣 Proposed: no multi-property dict edit; one action continues to represent one property change.
- Evidence: `test/unit/actions/primitives/edit-graphics.test.js`,
  `test/contracts/shared-graphic-validation.test.js`.
