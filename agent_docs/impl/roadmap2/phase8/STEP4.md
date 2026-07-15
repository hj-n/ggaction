# Roadmap 2 — Phase 8 Step 4: Vertical createBoxPlot

## 목표

Wrapped child actions를 조합해 canonical vertical `createBoxPlot`을 구현하고 Gate A primitive를 정확히 재현한다.

## 진행 상태

- [ ] `createBoxPlot` option validation and unique default ID
- [ ] Direct and encoded-layer source/channel inference
- [ ] Wrapped summary/outlier data composition
- [ ] Explicit `createErrorBar` whisker/cap composition
- [ ] Ranged bar body, median rule and outlier point composition
- [ ] Stable drawing order and representative context
- [ ] Primitive/public semantic/graphic/Canvas/pixel equality
- [ ] Shortest call, ambiguity, trace and immutability coverage
- [ ] STEP status, conceptual commits and pushes

## 완료 조건

Canonical public chain이 Gate A와 exact match하고 every meaningful child action이 `createBoxPlot` trace 아래에 남는다.
