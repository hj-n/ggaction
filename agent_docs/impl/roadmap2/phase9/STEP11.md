# Roadmap 2 — Phase 9 Step 11: Cross-Cutting Robustness

## 목표

All selector actions, mark types and highlight options의 interaction matrix와 rematerialization convergence를 고정한다.

## 진행 상태

- [x] Every operator × applicable field/channel/property representative and item/stack grain
- [x] Count/group/ties, empty/missing/mixed/duplicate and deterministic order
- [x] Explicit/current/unique/ambiguous target and selection resolution
- [x] Default recipe and every explicit style option/application error
- [x] `dimOthers`, front order, offset and encoded-style precedence
- [x] Multiple selection IDs and highlight assignment replacement
- [x] Canvas/scale/encoding/group/filter/cardinality order-independence
- [x] No stale selected IDs, complement styles, child order or translated geometry
- [x] Aggregate preflight and earlier-program/caller-input immutability
- [x] Coverage floors and critical selection/materialization files
- [x] STEP status, conceptual commit and push

## 구현 결과

- Shared selector의 모든 operator를 public reusable selection state에서 실행하고 field/channel/property,
  item/stack grain, count/group/ties와 deterministic order를 함께 고정했다.
- Explicit/current/unique/ambiguous target, multiple selection IDs, highlight replacement와 rejected aggregate의
  atomicity/caller-input ownership을 교차 검증한다.
- Color encoding, scale reversal, Canvas resize와 `filterMarks`가 highlight 전후 어느 순서로 호출되어도 동일한
  final semantic/graphic/config state로 수렴한다.
- Point rematerialization은 저장된 highlight를 제거한 clean baseline을 먼저 만들고 기본 fill까지 concrete하게
  복원한 뒤 selection intent를 재평가한다. 따라서 과거 highlight fill/opacity가 새 children에 누출되지 않는다.
- Selection actions, selector/filter grammar와 item/state/filter materialization에 explicit critical coverage floor를
  추가했다.

## 검증

- `npm run test:coverage`
- `npm test`
- `npm run test:render`

## 테스트 전략

Numeric selector oracles, structural presence/order assertions, concrete rematerialization assertions and only the
three visually distinct approved pixel pairs are kept separate.

## 완료 조건

Equivalent final state converges regardless of compatible authoring order, and every invalid call is atomic.
