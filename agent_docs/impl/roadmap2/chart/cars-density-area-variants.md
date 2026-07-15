# Cars Density Area Variants

## 목적

Canonical cars density-area chart를 유지하면서 area appearance, density kernel/normalization과 immutable
density reassignment의 target behavior를 고정한다.

## 공통 baseline

- Data: finite `Acceleration`과 nominal `Origin`을 가진 cars rows
- Mark: `densities` area, grouped and colored by `Origin`
- Density: Gaussian, unit normalization, bandwidth `0.6`, 100 steps
- Guides: horizontal/vertical grids, complete axes, top categorical legend and chart title
- Canvas: `720×500`, plot bounds `x=80..680`, `y=130..430`

## Visual variants

| Variant | Target capability | 구분되는 결과 |
| --- | --- | --- |
| `baseline` | canonical parity | Existing approved density chart |
| `area-outline-edit` | `editAreaMark`, `area-outline` | 모든 density path에 dark outline과 낮아진 opacity |
| `epanechnikov-kernel` | density kernel vocabulary | compact-support kernel의 다른 peak/tail geometry |
| `count-normalization` | density normalization | Origin별 sample count가 반영된 y magnitude |
| `density-revision` | `editDensity` | 새 derived revision과 triangular/count result |
| `wrapped-title-bottom` | bottom title position과 wrapping | x-axis 아래의 2-line title/subtitle block |

## Target user-facing chains

### Area outline edit

```javascript
createCarsDensityArea(rows)
  .editAreaMark({
    target: "densities",
    opacity: 0.35,
    stroke: "#334155",
    strokeWidth: 1.5
  });
```

### Kernel and normalization

```javascript
chart()
  .createCanvas({
    width: 720,
    height: 500,
    margin: { top: 130, right: 40, bottom: 70, left: 80 }
  })
  .createData({ id: "cars", values: rows })
  .createAreaMark({ id: "densities", opacity: 0.5 })
  .encodeDensity({
    field: "Acceleration",
    groupBy: "Origin",
    bandwidth: 0.6,
    kernel: "epanechnikov"
  })
  .encodeColor({ field: "Origin", scale: { palette: "tableau10" } })
  .createGuides({
    grid: { horizontal: {}, vertical: {} },
    legend: {
      position: "top",
      direction: "vertical",
      columns: 3,
      titlePosition: "left",
      offset: 8
    }
  })
  .createTitle({
    text: "Distribution of Acceleration",
    subtitle: "By Origin (cars dataset)"
  });
```

`count-normalization`은 같은 chain에서 `normalization: "count"`를 사용한다. `density-revision`은 baseline
뒤 다음 action을 추가한다.

```javascript
.editDensity({
  target: "densities",
  bandwidth: 0.9,
  kernel: "triangular",
  normalization: "count"
});
```

### Bottom wrapped title

```javascript
chart()
  .createCanvas({
    width: 720,
    height: 620,
    margin: { top: 130, right: 40, bottom: 190, left: 80 }
  })
  // canonical density mark, encodings, and guides
  .createTitle({
    text: "Distribution of Acceleration Across Vehicle Origins",
    subtitle: "Kernel density estimates for acceleration, grouped by origin in the cars dataset",
    position: "bottom",
    align: "center",
    offset: 60,
    gap: 12,
    maxWidth: 270,
    wrap: "word",
    lineHeight: 26
  });
```

- Plot bounds는 baseline과 같은 `x=80..680`, `y=130..430`이다.
- Title line centers는 `y=[501, 527]`, subtitle은 `y=[557, 583]`이며 모두 `x=380`이다.
- Occupied bounds `x=245, y=490, width=270, height=100`은 x-axis title과 Canvas bottom 사이에 들어간다.
- Word mode의 oversized single token은 Unicode code point boundary character fallback을 사용한다.
  Gate C reference token `acceleration-density-estimate`는 70px target에서 빈 줄 없이 3줄로 나뉜다.
- Renderer는 full semantic text를 wrap하지 않고 concrete text children 네 개를 그대로 그린다.
- Approved primitive와 public `createTitle` 결과는 semantic/graphic/order/Canvas calls와 decoded pixels가
  exact하게 일치한다.

## Numeric contract

- Kernel fixture는 production density helper를 import하지 않고 네 kernel의 exact formula를 계산한다.
- `unit`과 `count`는 같은 sample grid에서 `count = unit × valid group count`를 만족한다.
- Revision은 source와 이전 derived dataset을 변경하지 않고 새 deterministic dataset ID를 만든다.
- Area path, x/y/color scales, axes와 양방향 grid는 revision 뒤 complete materialization plan으로 갱신된다.

## 범위 경계

Adaptive bandwidth, per-group bandwidth, cumulative density, renderer-side statistical inference와 renderer-side
text wrapping은 포함하지 않는다.
