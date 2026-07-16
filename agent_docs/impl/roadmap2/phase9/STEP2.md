# Roadmap 2 — Phase 9 Step 2: Shared Selector Grammar

## 목표

All mark-selection actions가 공유할 pure normalized selector와 independent reference fixtures를 구현한다.

## 진행 상태

- [x] Field/channel exclusive selector schema and immutable normalization
- [x] `eq`, `neq`, `gt`, `gte`, `lt`, `lte`
- [x] `oneOf` and inclusive/exclusive `range`
- [x] Grouped/ungrouped `min`, `max`, positive `count`
- [x] `ties: first | all`, deterministic group/item order
- [x] Numeric/string compatibility, missing/mixed/empty behavior
- [x] Invalid mode/operator/value preflight and caller-input ownership
- [x] Independent numeric/string fixtures and invariants
- [x] STEP status and local verification

## 구현 결과

- `src/grammar/markSelection.js`가 selector normalization과 item-key evaluation의 canonical pure owner다.
- Resolver input은 `{ key, fields, channels }`만 요구한다. Mark type, concrete property, Canvas와 renderer는 알지
  못한다.
- Rank의 group 순서는 첫 item appearance, result는 min ascending/max descending과 stable item order를 따른다.
- Ordered rank input에 number/string이 섞이면 첫 eligible value와 같은 type만 비교 대상으로 삼고 나머지는
  ineligible로 처리한다. Missing과 non-finite 값도 제외한다.

## 검증

- `npm run test:unit`

## 테스트 기준

Each accepted operator and boundary has direct tests; rank output is independent from production mark materializers.

## 완료 조건

One pure selector owner deterministically returns item keys and never inspects pixels, Canvas or renderer state.
