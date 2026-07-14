# STEP 8 — Chart Title

## 목표

Chart title과 optional subtitle을 하나의 domain action으로 생성한다.

```javascript
.createTitle({
  text: "The trend of acceleration by year",
  subtitle: "from 1970 to 1982"
})
```

## 진행 상태

- [x] `createTitle` option validation과 기본값
- [x] Plot-aligned top layout 추론
- [x] Semantic title과 subtitle 저장
- [x] Wrapped title text create/edit actions
- [x] Wrapped subtitle text create/edit actions
- [x] `rematerializeTitle` 구현
- [x] Canvas 변경 시 title layout 갱신
- [x] 별도 actions program의 raw title block 제거
- [x] Unit, acceptance, PNG regression
- [x] 영어 Title/action/LLM 문서 갱신

## API

```javascript
createTitle({
  text,
  subtitle?,
  position?,
  align?,
  offset?,
  gap?,
  titleStyle?,
  subtitleStyle?
})
```

기본값:

```javascript
{
  position: "top",
  align: "left",
  offset: 0,
  gap: 8,
  titleStyle: {
    color: "#0f172a",
    fontSize: 22,
    fontFamily: "sans-serif",
    fontWeight: 600
  },
  subtitleStyle: {
    color: "#64748b",
    fontSize: 14,
    fontFamily: "sans-serif",
    fontWeight: "normal"
  }
}
```

`text`는 필수 non-empty string이다. `subtitle`은 생략할 수 있지만 전달하면
non-empty string이어야 한다. 초기 범위에서 position은 `top`, align은 `left`,
`center`, `right`만 지원한다. Offset은 finite number이고 gap은 non-negative
number다. Style object는 color, fontSize, fontFamily, fontWeight만 받는다.

## Semantic과 graphical state

Semantic에는 chart의 의미인 문자열만 저장한다.

```javascript
title: {
  text: "The trend of acceleration by year",
  subtitle: "from 1970 to 1982"
}
```

Position, align, offset, gap, font, color는 appearance/layout이므로 private title
config와 concrete text graphics에 저장한다.

## Layout

Title block은 Canvas 상단에서 시작하고 x anchor는 plot bounds를 따른다.

```text
blockTop = 16 + offset

left   x = bounds.x
center x = bounds.x + bounds.width / 2
right  x = bounds.x + bounds.width
```

각 text graphic은 `textBaseline: "middle"`을 사용한다. Title과 subtitle의 y는
fontSize와 gap으로 계산한다. Subtitle이 없으면 title 하나만 배치한다.

Runtime text measurement는 사용하지 않는다. 계산된 block이 Canvas 위로 나가거나
plot bounds와 겹치면 충분한 top margin을 요구하는 오류를 발생시킨다.

## Action 구조

```text
createTitle
├─ editSemantic(title.text)
├─ editSemantic(title.subtitle)?
├─ createTitleText
│  ├─ createGraphics(chartTitle, text)
│  └─ editTitleText
└─ createSubtitleText?
   ├─ createGraphics(chartSubtitle, text)
   └─ editSubtitleText
```

모든 component action은 wrapped action이다.

```text
rematerializeTitle
├─ editTitleText
└─ editSubtitleText?
```

Canvas width, height, margin이 바뀌면 title을 한 번 명시적으로 rematerialize한다.

## Test program

STEP1 primitive line program과 test는 변경하지 않는다. `carsLineChartActions`의
raw title semantic/graphic block을 다음 호출로 교체한다.

```javascript
.createTitle({
  text: "The trend of acceleration by year",
  subtitle: "from 1970 to 1982"
})
```

Program은 `carsLineChartValues`의 title 좌표와 문자열을 읽지 않는다.

## 구현 순서

1. Option/style validation과 private title config update를 구현한다.
2. Backend-neutral top layout inference를 구현한다.
3. Title text create/edit actions를 구현한다.
4. Optional subtitle create/edit actions를 구현한다.
5. Aggregate `createTitle`과 `rematerializeTitle`을 구현한다.
6. Canvas 변경의 rematerialization을 연결한다.
7. Actions program의 raw title block을 `.createTitle()`로 교체한다.
8. Unit, acceptance, PNG regression과 영어 문서를 갱신한다.

## 제외 범위

- Bottom, left, right title position
- Multiple chart titles
- Runtime text measurement와 automatic wrapping
- Rich text 또는 multiline array
- Public aggregate `editTitle`

## 완료 조건

- `.createTitle()` 하나로 semantic title과 concrete text가 생성된다.
- Subtitle 생략 시 subtitle semantic/graphic이 생성되지 않는다.
- Align과 style option이 concrete output에 반영된다.
- Canvas 변경 후 title layout이 갱신된다.
- Actions program에서 raw title code가 제거된다.
- Primitive line program과 Phase 1 scatterplot 결과가 유지된다.
- 관련 test와 문서가 통과하고 변경이 commit/push된다.

## 검증 결과

- Unit/acceptance test 203개 통과
- PNG render regression 5개 통과
- `cars-line-chart-actions.png`에서 default title/subtitle layout 확인
- STEP1 primitive line program과 Phase 1 scatterplot program 변경 없음
