# Binned Heatmap

## 목적

두 quantitative raw field를 rectangular 2D bins로 집계하고 각 cell count를 연속 color로 표현한다.
Pre-gridded heatmap과 달리 입력 row에 cell bounds나 color value가 미리 존재하지 않는다.

## 최종 목표 API

```javascript
chart()
  .createCanvas({
    width: 700,
    height: 500,
    margin: { top: 70, right: 140, bottom: 75, left: 85 }
  })
  .createData({ values: cars })
  .createHeatmap({
    x: { field: "Weight_in_lbs", fieldType: "quantitative" },
    y: { field: "Miles_per_Gallon", fieldType: "quantitative" },
    bin: {
      bins: { x: 10, y: 8 },
      extent: { x: [1500, 5200], y: [8, 48] },
      includeEmpty: true
    },
    color: { scale: { palette: "blues", domain: [0, 33] } },
    rect: { stroke: "white", strokeWidth: 1 },
    guides: {
      axes: {
        x: { title: { text: "Vehicle weight (lb)" } },
        y: { title: { text: "Miles per gallon" } }
      },
      legend: { title: "Cars per bin" }
    }
  })
  .createTitle({
    text: "Fuel Economy by Vehicle Weight",
    subtitle: "398 cars binned into a 10 × 8 grid",
    align: "center"
  });
```

## 저장 결과

- raw Cars dataset은 변경하지 않는다.
- generated named dataset은 80 cell row를 갖고 x0/x1/y0/y1/count를 저장한다.
- rect layer는 generated dataset을 참조한다.
- x/y scale은 requested extent, color scale은 resolved count domain/palette를 저장한다.
- `graphicSpec`에는 80개의 concrete rect bounds/fill과 materialized guides만 남는다.

## 실패 조건

- x/y field가 없거나 quantitative intent가 아니면 validation error
- eligible finite pair가 없으면 validation error
- bin count가 positive integer가 아니면 validation error
- explicit extent가 invalid하거나 eligible value를 포함하지 않으면 validation error
- pre-gridded mode와 binned mode option을 혼합하면 actionable validation error
