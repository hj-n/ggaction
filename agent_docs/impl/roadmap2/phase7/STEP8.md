# Roadmap 2 — Phase 7 Step 8: Regression Delegation

## 목표

Existing `createRegressionBand`를 regression-specific compatibility boundary로 유지하면서 generic
`createErrorBand` explicit mode에 graphical composition을 위임한다.

## 진행 상태

- [x] Existing regression semantic/graphic/trace snapshot fixtures
- [x] Regression result provenance and field inference preserved
- [x] `createRegressionBand → createErrorBand(explicit)` wrapped hierarchy
- [x] Existing area outline semantics preserved without generic boundaries
- [x] Grouped/ungrouped, linear/polynomial/loess compatibility
- [x] Band opacity/stroke/width/curve forwarding
- [x] Drawing order, scale sharing and consumer-plan equality
- [x] Earlier regression programs and caller rows immutable
- [x] Focused and full regression visual regressions
- [x] STEP status, conceptual commit and push

## 완료 조건

Delegation이 implementation duplication을 제거하지만 existing public regression output과 compatibility를 바꾸지 않는다.
