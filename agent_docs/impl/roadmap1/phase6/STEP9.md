# Phase 6 — Step 9: Final Public Action Program

## 목표

Chart contract의 최종 action chain을 standalone public program으로 작성하고 primitive
baseline과 semantic/graphic/renderer 결과를 수렴시킨다.

## 진행 상태

- [x] `examples/cars-density-area/program.js`
- [x] Final public chain without raw primitives
- [x] Public semantic acceptance
- [x] Public action hierarchy acceptance
- [x] Primitive/public exact graphicSpec equality
- [x] Primitive/public Canvas call equality
- [x] Caller data and prior program immutability
- [x] y-density shortest call acceptance
- [x] x-density orientation unit/acceptance case
- [x] Full tests, conceptual commit, push

## 최종 chain 검증

Top-level trace는 다음 순서를 가진다.

```text
createCanvas
createData
createAreaMark
encodeDensity
encodeColor
createGuides
createTitle
```

`encodeDensity` direct children과 `createGuides` direct children은 chart contract hierarchy와
같아야 한다. Primitive program의 top-level trace는 raw actions만 가지며 새 high-level
action이 섞이지 않는다.

## 동등성 기준

- 전체 `graphicSpec.objects` deep equality
- 전체 `graphicSpec.order` equality
- Mock Canvas calls equality
- Density path child/order/points/fill equality
- Axes/grid/legend/title concrete properties equality

Semantic dataset/layer IDs는 contract의 deterministic names를 사용해 가능한 한 exact
equality를 목표로 한다. Primitive와 public semantic state가 의도적으로 다른 경우에는
차이를 문서에 먼저 명시해야 하며 자동으로 허용하지 않는다.

## 구현 결과

- Final example은 일곱 개 top-level public actions만 사용한다.
- Public과 primitive의 전체 semanticSpec, graphicSpec과 mock Canvas call sequence가 exact equality다.
- Caller-owned cars와 derived rows, graphical children의 ownership/immutability를 검증했다.
- y-density shortest public flow와 STEP 5의 x-density orientation case가 함께 유지된다.
- 전체 403개 테스트, coverage gate (`94.44% / 89.62% / 98.56%`)와 public/primitive 2× PNG render test를 통과했다.
