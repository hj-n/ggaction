# STEP 2 — Existing Public API Capability Lab

## 진행 상태

- [x] Lollipop chart를 current public API로 작성하고 high-DPI PNG 렌더링
- [x] Layered bar + line chart를 current public API로 작성하고 high-DPI PNG 렌더링
- [x] Legend와 scale의 focused edit 필요성 재현
- [x] Error band와 box plot의 generated component 편집 경계 확인
- [x] Horizontal grouped bar의 directional parity 확인
- [x] Polar, text, rect, arc, facet와 concat의 current public surface 확인
- [x] 각 capability를 `가능`, `어색함`, `미지원`으로 분류
- [x] 실패를 새 validation이나 특수 처리로 숨기지 않고 실제 current error를 기록
- [x] Step 2 범위 밖의 source, test와 public docs를 변경하지 않음

## 목적

새 action을 먼저 설계하지 않고 `ggaction@0.0.2`의 실제 public API로 representative chart와 edit를
실행해 본다. 이 결과는 Step 3의 lifecycle audit와 Step 4의 target contract가 해결해야 할 실제 마찰을
구분하는 근거다.

상태의 의미는 다음과 같다.

| 상태 | 판정 기준 |
| --- | --- |
| 가능 | Current public API의 자연스러운 호출만으로 의도한 결과를 만든다. |
| 어색함 | 결과는 만들 수 있지만 호출 순서, 독립 scale, 깊은 option object, generated ID 또는 internal-shaped option이 필요하다. |
| 미지원 | Public method/export가 없거나 current validation이 capability를 명시적으로 거부한다. |

Probe는 repository source를 직접 import해 실행했다. Step 2는 artifact 기반을 만드는 단계가 아니므로
실행 프로그램과 PNG는 `/tmp`에만 생성하고 repository에는 추가하지 않았다. Persistent primitive/public
pair와 gallery는 Step 5에서 같은 manifest로 재현 가능하게 만든다.

## 결과 요약

| Capability | 결과 | 핵심 근거 | 후속 검토 |
| --- | --- | --- | --- |
| Lollipop | 어색함 | Point를 먼저 만들면 렌더링되지만 rule-first는 inherited constant `y` 때문에 point materialization이 실패한다. | Order-independent layer inference |
| Layered bar + line | 어색함 | 동일 temporal x scale을 공유할 수 없고 line에 별도 x scale과 explicit guide scale이 필요하다. | Scale resolution contract |
| Legend component edit | 어색함 | 변경은 가능하지만 `editLegend({ labels: {...}, border: {...} })`처럼 깊은 object를 전달해야 한다. | Focused legend edits |
| Palette edit | 어색함 | `palette` top-level option은 거부되고 `range: { palette }`라는 stored representation을 알아야 한다. | First-class palette edit |
| Error band edit | 어색함 | Aggregate owner 하나로 materialize되어 boundary만 안정적으로 지칭할 public facade가 없다. | Aggregate/component edit facade |
| Box plot edit | 어색함 | Median, caps, outliers가 generated layer ID로 존재하고 owning edit facade가 없다. | Aggregate edit facade |
| Horizontal grouped bar | 미지원 | Color layout `group`은 `yOffset`이 생길 때까지 명시적으로 거부된다. | `encodeYOffset` |
| Polar chart | 미지원 | Polar coordinate resource 저장은 가능하지만 Polar position encoding과 rendering action이 없다. | Polar vertical slice |
| Text annotation | 미지원 | Ordinary authoring용 text mark/action이 없다. Raw graphic primitive는 domain API 대체가 아니다. | Text mark vertical slice |
| Rect heatmap | 미지원 | Semantic rect mark와 two-dimensional cell encoding action이 없다. | Rect/heatmap vertical slice |
| Arc/pie/donut | 미지원 | Arc mark와 angular/radial encoding action이 없다. | Arc Polar vertical slice |
| `hconcat` / `vconcat` | 미지원 | Package export와 child-program composition state가 없다. | Program composition |
| Chainable facet | 미지원 | `ChartProgram.prototype.facet`과 repeated child-view materialization이 없다. | Facet |

## Probe 1 — Lollipop

현재 primitive vocabulary만으로 stem과 point를 조합할 수 있으므로 별도 `createLollipopMark`는 필요하지
않다. 다음 순서에서는 정상 렌더링되었다.

