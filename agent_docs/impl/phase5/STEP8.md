# Phase 5 — Step 8: createRegression

## 목표

Target point layer에서 x/y/groupBy와 resource를 infer해 regression data, band, line을
한 번에 완성하는 atomic `createRegression` action을 구현한다.

## 진행 상태

- [x] Target/x/y/groupBy inference
- [x] Explicit option precedence와 ambiguity errors
- [x] Shared dataset/coordinate/scale resolution
- [x] `createRegressionBand`
- [x] `createRegressionLine`
- [x] Thin aggregate `createRegression`
- [x] Explicit points → bands → lines graphical order
- [x] Canvas/scale rematerialization integration
- [x] Shortest valid call과 full trace tests
- [x] Public regression API documentation, commit, push

## Action hierarchy

```text
createRegression
├─ createRegressionData
├─ createRegressionBand
│  ├─ createAreaMark
│  ├─ encodeX
│  ├─ encodeYRange
│  ├─ encodeGroup
│  └─ rematerializeAreaMark
└─ createRegressionLine
   ├─ createLineMark
   ├─ encodeX
   ├─ encodeY
   ├─ encodeColor
   ├─ encodeGroup
   └─ rematerializeLineMark
```
