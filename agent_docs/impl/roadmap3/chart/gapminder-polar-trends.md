# Gapminder Polar Trends

## 목적

India, Japan, South Africa의 1955~2005 기대수명 추세를 open Polar line으로 비교한다. Continuous theta,
grouped line series, intentional seam, color legend와 existing Polar guides의 통합을 검증한다.

## 최종 user-facing API

```javascript
chart()
  .createCanvas({
    width: 760,
    height: 620,
    margin: { top: 70, right: 190, bottom: 70, left: 70 }
  })
  .createData({ values: trendRows })
  .createLineMark({ strokeWidth: 2.5, opacity: 0.88 })
  .encodeTheta({
    field: "year",
    scale: { domain: [1955, 2005], range: [0, 330] }
  })
  .encodeR({
    field: "life_expect",
    scale: { domain: [25, 85], zero: false }
  })
  .encodeGroup({ field: "country" })
  .encodeColor({ field: "country", palette: "tableau10" })
  .createGuides({
    axes: {
      theta: { ticksAndLabels: { values: [1955, 1965, 1975, 1985, 1995, 2005] } },
      radius: { ticksAndLabels: { values: [30, 40, 50, 60, 70, 80] } }
    },
    grid: {
      theta: { values: [1955, 1965, 1975, 1985, 1995, 2005] },
      radial: { values: [30, 40, 50, 60, 70, 80] }
    },
    legend: { position: "right" }
  });
```

## Contract

- `trendRows`는 source rows에서 세 국가만 유지하며 source year/value를 바꾸지 않는다.
- Theta order는 ascending year이고 equal theta tie는 source order다.
- 각 country는 11개 point의 one open path이며 `Z` command가 없다.
- Explicit `[0, 330]` theta range가 visible seam을 남긴다.
- `closed` omission은 `false`와 동일하다.
