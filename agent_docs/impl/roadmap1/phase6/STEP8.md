# Phase 6 — Step 8: createGuides and Title Integration

## 목표

Density area의 axes, horizontal/vertical grids, top color legend를 `createGuides()` shortest call에
통합하고 title/subtitle과 plot이 top margin 안에서 겹치지 않도록 검증한다.

## 진행 상태

- [x] Area quantitative x/y axis applicability
- [x] Density axis zero/tick behavior
- [x] Existing horizontal/vertical grid reuse
- [x] Area color legend automatic applicability
- [x] Top legend options forwarding
- [x] `legend: false`와 guide opt-out
- [x] Title/subtitle + top legend layout validation
- [x] Explicit graphical order
- [x] Canvas edit all-consumer rematerialization
- [x] Guide/title docs, tests, full regression, commit, push

## Guide hierarchy

```text
createGuides
├─ createAxes
├─ createGrid
└─ createLegend
   └─ createCategoricalLegend
```

`createTitle`은 guide가 아니므로 계속 별도 top-level action이다. `createGuides`는 title을
생성하거나 수정하지 않는다.

## Layout 규칙

- Title/subtitle은 Canvas top의 existing title layout을 사용한다.
- Top legend는 plot top에서 `offset`만큼 위에 배치한다.
- 두 component가 실제로 겹치거나 Canvas 밖으로 나가면 more top margin을 요구한다.
- Margin을 자동 확대하거나 existing plot bounds를 몰래 변경하지 않는다.
- 최종 rendering order는 grid → area → axes → legend → title이다.

## 검증 기준

- Shortest applicable axes/grid는 shared coordinate와 scales를 한 번씩만 설명한다.
- Density axis title은 derived field 이름 대신 원래 field 의미를 사용하도록
  `encodeDensity`가 저장한 metadata에서 infer한다.
- Default y-density는 x title `Acceleration`, y title `Density`를 사용한다.
- x-density는 x title `Density`, y title `Acceleration`로 뒤집힌다.

## 구현 결과

- Density transform의 source/value/density metadata를 axis title inference에 연결했다.
- `createGuides`가 area color legend를 자동 적용하고 nested top options를 그대로 전달한다.
- Explicit grid options로 horizontal과 vertical grid를 axes 뒤, mark 앞에 materialize한다.
- Top title과 top legend는 생성 순서와 무관하게 실제 block overlap을 검증한다.
- Canvas edit는 scales, area, grids, axes, legend와 title을 모두 다시 materialize한다.
- 전체 400개 테스트와 coverage gate를 통과했다 (`lines 94.48%`, `branches 89.64%`, `functions 98.56%`).