```javascript
chart()
  .createCanvas({
    width: 520,
    height: 320,
    margin: { top: 30, right: 30, bottom: 60, left: 60 }
  })
  .createData({ values: cars.slice(0, 12) })
  .createPointMark({ id: "points" })
  .encodeX({ target: "points", field: "Horsepower" })
  .encodeY({
    target: "points",
    field: "Miles_per_Gallon",
    scale: { domain: [0, 50] }
  })
  .encodeRadius({ target: "points", value: 4 })
  .createRuleMark({ id: "stems" })
  .encodeX({
    target: "stems",
    field: "Horsepower",
    fieldType: "quantitative",
    scale: { id: "x" }
  })
  .encodeY({
    target: "stems",
    datum: 0,
    fieldType: "quantitative",
    scale: { domain: [0, 50] }
  })
  .encodeY2({
    target: "stems",
    field: "Miles_per_Gallon",
    fieldType: "quantitative"
  })
  .encodeStroke({ target: "stems", value: "#94a3b8" })
  .createGuides();
```

생성 결과:

```text
semantic layers  points, stems
graphic objects  canvas, plot-main, points, stems, axes, grid
PNG              1040 × 640, pixelRatio 2, 26,636 bytes
```

그러나 rule을 먼저 만든 다음 point를 추가하면 새 point가 rule의 constant `y`를 상속하고 point
materialization이 이를 field encoding으로 사용하려 한다.

```text
Encoding field must be a non-empty string.
```

이는 lollipop 전용 실패가 아니다. 새 layer가 previous layer의 encoding을 추론할 때 target mark와
호환되는 encoding만 상속해야 한다는 공통 authoring-order 문제다.

## Probe 2 — Layered bar + line

Bar와 line은 같은 program에 둘 수 있지만 동일 temporal x scale을 그대로 공유하면 current bar layout
policy와 line scale policy가 충돌한다.

```text
A temporal bar position scale cannot share a non-bar layout policy.
```

현재 성공하는 호출은 line에 별도 scale을 만들고 guide가 사용할 scale을 다시 지정해야 한다.

```javascript
chart()
  .createCanvas({
    width: 640,
    height: 400,
    margin: { top: 30, right: 30, bottom: 60, left: 70 }
  })
  .createData({ values: cars })
  .createBarMark({ id: "bars" })
  .encodeX({ target: "bars", field: "Year", fieldType: "temporal" })
  .encodeY({ target: "bars", field: "Acceleration", aggregate: "mean" })
  .createLineMark({ id: "trend" })
  .encodeX({
    target: "trend",
    field: "Year",
    fieldType: "temporal",
    scale: { id: "xLine" }
  })
  .encodeY({
    target: "trend",
    field: "Acceleration",
    aggregate: "mean",
    scale: { id: "y" }
  })
  .createGuides({
    axes: { x: { scale: "x" }, y: { scale: "y" } },
    legend: false
  });
```

생성 결과:

```text
PNG  1280 × 800, pixelRatio 2, 34,833 bytes
```

렌더링 성공은 곧바로 position equivalence를 뜻하지 않는다. Band layout과 continuous time position이
서로 다른 scale을 사용하므로 bar 중심과 line vertex가 항상 같은 좌표를 갖는다는 contract가 없다.
따라서 이를 `가능`으로 과장하지 않고 scale resolution이 명시되기 전까지 `어색함`으로 둔다.

## Probe 3 — Focused edit gaps

### Legend

현재 nested object는 실제로 적용된다.

```javascript
program.editLegend({
  labels: { fontSize: 12, color: "#334155" },
  border: { padding: 8, color: "#cbd5e1" }
});
```

하지만 사용자가 label만 편집하려 해도 aggregate legend option 구조를 알아야 한다. Stable visible
component인 label, title, symbol, layout과 border는 focused edit 후보가 된다. 기존 `editLegend`는 여러
component를 한 번에 편집하는 aggregate convenience로 유지할 수 있다.

### Scale palette

```javascript
program.editScale({ scale: "color", palette: "set2" });
// Error: Unknown editScale option "palette".

program.editScale({ scale: "color", range: { palette: "set2" } });
// supported
```

`range.palette`는 stored scale representation에 가까운 형태다. Palette를 편집하려는 ordinary user에게
이 구조를 요구하지 않도록 top-level `palette` option을 검토할 근거가 있다.

### Composite marks

