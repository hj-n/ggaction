# Phase 4 — Step 3: Aggregate Bar `encodeY`

## 목표

STEP2 progression의 raw y encoding과 y scale block을 다음 user-facing action으로
교체한다.

```javascript
.encodeY({
  field: "perc",
  aggregate: "mean",
  scale: { nice: true, zero: false }
})
```

## 진행 상태

- [x] Grouped bar `encodeY` option validation
- [x] Ordinal x prerequisite 검증
- [x] x category별 mean 계산
- [x] y semantic encoding과 scale 저장
- [x] Aggregate 결과 기반 y domain/range resolve
- [x] `nice`, `zero`, explicit domain 우선순위
- [x] Grouping 전 empty rect collection 유지
- [x] 별도 progression program
- [x] Unit, acceptance, PNG regression
- [x] 사용자 문서 갱신
- [x] 전체 regression과 commit/push

## API

```javascript
encodeY({
  field,
  fieldType?: "quantitative",
  aggregate?: "mean",
  stack?: null,
  target?,
  coordinate?,
  scale?: {
    id?,
    type?: "linear",
    domain?,
    range?,
    nice?,
    zero?
  }
})
```

- `field`는 추론할 수 없으므로 필수다.
- Ordinal bar x에서 `aggregate`는 현재 유일하게 지원하는 `"mean"`으로 추론한다.
- `stack`은 grouped layout을 준비하기 위해 `null`로 추론한다.
- y scale은 `nice: true`, `zero: false`를 기본으로 사용한다.
- Explicit domain/range는 automatic `nice`/`zero`와 plot bounds보다 우선한다.

## Action 구조

```text
encodeY
├─ createCoordinate
├─ editSemantic(y.field)
├─ editSemantic(y.fieldType)
├─ editSemantic(y.aggregate)
├─ editSemantic(y.stack)
├─ editSemantic(y.scale)
├─ createScale
└─ rematerializeBarMark
   ├─ rematerializeScale(x)
   ├─ rematerializeScale(y)
   └─ editGraphics(rect length = 0)
```

## Aggregate와 materialization 경계

- Automatic y domain은 raw `perc`가 아니라 x category별 `mean(perc)`에서 계산한다.
- Source dataset은 변경하지 않는다.
- Color grouping과 xOffset이 아직 없으므로 concrete rect는 만들지 않는다.
- 기존 histogram의 binned x + count/zero-stack materialization은 그대로 유지한다.

## Progression program

`jobsGroupedBarXEncoding.js`를 보존하고 별도 program을 복사한다. Raw
`encoding.y`와 `scale[y]` block만 `encodeY()`로 교체한다. Raw color, xOffset,
rect, axes, grid, legend는 유지한다.

## 제외 범위

- `encodeColor({ layout: "group" })`
- `encodeXOffset`
- `encodeBarWidth`
- Grouped rect materialization
- Ordinal x axis와 grouped legend
- `createGuides` integration

## 검증 결과

- `npm test`: 291 passed
- `npm run test:render`: 12 passed
- `jobs-grouped-bar-y-encoding.png`: 1440 × 920 (`pixelRatio: 2`)
- Primitive program과 `semanticSpec`, `graphicSpec`, Canvas call sequence가 동일함
- Grouping 전 resolved y는 year별 mean을 사용하고 rect collection은 비어 있음
