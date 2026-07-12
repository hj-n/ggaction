# Phase 3 — Step 10: Generalized Categorical Legend

## 목표

기존 line legend와 histogram color legend를 하나의 categorical legend 구조로
통합한다. Histogram은 다음 shortest call만 사용한다.

```javascript
.createLegend()
```

## 진행 상태

- [x] 기존 line legend contract와 trace 분석
- [x] 공통 categorical item/domain resolver
- [x] 공통 right/bottom layout
- [x] Layered symbol recipe와 symbol aggregate
- [x] Line legend를 categorical 구조로 이전
- [x] Histogram bottom color legend
- [x] Composite line + point symbol
- [x] Optional background와 rendering order
- [x] Canvas/scale rematerialization
- [x] Histogram progression의 raw legend 제거
- [x] 사용자 문서 갱신
- [x] 전체 테스트와 PNG 검증

## Action 구조

```text
createLegend
└─ createCategoricalLegend
   ├─ editSemantic(legend definition)
   ├─ createLegendBackground?
   ├─ createLegendSymbols
   │  ├─ createLegendSymbolLines?
   │  ├─ createLegendSymbolPoints?
   │  └─ createLegendSymbolSwatches?
   ├─ createLegendLabels
   └─ createLegendTitle
```

`createLegend`는 target과 categorical applicability만 결정하는 thin aggregate다.
Item/domain 및 layout 계산은 pure helper이며, concrete 생성과 변경은 wrapped
action으로 기록한다.

## Semantic

Bar의 단일 color legend는 `guide.legend.color`를 사용한다.

```javascript
{ scale: "color", title: "Origin" }
```

Line의 combined color/strokeDash legend는 기존 `guide.legend.series`를 유지한다.

```javascript
{
  channels: ["color", "strokeDash"],
  scales: ["color", "strokeDash"],
  title: "Origin"
}
```

두 형태는 동일한 categorical materializer를 사용한다.

## Layered symbol recipe

```javascript
{
  layers: [
    { type: "line" },
    { type: "point", shape: "circle", size: 5 }
  ]
}
```

지원 layer는 `line`, `point`, `swatch`다. 각 item anchor는 한 번 계산하며 모든
symbol layer가 같은 anchor를 공유한다. Recipe는 appearance이므로 private config에
저장하고, `graphicSpec`에는 line/circle/rect concrete primitive만 저장한다.

기본 recipe:

- Line color/strokeDash: line
- Bar color: swatch
- Explicit line + point: composite layers

## Layout

- Line 기본: right, 기존 geometry와 appearance 유지
- Bar 기본: bottom, center, border off
- Bottom label width는 deterministic 문자 폭 추정치를 사용
- Runtime text measurement는 사용하지 않음
- Background가 있으면 symbol/label/title보다 먼저 생성

Histogram 기본값은 기존 primitive 결과와 맞춘다.

```javascript
{
  symbol: { width: 14, height: 12, stroke: "white", strokeWidth: 0.5 },
  labels: { offset: 8, fontSize: 12 },
  titleStyle: { fontSize: 13, fontWeight: 600 },
  itemGap: 20,
  position: "bottom",
  align: "center",
  border: false
}
```

## Rematerialization

`rematerializeLegend`는 최신 ordinal domain/range를 읽어 item, anchors, 모든 symbol
layer, labels, title, optional background을 다시 materialize한다. Canvas layout과
연결 scale 변경이 이를 명시적으로 호출한다.

## Progression 변경

`carsHistogramActions`에서 raw `guide.legend.color`, color legend rect/text/title
graphics, `legendItems` helper dependency를 제거하고 `.createLegend()`로 교체한다.

```javascript
.createGrid()
.createAxes()
.createLegend()
```

## 제외 범위

- Continuous gradient legend
- Size/opacity legend
- Multiple simultaneous legend blocks
- Interactive legend
- Runtime text measurement
- `createGuides` 통합
- 실제 line mark 위에 point를 생성하는 mark action

## 검증 결과

- Unit/acceptance test 264개 통과
- PNG render test 8개 통과
- Histogram bottom swatch legend와 기존 line right legend 직접 확인
- Primitive와 action histogram의 semantic, graphic, Canvas calls 일치
- Explicit line + point recipe의 shared anchor 확인
