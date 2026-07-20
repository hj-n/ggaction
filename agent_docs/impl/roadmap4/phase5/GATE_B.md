# Gate P5-B — `createWindowData` vertical slice

## 상태

- Gate: `P5-B`
- 상태: `ready-for-review`
- 검토 대상 remote checkpoint: `68f7456` (`origin/main`)
- 승인 전 차단: `createBin2DData`, binned `createHeatmap`와 Phase 5 후속 Step

## 승인 대상 public API

```typescript
createWindowData({
  id,
  source?,
  partitionBy?,
  sortBy?,
  operations
}): ChartProgram;
```

정확한 대표 실행 chain은 다음과 같다.

```javascript
const program = chart()
  .createData({
    id: "events",
    values: [
      { group: "A", order: 2, value: 3 },
      { group: "A", order: 1, value: 2 },
      { group: "B", order: 1, value: 4 }
    ]
  })
  .createWindowData({
    id: "windowedEvents",
    partitionBy: "group",
    sortBy: [{ field: "order" }],
    operations: [
      { op: "rowNumber", as: "rowNumber" },
      { op: "cumulativeSum", field: "value", as: "runningValue" }
    ]
  });
```

Materialized `[rowNumber, runningValue]`는 source row order에서
`[[2, 5], [1, 2], [1, 4]]`다. 계산은 partition 내부 stable sort order를 사용하지만 output은 source row
order를 유지한다.

## state와 trace 결과

- `semanticSpec.datasets[windowedEvents]`는 source ID, normalized `window` transform과 immutable values를 함께 저장한다.
- `partitionBy` default는 `[]`, `sortBy` default는 `[]`, sort order default는 `"ascending"`이다.
- `lag`/`lead` offset default는 `1`, boundary default는 `null`이다.
- `rowNumber`, `rank`, `denseRank`, `cumulativeSum`, `lag`, `lead`를 지원한다.
- Operation은 선언 순서대로 실행되어 뒤 operation이 앞 output field를 읽을 수 있다.
- Source/output field collision, duplicate output, missing field, incompatible sort type와 invalid operation을
  state 생성 전에 명확하게 거부한다.
- Lifecycle은 immutable create-only다. Duplicate ID는 기존 dataset과 consumer를 바꾸지 않고 오류를 낸다.
- Top-level trace hierarchy는 `createWindowData → createDerivedData + materializeWindowData → editSemantic`이다.
- Window는 row 수를 보존해도 주변 row에 의존하므로 facet은 source partition 뒤 각 child에서 canonical
  materializer를 replay한다. 이미 계산된 전체 dataset을 단순 필터하지 않는다.
- Renderer와 `graphicSpec`에는 window 전용 branch를 추가하지 않았다. 일반 mark가 materialized rows를 소비한다.

## 검증 증거

- Window grammar/action/direct-derived/oracle focused tests: `16/16` pass.
- Unit suite: `1103/1103` pass.
- Contract suite: `121/121` pass.
- Active Gate suite: `9/9` pass.
- Documentation source/generator suite: `32/32` pass.
- Full cumulative suite: `1629/1629` pass.
- Installed-package Node/TypeScript consumer: pass.
- Package artifact: `ggaction@0.0.4`, SHA-256
  `86ccf718b56717902145ddd013f225d01306de4958f3f8c3c7a868b9209fb303`.
- Generated signature, capability, action, reference, metadata와 search freshness checks: pass.
- Full Jekyll verification은 repository failure가 아니라 현재 machine의 Ruby `2.6.10` 때문에 preflight에서
  실행되지 않았다. Locked Pages bundle은 Ruby `3.2+`를 요구한다.

## 전용 예시 차트

[Cars Window Rank Scatterplot](../../../../examples/cars-window-rank-scatterplot/program.js)은 일반 chart가
Window 결과를 소비하는 complete vertical slice다. 유효한 Cars row `392`개를 Origin별 Horsepower 내림차순으로
정렬해 `rank`와 `denseRank`를 계산하고, `rank <= 15`를 적용한 `47`개 point를 그린다. 최종 group 수는
`USA 17`, `Europe 15`, `Japan 15`다. tie 때문에 한 partition이 15개보다 많아질 수 있다는 rank 의미도
그대로 보존한다.

