# STEP 7 — Runtime and `closed` Lifecycle

## 진행 상태

- [x] Polar line completeness policy
- [x] Coordinate-aware line materializer dispatch
- [x] `createLineMark({ closed })`
- [x] `editLineMark({ closed })`
- [x] Linear-only Polar curve validation

Existing Cartesian line behavior와 stored schema를 깨지 않는다. Coordinate family를 먼저 판별한 뒤 해당
materializer만 실행한다.
