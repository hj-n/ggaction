# Roadmap 2 — Phase 4 Step 7: Filter Predicate Modes

## 목표

`filterData`에 strict comparison predicate와 inclusive/exclusive range를 추가한다.

## 진행 상태

- [ ] Shared predicate/range validation
- [ ] `eq | neq | lt | lte | gt | gte`
- [ ] Numeric/string ordered compatibility
- [ ] Inclusive/exclusive range endpoints
- [ ] Immutable values/provenance와 source order
- [ ] Mutual exclusivity, sparse/mixed/empty coverage
- [ ] Primitive/public equivalence와 user-facing PNG
- [ ] Types, docs, contracts, commit와 push

## 완료 조건

Every predicate mode has deterministic owned provenance and never changes source rows.
