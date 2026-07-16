# Roadmap 2 — Phase 11 Step 8: Existing Chart-Family Migration

## 목표

Approved ownership rules를 every current public vertical slice에 적용하고 chart-specific flat-order workaround를
제거한다.

## 진행 상태

- [x] Scatterplot and mark-selection variants
- [x] Line and transformed-scale variants
- [x] Histogram, grouped-bar and normalized-stack variants
- [x] Density-area and regression variants
- [x] Error-bar and error-band variants
- [x] Box-plot variants
- [x] Guide/layout variants and title/legend positions
- [x] Primitive/public tree-aware equivalence for every chart
- [x] Full render discovery and Roadmap gallery regeneration
- [x] STEP status, conceptual commits and pushes

## 구현 결과

- Every canonical public chart now has one `canvas` root, one `plot-main` child and explicit plot/canvas ownership.
- Primitive baselines declare the same ownership through `createGraphics({ parent })`; no primitive/public equivalence check
  falls back to flat root order.
- Draw-order assertions traverse the named tree, while the migration contract locks exact children for all public charts.
- All 77 Roadmap 2 variants render complete primitive/public pairs, and same-run decoded pixel equivalence remains green.
- Roadmap metadata creation now publishes complete JSON atomically when paired images render concurrently.

## 완료 조건

Every canonical Canvas-first public example has a valid hierarchy, unchanged approved pixels and no chart-local
attachment fork.
