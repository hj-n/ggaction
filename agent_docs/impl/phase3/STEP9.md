# Phase 3 — Step 9: Grid와 Graphic Placement

## 목표

Histogram의 raw horizontal grid 코드를 다음 호출로 교체한다.

```javascript
.createGrid()
```

기본값은 horizontal grid on, vertical grid off다. Grid action이 mark 뒤에
호출되어도 concrete rendering order에서는 관련 mark 앞에 배치한다.

## 진행 상태

- [x] `createGraphics`의 `before`/`after` placement 구현
- [x] Placement validation, immutability, trace test
- [ ] Axis/grid 공통 tick 추론 구현
- [ ] `createHorizontalGrid` 구현
- [ ] `createVerticalGrid` 구현
- [ ] Aggregate `createGrid` 구현
- [ ] Scale과 Canvas 변경 시 grid rematerialization
- [ ] Histogram progression의 raw grid 코드 제거
- [ ] 사용자 문서 갱신
- [ ] 전체 테스트와 PNG 검증

## API

```javascript
createGrid({
  horizontal?,
  vertical?
})
```

각 방향은 boolean 또는 option object를 받는다.

```javascript
.createGrid({
  horizontal: {
    scale: "y",
    coordinate: "main",
    count: 5,
    color: "#e2e8f0",
    lineWidth: 1,
    strokeDash: []
  },
  vertical: false
})
```

방향별 option은 `scale`, `coordinate`, `count`, `values`, `color`,
`lineWidth`, `strokeDash`다. `count`와 `values`는 동시에 사용할 수 없다.

## 기본값과 추론

```javascript
{
  horizontal: true,
  vertical: false
}
```

- Horizontal grid는 y scale을 사용하고 plot 좌우를 연결한다.
- Vertical grid는 x scale을 사용하고 plot 위아래를 연결한다.
- Scale과 coordinate는 관련 encoding에서 유일할 때 추론한다.
- Explicit values, explicit count, 기존 axis tick config, binned x boundaries,
  continuous nice ticks 순으로 grid values를 결정한다.
- Axis가 아직 없어도 encoding과 resolved scale이 있으면 grid를 생성한다.
- 여러 후보 중 안전하게 선택할 수 없으면 explicit ID를 요구한다.

## Action 구조

```text
createGrid
├─ createHorizontalGrid?
│  ├─ editSemantic(guide.grid.horizontal.scale)
│  ├─ editSemantic(guide.grid.horizontal.coordinate)
│  ├─ createGraphics(before first related mark)
│  └─ rematerializeHorizontalGrid
└─ createVerticalGrid?
   ├─ editSemantic(guide.grid.vertical.scale)
   ├─ editSemantic(guide.grid.vertical.coordinate)
   ├─ createGraphics(before first related mark)
   └─ rematerializeVerticalGrid
```

`createGrid`는 방향 선택과 child 호출 순서만 담당한다. 방향별 child가 resource
추론, validation, semantic 저장, concrete materialization을 소유한다.

## Graphic placement

```javascript
createGraphics({ id, type, length?, before?, after? })
```

- `before`와 `after`는 동시에 사용할 수 없다.
- Placement target은 기존 top-level graphic이어야 한다.
- 생략하면 기존처럼 order 마지막에 추가한다.
- Canvas보다 앞에 graphic을 배치할 수 없다.
- `graphicSpec.order`를 immutable하게 복사한다.
- Placement argument는 `createGraphics` trace에 기록된다.
- Equivalent repeated creation은 기존 order가 요청 관계를 만족할 때만
  idempotent하다.

Grid는 같은 coordinate와 scale을 사용하는 mark 중 `graphicSpec.order`에서 가장
앞선 mark 앞에 삽입한다.

## Rematerialization

```text
editCanvas
└─ rematerializeGrid
   ├─ rematerializeHorizontalGrid?
   └─ rematerializeVerticalGrid?
```

Canvas width, height, margin 또는 연결된 scale이 바뀌면 semantic과 style은
유지하고 concrete line endpoints와 positions만 다시 계산한다.

## Progression 변경

`carsHistogramActions`에서 raw `guide.grid.horizontal` semantic,
`horizontalGridLines` creation/edit, helper의 `horizontalGrid` 값을 제거하고
`.createGrid()`를 호출한다. Axis, legend, title의 현재 단계는 유지한다.

최종 order는 다음을 만족해야 한다.

```text
canvas → horizontalGridLines → bars → axes → legend → title
```

## 제외 범위

- Public grid edit aggregate
- Minor/major grid 구분
- Polar grid
- Grid band fill
- 기존 arbitrary graphic을 이동하는 `moveGraphics`
- Axis와 grid의 강제 동시 생성
