# Roadmap 2 — Phase 6 Step 4: Canonical Error-Bar Primitive

## 목표

Cars `Origin`별 mean `Acceleration` 95% CI chart를 independent interval values와 raw rule/cap primitives로 만든다.

## 진행 상태

- [ ] Independent mean/sample-stdev/stderr/Student-t CI rows
- [ ] Immutable derived-interval semantic provenance primitive
- [ ] Vertical main rule concrete geometry
- [ ] Lower/upper 8px cap concrete geometry
- [ ] Axes, horizontal grid, inferred-title target and chart title
- [ ] Explicit drawing order and Canvas-call assertions
- [ ] `baseline` metadata and 2× `primitive.png`
- [ ] Gate B user visual confirmation
- [ ] STEP status, conceptual commit and push

## Gate B

Canvas `720×460`, default blue 2px solid rules, 8px caps, horizontal grid and no legend를 확인한다. Statistical
result와 graphical geometry는 future `createIntervalData`/`createErrorBar` implementation을 import하지 않는다.

## 완료 조건

Canonical cars error-bar appearance, numeric rows, guide policy and target public chain are approved.
