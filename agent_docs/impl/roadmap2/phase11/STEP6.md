# Roadmap 2 — Phase 11 Step 6: Composite Ownership and Rematerialization

## 목표

Error bar, error band, box plot와 regression component가 stable named ownership을 유지하고 every rematerialization이
tree placement를 보존하게 한다.

## 진행 상태

- [x] Composite component ownership matrix without a new composite registry
- [x] Error-bar main rule and cap attachment/order
- [x] Error-band fill and optional boundary attachment/order
- [x] Box, whisker, median and outlier attachment/order
- [x] Regression band/line interleaving with the source point layer
- [x] Highlight selected-last ordering inside the owning mark
- [x] Canvas/scale/data/edit rematerialization attachment stability
- [x] Subtree removal and stale-descendant cleanup
- [x] Trace and immutability coverage
- [x] STEP status, conceptual commit and push

## 구현 결과

- Composite registry를 추가하지 않았다. Error bar, error band, box plot과 regression의 named components는 모두
  `plot-main`의 ordinary children이다.
- Box body의 remove/recreate materialization은 plot placement를 다시 명시하고 whisker/caps → box → median →
  outlier 순서를 보존한다.
- Regression-derived dataset provenance로 source layer를 유일하게 찾고 band를 source 앞, line을 source 뒤에
  배치한다. Namespaced derived dataset ID가 여러 source 후보를 구분한다.
- Resize, scale edit, component edit와 highlight는 named attachment를 보존하며 highlight selected-last는 owning
  mark의 generated `items` 안에서만 일어난다.

## 완료 조건

Composite parts remain ordinary named graphics with explicit owners, and every edit preserves or deliberately removes
their subtree without stale nodes.
