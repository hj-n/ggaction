# Phase 4 — Step 9: `createGuides` 통합

## 목표

Grouped bar의 axes, horizontal grid, right legend를 하나의 thin aggregate action으로
생성한다.

```javascript
.createGuides()
```

## 진행 상태

- [x] Grouped bar axes applicability
- [x] Horizontal grid applicability
- [x] Grouped color legend applicability
- [x] `createAxes → createGrid → createLegend` child 순서
- [x] Explicit child options와 opt-out 전달
- [x] Concrete rendering order 검증
- [x] Canvas rematerialization 검증
- [x] Action program의 남은 raw guide block 제거
- [x] Unit, acceptance, PNG regression
- [x] 사용자 문서 갱신
- [x] 전체 regression과 commit/push

## Action 구조

```text
createGuides
├─ createAxes
│  ├─ createXAxis
│  └─ createYAxis
├─ createGrid
└─ createLegend
```

Aggregate는 child의 inference나 validation을 복제하지 않는다. Stored encoding을 보고
applicability만 선택하고 기존 wrapped action에 options를 전달한다.

## 검증

- `npm test`: 312 passed
- `npm run test:render`: 11 passed
- `jobs-grouped-bar-actions.png` 직접 확인
