# Jobs Radar Chart

## 목적

Jobs 2000 데이터에서 8개 직군별 men/women 비중을 closed radar paths로 비교한다. Categorical theta,
explicit domain order, grouped closure와 radius `[0, 1]` mapping을 검증한다.

## 최종 user-facing API

```javascript
chart()
  .createCanvas({
    width: 820,
    height: 650,
    margin: { top: 90, right: 190, bottom: 90, left: 90 }
  })
  .createData({ values: radarRows })
  .createLineMark({ closed: true, strokeWidth: 2.5, opacity: 0.9 })
  .encodeTheta({
    field: "role",
    fieldType: "nominal",
    scale: { domain: roleOrder }
  })
  .encodeR({ field: "share", scale: { domain: [0, 1], zero: true } })
  .encodeGroup({ field: "sex" })
  .encodeColor({ field: "sex", palette: "tableau10" })
  .createGuides({
    axes: {
      theta: { title: { text: "Occupation" } },
      radius: {
        ticksAndLabels: { values: [0, 0.25, 0.5, 0.75, 1] },
        title: { text: "Share" }
      }
    },
    grid: {
      theta: { values: roleOrder },
      radial: { values: [0, 0.25, 0.5, 0.75, 1] }
    },
    legend: { position: "right", title: "Sex" }
  });
```

## Contract

- `roleOrder`는 Accounting, Architecture, Engineering, Law, Management, Nursing, Secretarial, Teaching이다.
- 각 source count는 같은 role/year의 men+women count로 나눠 `share`를 만든다.
- Theta point scale은 각 category를 equal sector center에 놓고 source row order와 무관하게 domain order로 잇는다.
- 각 sex path는 8개 point와 정확히 하나의 final `Z` command를 가진다.
- Closure는 first point를 duplicate row/command로 추가하지 않는다.
