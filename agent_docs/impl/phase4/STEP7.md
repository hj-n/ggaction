# Phase 4 — Step 7: Ordinal x axis

## 목표

Resolved ordinal x scale을 읽어 category band 중앙에 ticks와 labels를 배치하는
`createXAxis` vertical slice를 구현한다.

## 진행 상태

- [x] Ordinal x scale axis validation
- [x] Domain 전체를 default tick/label values로 추론
- [x] Category band center 위치 계산
- [x] Explicit values 부분집합과 domain validation
- [x] Ordinal label 문자열 변환
- [x] Axis line/title 기존 action 재사용
- [x] Reversed range 지원
- [x] Canvas 변경 rematerialization
- [x] Action program의 raw x-axis block 제거
- [x] Unit, acceptance, PNG regression
- [x] 사용자 문서 갱신
- [x] 전체 regression과 commit/push

## 기본 규칙

- Ordinal axis는 omitted `values`에서 scale domain 전체를 사용한다.
- `count`는 ordinal category를 임의 생략할 수 있으므로 지원하지 않는다.
- Explicit `values`는 domain 순서와 무관하게 요청 순서대로 표시할 수 있지만 모든
  값이 domain 안에 있어야 한다.
- Tick과 label 위치는 `rangeStart + (index + 0.5) × step`이다.
- Bottom x axis만 현재 범위에 포함한다.

## Action 구조

```text
createXAxis
├─ createXAxisLine
├─ createXAxisTicksAndLabels
│  ├─ createXAxisTicks
│  └─ createXAxisLabels
└─ createXAxisTitle
```

## 검증 결과

- `npm test`: 307 passed
- `npm run test:render`: 11 passed
- Primitive baseline과 semanticSpec, graphicSpec, Canvas call sequence가 동일함
- Action program의 raw x-axis semantic/graphics block이 `createXAxis`로 교체됨
