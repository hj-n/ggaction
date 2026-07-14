# Phase 4 — Step 5: Group-aware `encodeColor`

## 목표

Bar color encoding에 명시적인 layout policy를 추가하고 grouped layout을
`y.stack = null`과 `xOffset` semantic으로 분해한다.

```javascript
.encodeColor({
  field: "sex",
  layout: "group",
  scale: { palette: "tableau10" }
})
```

## 진행 상태

- [x] `layout: "group" | "stack"` validation
- [x] Grouped ordinal bar prerequisite 검증
- [x] Color semantic encoding과 scale 저장
- [x] Group layout의 `y.stack = null` 저장
- [x] `encodeXOffset` wrapped child 호출
- [x] year × color별 mean으로 y scale 재계산
- [x] Color/xOffset scale rematerialization
- [x] Grouping 후에도 width 전 empty rect 유지
- [x] 단일 grouped bar action program 갱신
- [x] Unit, acceptance, PNG regression
- [x] 사용자 문서 갱신
- [x] 전체 regression과 commit/push

## 정책

- Ordinal x + mean y bar는 명시적인 `layout: "group"`을 요구한다.
- 기존 histogram은 omission 또는 `layout: "stack"`을 지원한다.
- 현재 histogram의 `layout: "group"`과 ordinal mean bar의 `layout: "stack"`은
  지원하지 않는다.
- Non-bar mark는 `layout` option을 받지 않는다.

## Action 구조

```text
encodeColor({ layout: "group" })
├─ editSemantic(color.field)
├─ editSemantic(color.fieldType)
├─ editSemantic(color.scale)
├─ createScale(color)
├─ editSemantic(y.stack = null)
├─ encodeXOffset
└─ rematerializeBarMark
```

STEP5에서는 color, xOffset, aggregate scale을 모두 resolve하지만 bar width가 아직
없으므로 rect collection은 비워둔다.

## 검증 결과

- `npm test`: 297 passed
- `npm run test:render`: 11 passed
- `encodeColor` 아래에 `encodeXOffset`이 child action으로 기록됨
- Color 추가 후 y domain이 year × color mean 기준으로 재계산됨
- Primitive baseline과 semantic meaning, graphicSpec, Canvas call sequence가 동일함