핵심 public chain은 다음과 같다.

```javascript
chart()
  .createCanvas({
    width: 760,
    height: 500,
    margin: { top: 85, right: 155, bottom: 80, left: 80 }
  })
  .createData({ id: "cars", values: rows })
  .createWindowData({
    id: "rankedCars",
    partitionBy: "Origin",
    sortBy: [{ field: "Horsepower", order: "descending" }],
    operations: [
      { op: "rank", as: "horsepowerRank" },
      { op: "denseRank", as: "horsepowerDenseRank" }
    ]
  })
  .filterData({
    id: "topHorsepowerCars",
    source: "rankedCars",
    field: "horsepowerRank",
    predicate: { op: "lte", value: 15 }
  })
  .createScatterPlot({
    id: "rankedCarsPlot",
    data: "topHorsepowerCars",
    x: {
      field: "horsepowerRank",
      fieldType: "quantitative",
      scale: { domain: [0.5, 15.5], nice: false, zero: false }
    },
    y: {
      field: "Miles_per_Gallon",
      fieldType: "quantitative",
      scale: { domain: [8, 35], nice: false, zero: false }
    },
    color: {
      field: "Origin",
      fieldType: "nominal",
      scale: {
        domain: ["USA", "Europe", "Japan"],
        palette: "set2"
      }
    },
    point: { opacity: 0.76, stroke: "#ffffff", strokeWidth: 0.8 },
    guides: {
      axes: {
        x: {
          ticksAndLabels: { values: [1, 3, 6, 9, 12, 15] },
          title: { text: "Horsepower rank within origin" }
        },
        y: { title: { text: "Miles per gallon" } }
      },
      grid: { horizontal: true, vertical: false },
      legend: { title: "Origin", position: "right" }
    }
  })
  .encodePointRadius({ target: "rankedCarsPlot", value: 5 })
  .createTitle({
    text: "Fuel Economy among High-Horsepower Cars",
    subtitle: "Top 15 horsepower ranks within each origin",
    align: "center"
  });
```

Primitive baseline은 production Window materializer를 재사용하지 않는다. 독립 oracle로 row를 계산한 뒤
`createDerivedData + editSemantic`으로 같은 semantic target을 직접 author한다. 검증 결과는 다음과 같다.

- Primitive/public `semanticSpec`, `graphicSpec`, renderer call: exact parity.
- Node PNG primitive/public decoded pixels: exact parity.
- Node PNG: logical `760×500`, physical `1520×1000`, SHA-256
  `dd5358e8a386222489decd5276eec532cd1d74850b2588971f87dc06a378453a`.
- Browser Canvas: logical `760×500`, backing store `1520×1000`, status `47 ranked cars rendered`.
- Browser console error `0`, page error `0`.
- Review artifacts:
  `.artifacts/test/png/review/cars-window-rank-scatterplot/top-horsepower-by-origin/primitive.png`,
  `user-facing.png`, `browser.png`.

## API와 문서 영향

- Existing API를 바꾸지 않는 additive advanced data action이다.
- Runtime registrar, exact TypeScript types, package consumer, transform registry, Current contract/action catalog와
  generated action reference를 동기화했다.
- Public [Window Data Transforms](../../../../docs/api/data/window.md) 페이지가 defaults, operation vocabulary,
  ordering, collision과 immutable lifecycle을 소유한다.
- Runnable browser example은 public action chain을 그대로 import하고 `devicePixelRatio`로 고해상도 backing
  store를 사용한다.
- `SECOND_ARCHITECTURE.md`에는 facet replay가 필요한 dependent-row transform으로 기록했다.

## 승인 후 작업

사용자가 P5-B를 승인하면 상태를 `approved`로 바꾸고 Step 4 `createBin2DData` lifecycle 구현을 시작한다.
P5-C 전에는 binned `createHeatmap` facade를 구현하지 않는다.
