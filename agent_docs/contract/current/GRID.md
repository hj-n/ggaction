# Grid action contracts

Current direct-action contracts for this domain. Shared notation and lifecycle rules live in [`../README.md`](../README.md).

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
type GridDirectionOptions = {
  scale?: UserId;
  coordinate?: UserId;
  count?: PositiveInteger;
  values?: readonly Finite[];
  color?: NonEmptyString;
  lineWidth?: NonNegativeFinite;
  strokeDash?: DashPattern;
};
```

## `createGrid`

- Signature: `createGrid({ horizontal?, vertical? })`.
- `horizontal`: boolean 또는 direction options, 기본 `true`.
- `vertical`: boolean 또는 direction options, 기본 `false`.
- `false`는 끄고 `true`/`{}`는 inference로 생성한다. 최소 한 방향이 필요하다.
- Coverage: `test/unit/actions/guides/grid-actions.test.js`가 default/both directions, tick reuse,
  explicit values, rendering order와 rematerialization을 검증한다.

### Formal values — `createGrid`

- Implemented: `createGrid({ horizontal?: boolean | GridDirectionOptions; vertical?: boolean | GridDirectionOptions } = {})`; horizontal default true, vertical default false.
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `createGrid`

- `horizontal`
  - ✅ Covered: omission→enabled, `true`, `{}`, option object, `false`.
- `vertical`
  - ✅ Covered: omission→disabled, `true`, `{}`, option object, `false`.
- Interaction
  - ✅ Covered: horizontal only, both directions, neither selected error, invalid non-object value.
- No proposal at aggregate level; future direction options belong to direction actions.
- Evidence: `test/unit/actions/guides/grid-actions.test.js`.

## `createHorizontalGrid`

- Signature: `createHorizontalGrid({ scale?, coordinate?, count?, values?, color?, lineWidth?, strokeDash? })`.
- Shared direction contract를 y scale에 적용한다.
- Coverage: grid tests; style boundary 조합은 부분적이다.

### Formal values — `createHorizontalGrid`

- Implemented: `createHorizontalGrid(options?: GridDirectionOptions)`
- Proposed (NOT IMPLEMENTED): ordinal grid positioning `{ placement?: "center" | "boundary" }`.

### Value coverage — `createHorizontalGrid`

- `scale`, `coordinate`: ✅ Covered inference, explicit IDs, ambiguity/unknown/non-Cartesian errors.
- `count`: ✅ Covered default/inferred 5, positive integer, invalid and values conflict.
- `values`: ✅ Covered axis-tick reuse, explicit finite in-domain values, invalid/out-of-domain.
- `color`: ✅ Covered default/explicit/invalid.
- `lineWidth`: ✅ Covered default, zero/positive/invalid.
- `strokeDash`: ✅ Covered `[]`, even-length pattern, odd/negative/non-finite rejection.
- 🟣 Proposed: ordinal grid support; category boundary vs center policy를 정해야 한다.
- Evidence: `test/unit/actions/guides/grid-actions.test.js`.

## `createVerticalGrid`

- Signature는 horizontal과 같고 x scale을 사용한다.
- Coverage: grid와 density-guide tests; style boundary 조합은 부분적이다.

### Formal values — `createVerticalGrid`

- Implemented: `createVerticalGrid(options?: GridDirectionOptions)`
- Proposed (NOT IMPLEMENTED): ordinal grid positioning `{ placement?: "center" | "boundary" }`.

### Value coverage — `createVerticalGrid`

- direction parameters
  - ✅ Covered: x-scale inference, histogram bin alignment, explicit values/styles and invalid resources.
  - ⚠️ Partial: temporal vertical grid with calendar ticks.
- 🟣 Proposed: ordinal boundary/center grid contract.
- Evidence: grid and density-guide tests.

