# Mixed Program Dashboard

## Chart 목표

Phase 6의 representative dashboard는 서로 다른 데이터, coordinate와 Canvas 크기를 가진 완성 chart를
결합한다. Composition 자체가 child chart의 semantic meaning을 바꾸지 않는지, nested placement와 child
replacement가 concrete graphic tree만 결정하는지 검증한다.

## 사용 데이터와 child views

| Slot | 데이터 | View | 검증 목적 |
| --- | --- | --- | --- |
| `main` | Cars | scatterplot | dense point, Cartesian axes와 unequal width |
| `detail` | Jobs | grouped bar | rect collection, legend와 unequal height |
| `trend` | Gapminder | line chart | nested vertical composition과 path clipping |
| replacement | Cars | Origin donut | Cartesian child를 Polar child로 교체 |

## 최종 user-facing API

### Unequal-size horizontal dashboard

```javascript
const overview = hconcat({
  id: "overview",
  programs: [
    { id: "main", program: carsScatterplot },
    { id: "detail", program: jobsGroupedBar }
  ],
  gap: 20,
  align: "center",
  padding: 12
});
```

### Nested dashboard

```javascript
const dashboard = vconcat({
  id: "dashboard",
  programs: [
    { id: "overview", program: overview },
    { id: "trend", program: gapminderLineChart }
  ],
  gap: 18,
  align: "center",
  padding: { top: 14, right: 14, bottom: 14, left: 14 }
});
```

### Layout edit와 child replacement

```javascript
const revised = overview
  .editCompositionLayout({ gap: 28, align: "start" })
  .replaceCompositionChild({
    target: "detail",
    program: carsOriginDonut
  });
```

`detail`은 content 이름이 아니라 stable composition slot identity다. Replacement 뒤에도 ordered child ID는
`["main", "detail"]`을 유지한다.

## Action hierarchy

```text
hconcat / vconcat
├─ useProgram(child) × N
└─ materializeComposition
   ├─ namespaceGraphicSnapshot(child) × N
   └─ placeCompositionChildren

editCompositionLayout
└─ rematerializeComposition

replaceCompositionChild
├─ useProgram(replacement)
└─ rematerializeComposition
```

## Stored-result contract

- `children`은 explicit 또는 resolved child ID를 key로 하는 frozen lookup이다.
- `compositionSpec.children`은 drawing/layout order를 결정하는 frozen ID array다.
- Parent `graphicSpec.order`에는 root Canvas 하나만 존재한다.
- 각 child graphic ID는 complete composition ancestry로 namespace된다.
- Child root Canvas는 parent snapshot 안에서 `x`, `y`, `width`, `height`, `background`를 가진 nested Canvas다.
- 원본 child program과 이전 composition program은 layout edit/replacement 뒤에도 변하지 않는다.

## Gate G visual variants

1. `unequal-horizontal`: center-aligned scatterplot + grouped bar
2. `nested-dashboard`: horizontal overview 위에 Gapminder trend를 둔 vertical composition
3. `replacement`: 같은 `detail` slot에 Polar donut을 배치하고 start alignment와 새 gap을 적용

