# Roadmap 2 — Phase 5 Goal

## 목표

기존 여섯 canonical chart를 사용해 Cartesian guide position, axis label format, directional grid edit,
left legend, chart-title position/wrapping과 stable guide editing을 구현한다.

Phase 5는 새 chart type을 추가하지 않는다. Existing public programs와 independent primitive baselines를
guide/layout variants의 oracle로 재사용한다.

## 진행 상태

- [x] Phase 5 범위, variant와 approval gate 설계
- [x] Existing six-chart baseline과 guide ownership audit
- [x] Mirrored axes와 label-format primitive 승인 및 public implementation
- [x] Directional grid edits
- [x] Left legend primitive 승인 및 public implementation
- [x] Positioned/wrapped title primitive 승인 및 public implementation
- [ ] Full parameter, layout-failure, immutability와 rematerialization matrix
- [ ] Public docs, contract 승격과 Phase closeout

## 구현 범위

- x axis `position: "bottom" | "top"`, y axis `position: "left" | "right"`
- Axis label format strings: `.0f | .1f | .2f | .0% | .1% | .2e | %Y | %Y-%m | %Y-%m-%d`
- `editHorizontalGrid`, `editVerticalGrid`
- `createLegend`/`editLegend`의 `position: "left"`와 stable layout/appearance edits
- `createTitle`/`editTitle`의 four-edge position
- Title `maxWidth`, `wrap: "word" | "character"`, `lineHeight`와 deterministic text measurement

Axis/legend/title binding과 text는 semantic state다. Position, style, wrapping config와 occupied bounds는
graphical materialization config이며 final line/text/rect geometry는 `graphicSpec`에 concrete 값으로 저장한다.
Renderer는 tick formatting, wrapping, edge placement 또는 collision을 추론하지 않는다.

## 실행 순서

```text
STEP1  existing six-chart baseline과 guide/layout contract audit
STEP2  mirrored axes + numeric format primitive
  ↓ Gate A: mirrored-axis visual confirmation
STEP3  mirrored positions와 axis format strings
STEP4  directional grid edit actions
STEP5  left legend primitive
  ↓ Gate B: left-legend visual confirmation
STEP6  left position과 editLegend
STEP7  positioned/wrapped title primitive
  ↓ Gate C: title layout visual confirmation
STEP8  title positions, wrapping/measurement와 editTitle
STEP9  integration, docs, contract promotion과 cleanup
```

Gate STEP은 raw primitives, independent target values, expanded target user-facing chain metadata와
`primitive.png`만 만든다. 사용자 승인 전에는 대응 user-facing implementation이나 `user-facing.png`를
만들지 않는다.

## Visual variants와 machine coverage

Phase 5는 기존 baseline pair를 유지하면서 대표 variant 세 개를 추가한다.

- Scatterplot `mirrored-axes-format`: top x/right y와 fixed-decimal labels
- Regression scatterplot `left-legend`: categorical/composite/size blocks의 mirrored side layout
- Density area `wrapped-title-bottom`: bottom title/subtitle, deterministic wrapping과 measured bounds

All axis format tokens, four title positions, word/character wrapping, left legend kind, grid count/value/style
boundary와 incompatible option은 exhaustive machine coverage로 검증한다. Gallery에는 edge placement와 text
layout이 실제로 달라지는 representative class만 둔다.

## 범위 경계

- Channel당 axis 하나라는 current limitation을 유지하며 mirrored duplicate axes는 만들지 않는다.
- `createGrid`와 `createGuides`는 aggregate create-only로 유지하며 `editGrid`/`editGuides`를 추가하지 않는다.
- Legend channels와 scale binding은 `editLegend`로 바꾸지 않는다.
- Title/legend/grid layout은 Canvas margin을 자동 확장하거나 다른 edge로 이동하지 않는다.
- Renderer-side formatting, wrapping, semantic inference와 arbitrary formatter callback을 추가하지 않는다.

## 완료 조건

- 세 approved variants의 primitive/public `semanticSpec`, `graphicSpec`, order와 Canvas calls가 수렴한다.
- Axis/grid/legend/title edits는 semantic binding을 보존하고 affected graphical consumers만 rematerialize한다.
- Canvas/scale/domain/style edit와 action order가 달라도 equivalent final program은 같은 concrete output에
  수렴한다.
- Insufficient margin, same-edge overlap, invalid vocabulary/options와 ambiguous target은 earlier program을
  변경하지 않고 실패한다.
- Types, examples, tutorials, API/reference/LLM docs와 action catalog가 current behavior와 일치한다.
- Unit, contract, chart, docs, coverage, render, desktop/mobile gallery와 remote CI가 통과한다.

## STEP 문서

- [`STEP1.md`](STEP1.md)
- [`STEP2.md`](STEP2.md)
- [`STEP3.md`](STEP3.md)
- [`STEP4.md`](STEP4.md)
- [`STEP5.md`](STEP5.md)
- [`STEP6.md`](STEP6.md)
- [`STEP7.md`](STEP7.md)
- [`STEP8.md`](STEP8.md)
- [`STEP9.md`](STEP9.md)
