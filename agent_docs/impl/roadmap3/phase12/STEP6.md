# STEP 6 — Guides, Layout, and Facet Composition

## 진행 상태

- [x] Legend lifecycle의 shared transition과 family geometry 분리
- [x] Cartesian/Polar axis component lifecycle 중복 정리
- [x] Facet shared-guide preparation/compatibility/placement 분리
- [x] `legacyCategorical` 경로 equivalence 확인과 canonicalization 여부 결정
- [x] Concat/facet ancestor rematerialization과 layout convergence 유지

Guide family replacement, plot-bound alignment와 reserved-space validation contract는 바꾸지 않는다.

## 결과

- Legend edit/remove가 하나의 target resolution lifecycle을 공유하고 family별 geometry/reconciliation은 기존 owner에 유지된다.
- Cartesian과 Polar axis는 representation, coordinate validation과 오류 계약이 달라 cross-coordinate factory로 합치지 않았다. 각 family 내부의 component factory가 공통 lifecycle을 계속 소유한다.
- Facet shared legend는 preparation/compatibility, placement/attachment와 legacy categorical realization으로 분리했다.
- `legacyCategorical`은 canonical legend와 resource ID, concrete recipe와 inferred config가 달라 exact equivalence가 증명되지 않았다. 호환 경로로 명시적으로 유지한다.
- Facet/legend/layout tests와 normal suite 1,543개가 통과했고 package entry budget 320개를 유지했다.
