# STEP 5 — Histogram Rect Materialization

## 목표

Binned x와 count/zero-stack y를 concrete rect collection으로 materialize한다.

```javascript
.createBarMark({ id: "bars" })
.encodeX({ field: "Displacement", bin: { maxBins: 10 } })
.encodeY()
```

`encodeY()`는 wrapped `rematerializeBarMark`를 호출한다. Color encoding이 없으면
각 non-empty bin마다 단색 rect 하나를 생성한다.

## 진행 상태

- [x] `rematerializeBarMark` wrapped action
- [x] Histogram rect cardinality와 concrete geometry
- [x] Default fill/stroke/strokeWidth
- [x] Empty bin omission
- [x] Existing semantic color grouping internal support
- [x] `encodeY` action hierarchy 연결
- [x] Canvas/scale rematerialization 연결
- [x] Immutability와 source dataset 보존
- [x] Unit, acceptance, PNG regression
- [x] 영어 Encoding/mark/scale/action/LLM 문서
- [x] 전체 regression, conceptual commit, push

## Action 구조

```text
encodeY()
├─ semantic y와 scale 생성
└─ rematerializeBarMark(bars)
   ├─ rematerializeScale(x)
   ├─ rematerializeScale(y)
   ├─ rematerializeScale(color)?
   ├─ bin/count/stack derive
   ├─ editGraphics(length)
   ├─ editGraphics(x)
   ├─ editGraphics(y)
   ├─ editGraphics(width)
   ├─ editGraphics(height)
   ├─ editGraphics(fill)
   ├─ editGraphics(stroke)
   └─ editGraphics(strokeWidth)
```

`rematerializeBarMark`는 internal wrapped action이다. Chart author는 직접 호출하지
않고 `encodeY`, 이후 `encodeColor`, Canvas edit 같은 domain action을 통해 사용한다.

## Rect 규칙

- Bin은 `[start, end)`이며 마지막 bin만 maximum을 포함한다.
- Explicit x domain 밖의 rows는 제외한다.
- Count가 0인 bin/segment는 rect를 생성하지 않는다.
- x/width는 bin start/end를 resolved x scale에 mapping한다.
- y/height는 stack start/end를 resolved y scale에 mapping한다.
- Reversed graphical range에서도 x/y는 작은 좌표, width/height는 양수로 저장한다.
- Source dataset과 semanticSpec에는 derived bin/count row를 저장하지 않는다.

Color encoding이 없을 때 기본 appearance:

```javascript
{
  fill: "#4c78a8",
  stroke: "white",
  strokeWidth: 0.5
}
```

Cars 데이터는 9개 non-empty bin이므로 `encodeY()` 직후 9개 rect를 만든다.

## Color 준비

STEP5의 internal materializer는 기존 semantic color encoding이 있으면 category
domain 순서대로 bin 안에서 zero-stack segment를 만들 수 있다. 이는 raw Phase 3
progression의 Canvas rematerialization을 안전하게 유지하기 위한 내부 준비다.

Public bar `encodeColor`와 raw color/rect block 제거는 STEP6에서 구현한다.

## Rematerialization

다음 변경은 `rematerializeBarMark`를 다시 호출한다.

- Canvas width, height, margin
- x/y automatic range
- x/y scale domain 또는 range
- bin, count, stack encoding
- 이후의 color encoding/scale

Canvas geometry 변경 시 position scales와 rect geometry를 structural copy로 다시
작성하며 기존 program과 dataset은 변경하지 않는다.

## Progression program

`carsHistogramEncodings.js`의 `encodeY()`는 자동으로 기본 rect를 생성한다. 현재
최종 PNG의 raw color semantic과 stacked rect edits는 STEP6까지 유지한다.

```text
encodeY()                 -> 9 default rects
raw color/rect progression -> 15 Origin-stacked rects
```

STEP6에서 raw color와 rect edits를 `encodeColor` 하나로 교체한다.

## 구현 순서

1. Histogram bin index/count helper를 재사용 가능한 core contract로 정리한다.
2. Complete bar/x/y/scales prerequisite validation을 구현한다.
3. Uncolored bin segments와 concrete rect geometry를 계산한다.
4. `rematerializeBarMark`를 wrapped action으로 등록한다.
5. `encodeY`가 materializer를 child action으로 호출하게 한다.
6. Canvas edit에 complete bar rematerialization을 연결한다.
7. 기존 semantic color가 있는 경우의 stack rematerialization을 보호한다.
8. Unit/acceptance/PNG와 public/LLM 문서를 갱신한다.
9. 전체 regression을 실행하고 진행 상태를 기록한다.

## 제외 범위

- Public bar `encodeColor`
- Raw color semantic과 rect edit block 제거
- Histogram legend action
- Axis/grid/title high-level action 변경
- Bar appearance edit action

## 완료 조건

- `encodeY()` 직후 raw graphic call 없이 renderable rect가 존재한다.
- Cars 기본 histogram은 9개의 concrete rect를 가진다.
- Rect properties는 backend-neutral finite values다.
- Canvas 변경 후 x/y/width/height가 일관되게 갱신된다.
- Existing semantic color가 있으면 stacked rect를 안전하게 rematerialize한다.
- Existing point/line materialization과 Phase 1/2 결과가 유지된다.
- 관련 public/LLM 문서와 test가 통과한다.
- 변경이 하나의 conceptual commit으로 push된다.

## 검증 결과

- Unit/acceptance: 239 tests passed
- PNG regression: 7 tests passed
- Cars uncolored histogram: 9 non-empty concrete rects
- Existing semantic Origin color: 15 zero-stacked concrete rects
- Canvas resize 후 scale과 rect geometry rematerialization 확인
- 직접 확인: 기존 stacked progression PNG layout 유지
