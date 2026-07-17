# Cars Origin Donut

## 목적

Cars의 `Origin`별 row count를 한 바퀴의 각도 비율로 표현한다. Aggregate theta partition, full-circle
normalization, non-zero inner radius와 categorical legend를 검증한다.

## 최종 user-facing API

```javascript
chart()
  .createCanvas({
    width: 640,
    height: 500,
    margin: { top: 55, right: 190, bottom: 55, left: 55 }
  })
  .createData({ values: cars })
  .createArcMark({ innerRadius: 0.56, padAngle: 1.5 })
  .encodeTheta({ field: "Origin", aggregate: "count" })
  .encodeColor({ field: "Origin", palette: "tableau10" })
  .createGuides({
    axes: false,
    grid: false,
    legend: { position: "right", title: "Origin" }
  });
```

## Contract

- Origin domain은 source first appearance인 USA, Europe, Japan 순서다.
- Count는 각각 254, 73, 79이며 총 406이다.
- Unpadded sector sweep 합은 정확히 360도다.
- `padAngle`은 각 sector 양쪽에서 절반씩 줄이며 aggregate 비율 자체를 바꾸지 않는다.
- 모든 sector는 같은 outer radius와 `0.56 × availableRadius` inner radius를 가진다.
- Legend item order와 fill order는 Origin domain과 같다.
