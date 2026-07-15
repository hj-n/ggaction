# Roadmap 2 — Phase 4 Step 7: Filter Predicate Modes

## 목표

`filterData`에 strict comparison predicate와 inclusive/exclusive range를 추가한다.

## 진행 상태

- [x] Shared predicate/range validation
- [x] `eq | neq | lt | lte | gt | gte`
- [x] Numeric/string ordered compatibility
- [x] Inclusive/exclusive range endpoints
- [x] Immutable values/provenance와 source order
- [x] Mutual exclusivity, sparse/mixed/empty coverage
- [x] Primitive/public equivalence와 user-facing PNG
- [x] Types, docs와 current contract 승격
- [x] Full verification, commit와 push

## 완료 조건

Every predicate mode has deterministic owned provenance and never changes source rows.
