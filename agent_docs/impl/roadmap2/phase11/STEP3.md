# Roadmap 2 — Phase 11 Step 3: Gate A Regression Hierarchy Primitive

## 목표

Canonical regression scatterplot의 concrete values를 유지하면서 Canvas → plot → consumer tree를 primitive actions로
명시하고 첫 visual approval Gate를 준비한다.

## 진행 상태

- [x] Hierarchy variant manifest and exact unchanged target public chain
- [x] Readable primitive chain using explicit `parent`, `before` and `after`
- [x] Grid → band → points → regression line → axis local order
- [x] Legend Canvas ownership and title ownership contract
- [x] Stored tree, reachability and draw-order assertions
- [x] Baseline semantic/per-node concrete equivalence and intentional draw-order delta
- [x] High-resolution browser and `primitive.png` rendering
- [x] Gallery metadata and plot-region ink checks
- [x] Gate A source, image, tree and draw-order review package
- [x] Explicit user approval before STEP4

## 구현 결과

- `graphic-hierarchy`는 approval 전용 primitive-only visual variant다. Canonical public call chain은 baseline과
  동일하며 아직 `user-facing.png`를 만들지 않는다.
- `canvas`는 유일한 root다. `plot-main`은 grid, regression band, points, regression line과 axes를 소유하고,
  origin/size legend graphics는 `canvas`가 직접 소유한다.
- Canonical regression chart에는 title이 없다. Title은 contract상 legend와 같은 Canvas-owned sibling이며 실제
  domain integration은 STEP5에서 검증한다.
- Baseline과 hierarchy variant는 semantic state와 `plot-main`을 제외한 모든 concrete graphic value가 같다.
  Canvas draw call 종류와 개수도 같다.
- 기존 flat baseline의 `grid → points → band → line`을 target hierarchy의
  `grid → band → points → line`으로 고쳤으므로 draw-call sequence와 pixels는 의도적으로 다르다.

## 승인 대상 tree

```text
canvas
├─ plot-main
│  ├─ horizontalGridLines
│  ├─ pointsRegressionBands
│  ├─ points
│  ├─ pointsRegressionLines
│  └─ x/y axis lines, ticks, labels and titles
├─ series legend graphics
└─ size legend graphics
```

## 검증 근거

- Primitive contract: `node --test test/charts/cars-regression-scatterplot/variants/primitive.test.js`
- High-resolution artifact: `.artifacts/test/png/roadmap2/cars-regression-scatterplot/graphic-hierarchy/primitive.png`
- Gallery browser verification: `npm run artifacts:gallery:test`

## Gate A

승인 전에는 Canvas/mark/guide domain action의 attachment behavior를 바꾸거나 `user-facing.png`를 만들지 않는다.

## 완료 조건

The primitive hierarchy is visually approved, preserves chart meaning and concrete geometry, and explicitly approves
the intended band-before-points pixel change.

Gate A was approved by the user on 2026-07-17.
