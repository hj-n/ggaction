# Phase 4 — Step 4: `encodeXOffset`

## 목표

Grouped layout의 내부 dependency인 nominal xOffset encoding과 band-local scale을
구현한다.

```javascript
.encodeXOffset({ field: "sex" })
```

## 진행 상태

- [x] Bar/ordinal-x/mean-y prerequisite 검증
- [x] Nominal field와 scale option 검증
- [x] xOffset semantic encoding 저장
- [x] Parent x bandwidth 기반 offset scale resolve
- [x] Explicit domain/range와 reversed range 지원
- [x] Canvas bounds 변경 시 offset scale rematerialization
- [x] Grouping 전 empty rect collection 유지
- [x] Grouped bar action program 단일 파일로 통합
- [x] Unit, acceptance, PNG regression
- [x] 사용자 문서 갱신
- [x] 전체 regression과 commit/push

## API와 resolved scale

```javascript
encodeXOffset({
  field,
  fieldType?: "nominal",
  target?,
  scale?: { id?, type?: "ordinal", domain?, range? }
})
```

Automatic range는 plot 전체가 아니라 resolved x scale의 한 category bandwidth다.

```javascript
{
  type: "ordinal",
  domain: ["men", "women"],
  range: [0, 33.333],
  step: 16.667,
  bandwidth: 16.667
}
```

STEP4에서는 rect를 만들지 않는다. `encodeColor({ layout: "group" })`가 이 action을
child로 사용하고, 이후 bar width action이 concrete geometry를 완성한다.

## Action 구조

```text
encodeXOffset
├─ editSemantic(xOffset.field)
├─ editSemantic(xOffset.fieldType)
├─ editSemantic(xOffset.scale)
├─ createScale
└─ rematerializeScale
```

## Program 파일 정책

Primitive baseline은 유지하되 Phase4 high-level progression은
`jobsGroupedBarActions.js` 하나만 갱신한다. STEP별 X/Y program snapshot은 만들지
않는다.

## 검증 결과

- `npm test`: 294 passed
- `npm run test:render`: 11 passed
- Automatic xOffset range가 Canvas width 변경 후 parent x bandwidth와 함께 갱신됨
- Primitive baseline과 semantic meaning, graphicSpec, Canvas call sequence가 동일함
