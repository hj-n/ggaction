# Phase 4 — Step 2: Ordinal Bar `encodeX`

## 목표

Primitive grouped bar program의 raw x encoding, x scale, coordinate block을 다음
user-facing action으로 교체한다.

```javascript
.encodeX({ field: "year", fieldType: "ordinal" })
```

## 진행 상태

- [x] Bar ordinal x option validation
- [x] Ordinal field 값 읽기
- [x] Automatic/explicit ordinal domain
- [x] Ordinal position range, step, bandwidth 계산
- [x] Cartesian coordinate 생성과 layer 연결
- [x] Semantic x encoding과 scale 저장
- [x] Resolved ordinal position scale 저장
- [x] 별도 progression program
- [x] Unit, acceptance, PNG regression
- [x] 사용자 문서 갱신
- [x] 전체 regression과 commit/push

## API

```javascript
encodeX({
  field,
  fieldType: "ordinal",
  target?,
  coordinate?,
  scale?: {
    id?,
    type?: "ordinal",
    domain?,
    range?
  }
})
```

숫자 field도 quantitative와 ordinal 의미를 모두 가질 수 있으므로 grouped bar의
`fieldType: "ordinal"`은 명시적으로 받는다.

## Action 구조

```text
encodeX
├─ createCoordinate
├─ editSemantic(x.field)
├─ editSemantic(x.fieldType)
├─ editSemantic(x.scale)
├─ createScale
└─ rematerializeScale
```

## Resolved scale

```javascript
{
  type: "ordinal",
  domain: [1850, 1860, ..., 2000],
  range: [80, 580],
  step: 33.333,
  bandwidth: 33.333
}
```

- Automatic domain은 first-appearance 순서다.
- Explicit domain은 사용자 순서를 유지한다.
- Automatic range는 current plot bounds다.
- Category 중심은 `rangeStart + (index + 0.5) × step`이다.
- Reversed explicit range도 허용한다.
- STEP2에서는 outer/inner padding을 구현하지 않는다.

## Progression program

`jobsGroupedBarPrimitives.js`를 보존하고 별도 program을 복사한다. Raw
`layer.coordinate`, `encoding.x`, `scale[x]`, `coordinate[main]` block만
`encodeX()`로 교체한다. Raw y, color, xOffset, rect, axes, grid, legend는 유지한다.

후속 사용자 지시에 따라 STEP별 progression snapshot은 제거되었고, 현재 high-level
flow는 `jobsGroupedBarActions.js` 한 파일에서 이어서 갱신한다.

## Materialization 경계

STEP2에서는 grouped rect를 계산하지 않는다. Aggregate y와 grouping action이 아직
없으므로 ordinal scale만 resolve하고, progression의 primitive rect block이 concrete
graphics를 계속 작성한다.

## 제외 범위

- Aggregate bar `encodeY`
- `encodeColor({ layout })`
- `encodeXOffset`
- `encodeBarWidth`
- Grouped bar rematerialization
- Ordinal axis action
- `createGuides` integration

## 검증 결과

- `npm test`: 284 passed
- `npm run test:render`: 11 passed
- `jobs-grouped-bar-x-encoding.png`: 1440 × 920 (`pixelRatio: 2`)
- Primitive program과 `semanticSpec`, `graphicSpec`, Canvas call sequence가 동일함
