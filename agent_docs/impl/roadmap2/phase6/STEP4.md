# Roadmap 2 — Phase 6 Step 4: Canonical Error-Bar Primitive

## 목표

Cars `Origin`별 mean `Acceleration` 95% CI chart를 independent interval values와 raw rule/cap primitives로 만든다.

## 진행 상태

- [x] Independent mean/sample-stdev/stderr/Student-t CI rows
- [x] Immutable derived-interval semantic provenance primitive
- [x] Vertical main rule concrete geometry
- [x] Lower/upper 8px cap concrete geometry
- [x] Axes, horizontal grid, inferred-title target and chart title
- [x] Explicit drawing order and Canvas-call assertions
- [x] `baseline` metadata and 2× `primitive.png`
- [ ] Gate B user visual confirmation
- [x] STEP status, conceptual commit and push

## Gate B

Canvas `720×460`, default blue 2px solid rules, 8px caps, horizontal grid and no legend를 확인한다. Statistical
result와 graphical geometry는 future `createIntervalData`/`createErrorBar` implementation을 import하지 않는다.

### Gate B result

- Artifact: `.artifacts/test/png/roadmap2/cars-error-bar/baseline/primitive.png`
- Plot bounds: `{ left: 80, right: 680, top: 90, bottom: 390 }`
- Resolved target scales: ordinal x domain `USA → Europe → Japan`, nice y domain `[14, 18]`
- Drawing order: horizontal grid → main rules → lower caps → upper caps → axes → title
- Main/cap lines use `#4c78a8`, width `2`, solid dash, opacity `1`; every cap is 8 logical pixels.
- Primitive trace contains neither `createIntervalData` nor `createErrorBar`.

## 완료 조건

Canonical cars error-bar appearance, numeric rows, guide policy and target public chain are approved.
