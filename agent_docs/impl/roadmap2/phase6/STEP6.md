# Roadmap 2 — Phase 6 Step 6: Error-Bar Variant Primitives

## 목표

Horizontal orientation, explicit interval input and cap/style parameter classes를 public implementation 전에
primitive targets로 고정한다.

## 진행 상태

- [ ] Horizontal mean Horsepower CI primitive using y/x/x2
- [ ] Explicit center/lower/upper interval primitive without derived data
- [ ] `caps: false` stale-cap absence and drawing order
- [ ] Custom cap size/stroke/width/dash/opacity primitive
- [ ] Independent numeric/geometry reference values
- [ ] Three variant metadata chains and 2× primitive PNGs
- [ ] Gate C user visual confirmation
- [ ] Feedback revision and reconfirmation when needed
- [ ] STEP status, conceptual commit and push

## Gate C

- `horizontal`: x interval, y `Origin`, vertical caps
- `explicit-interval`: existing summary rows, no interval transform, no caps
- `styled-caps`: custom fixed cap size and constant rule appearance

## 완료 조건

The three remaining visual equivalence classes and exact target action chains are approved.
