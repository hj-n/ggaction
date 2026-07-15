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

## Numeric contract

- Kernel fixture는 production density helper를 import하지 않고 네 kernel의 exact formula를 계산한다.
- `unit`과 `count`는 같은 sample grid에서 `count = unit × valid group count`를 만족한다.
- Revision은 source와 이전 derived dataset을 변경하지 않고 새 deterministic dataset ID를 만든다.
- Area path, x/y/color scales, axes와 양방향 grid는 revision 뒤 complete materialization plan으로 갱신된다.

## 범위 경계

Adaptive bandwidth, per-group bandwidth, cumulative density와 renderer-side statistical inference는 포함하지 않는다.