Error band는 `errorBand` owner 하나로 semantic/graphic materialization된다. Box plot은 다음 generated
layer IDs를 만든다.

```text
boxPlot
boxPlotWhisker
boxPlotWhiskerLowerCap
boxPlotWhiskerUpperCap
boxPlotMedian
boxPlotOutliers
```

이 ID들은 debugging에는 유용하지만 ordinary edit target이 되어서는 안 된다. Boundary, median,
outlier 같은 stable visual component는 owning aggregate action을 통해 편집되어야 한다.

## Probe 4 — Directional parity

Horizontal grouped bar는 현재 명확한 validation error를 낸다.

```text
Horizontal bars do not support color layout "group" until yOffset is available.
```

이는 silent failure가 아니며 현재 limitation을 정확히 전달한다. 해결책은 horizontal bar만 특수 처리하는
것이 아니라 x 방향의 `encodeXOffset`과 대칭인 `encodeYOffset`을 추가하고 color layout resolution이
orientation에 맞는 offset channel을 선택하게 하는 것이다.

## Probe 5 — Stored capability와 rendered capability

다음 호출은 성공한다.

```javascript
chart()
  .createData({ values: cars })
  .createPointMark({ id: "points" })
  .createCoordinate({ id: "polar", type: "polar", layers: ["points"] });
```

Stored result:

```javascript
[{ id: "polar", type: "polar" }]
```

그러나 current prototype/package surface에는 `encodeR`, `createArcMark`와 Polar position/guide actions가
없다. 따라서 이는 Polar chart 지원이 아니라 resource storage 지원이다. Roadmap 3는 둘을 같은
capability로 표시하지 않는다.

## Missing public surface evidence

Current prototype/package lookup 결과다.

```text
ChartProgram.prototype.encodeR             undefined
ChartProgram.prototype.encodePointRadius   undefined
ChartProgram.prototype.encodeYOffset       undefined
ChartProgram.prototype.createTextMark      undefined
ChartProgram.prototype.createRectMark      undefined
ChartProgram.prototype.createArcMark       undefined
ChartProgram.prototype.facet               undefined
ChartProgram.prototype.editErrorBand       undefined
ChartProgram.prototype.editBoxPlot         undefined
ChartProgram.prototype.removeLegend        undefined
package hconcat export                      undefined
package vconcat export                      undefined
```

Low-level `createGraphics`로 text나 rect를 직접 만들거나 `editGraphics({ remove: true })`로 graphic을
지울 수 있다는 사실은 ordinary domain API 지원으로 계산하지 않는다. Semantic ownership, inference,
rematerialization과 trace hierarchy가 없는 raw primitive 우회는 extension capability일 뿐이다.

## 공유 근본 원인

Capability별 문제처럼 보이지만 다음 네 경계가 여러 probe에서 반복된다.

1. **Compatibility-aware inference 부재**  
   Layer inference가 이전 encoding의 존재만 보고 새 mark에서 사용할 수 있는지를 충분히 판별하지 않는다.
2. **Resolution policy와 resource identity의 결합**  
   같은 channel 이름을 공유하면 scale identity뿐 아니라 mark별 layout policy까지 충돌한다.
3. **Stable visual component facade 부재**  
   Legend와 composite mark의 내부 child는 존재하지만 user edit가 nested object나 generated ID에 의존한다.
4. **Stored semantic capability와 graphical vertical slice의 분리**  
   Polar coordinate처럼 schema가 값을 저장할 수 있어도 encoding, materialization, renderer와 guide가 모두
   연결되기 전에는 chart capability가 아니다.

## Step 2 결론

- Lollipop과 layered bar + line은 새 aggregate mark가 아니라 layer inference와 scale resolution 문제다.
- Focused edit는 모든 leaf property가 아니라 stable user-visible component에만 필요하다.
- Horizontal grouping은 `encodeYOffset`, Polar는 complete graphical vertical slice가 필요하다.
- Text, rect, arc, composition과 facet은 raw primitive 우회가 아닌 domain ownership을 새로 정의해야 한다.
- 이 STEP은 후보의 필요성을 검증했을 뿐 action 이름과 exact option contract를 확정하거나 Planned로
  승격하지 않는다.

다음 STEP은 current create/edit/remove lifecycle을 전수 비교해 focused action 후보를 줄이고,
generated ID 노출과 empty/repeated/removal behavior를 별도로 감사한다.
