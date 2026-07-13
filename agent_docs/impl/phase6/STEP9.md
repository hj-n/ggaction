# Phase 6 — Step 9: Final Public Action Program

## 목표

Chart contract의 최종 action chain을 standalone public program으로 작성하고 primitive
baseline과 semantic/graphic/renderer 결과를 수렴시킨다.

## 진행 상태

- [ ] `examples/cars-density-area/program.js`
- [ ] Final public chain without raw primitives
- [ ] Public semantic acceptance
- [ ] Public action hierarchy acceptance
- [ ] Primitive/public exact graphicSpec equality
- [ ] Primitive/public Canvas call equality
- [ ] Caller data and prior program immutability
- [ ] y-density shortest call acceptance
- [ ] x-density orientation unit/acceptance case
- [ ] Full tests, conceptual commit, push

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
