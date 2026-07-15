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
- [x] Gate B user visual confirmation
- [x] Mark-independent encoded-layer inference contract
- [x] `encoded-layer-inference` target chain and primitive overlay
- [x] `encoded-layer-inference` metadata and 2× `primitive.png`
- [x] Gate B.1 user visual confirmation
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

## Gate B.1

이미 x/y가 encoding된 point layer 위에 `createErrorBar()`를 option 없이 호출하는 layered target을 검증한다.
Primitive는 existing point actions를 사용하되 future interval/error-bar 부분만 raw semantic/graphic primitives로
작성한다. Source selection과 omitted channel inference는 mark type이 아니라 persisted encoding capability를
기준으로 하며, 같은 data, coordinate와 x/y scales를 공유한다.

### Target chain

```javascript
chart()
  .createCanvas({
    width: 720,
    height: 460,
    margin: { top: 90, right: 40, bottom: 70, left: 80 }
  })
  .createData({ values: cars })
  .createPointMark()
  .encodeX({ field: "Origin", fieldType: "ordinal" })
  .encodeY({ field: "Acceleration" })
  .encodeColor({ field: "Origin" })
  .encodeRadius({ value: 3 })
  .encodeOpacity({ value: 0.18 })
  .createErrorBar()
  .createGuides()
  .createTitle({
    text: "Acceleration by Origin",
    subtitle: "Observations and 95% mean confidence intervals"
  });
```

### Gate B.1 result

- Artifact: `.artifacts/test/png/roadmap2/cars-error-bar/encoded-layer-inference/primitive.png`
- The point and interval layers share source `data`, Cartesian coordinate `main`, ordinal scale `x` and linear scale `y`.
- `Origin` is inferred as the independent position/grouping field and `Acceleration` as the interval field.
- The point color encoding remains appearance; it does not add another statistical grouping field.
- Shared resolved domains are x `USA → Europe → Japan` and y `[8, 24.8]`, so observations and intervals use one coordinate frame.
- Drawing order is horizontal grid → points → main rules → lower caps → upper caps → axes → title.
- Primitive trace contains neither `createIntervalData` nor `createErrorBar`.

## 완료 조건

Canonical cars error-bar appearance and the encoded-layer overlay inference target are approved.
