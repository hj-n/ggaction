# STEP 9 — Guide Collection

## 목표

Axes와 legend를 기존 wrapped action으로 조합하는 aggregate guide action을
구현한다.

```javascript
.createGuides({
  axes: {
    y: { ticksAndLabels: { count: 6 } }
  },
  legend: {}
})
```

인자를 생략하면 현재 semantic encoding에서 지원 가능한 guide를 선택한다.

```javascript
.createGuides()
```

## 진행 상태

- [x] `createGuides` top-level option validation
- [x] Axes applicability inference
- [x] Line-series legend applicability inference
- [x] Explicit `false` opt-out
- [x] Existing wrapped guide action orchestration
- [x] 별도 actions program의 개별 guide 호출 교체
- [x] Unit, acceptance, PNG regression
- [x] 영어 Guides/action/LLM 문서 갱신

## API

```javascript
createGuides({
  axes?: createAxesOptions | false,
  legend?: createLegendOptions | false
})
```

- Plain object는 해당 child action에 그대로 전달한다.
- `false`는 해당 guide를 생성하지 않는다.
- 생략하면 semantic encoding을 보고 applicability를 판단한다.
- Unknown top-level option과 object/false 이외의 값은 오류다.

## Automatic selection

Axes는 하나 이상의 layer에 x 또는 y encoding이 있으면 선택한다. 실제 coordinate,
scale, ambiguity validation은 의미를 소유한 `createAxes`가 계속 담당한다.

Legend는 하나 이상의 semantic line mark에 color 또는 strokeDash scale encoding이
있으면 선택한다. Target, shared field, ordinal scale, domain compatibility validation은
`createLegend`가 담당한다.

Applicability는 child action 호출 여부만 결정한다. `createGuides`는 coordinate,
scale, target을 다시 추론하거나 child validation을 복제하지 않는다. 여러 후보가
모호하면 child action의 기존 explicit-ID 오류를 그대로 유지한다.

두 guide가 모두 `false`이거나 automatic selection 결과가 비어 있으면 오류다.

## Action 구조

```text
createGuides
├─ createAxes?
└─ createLegend?
```

`createGuides` 자체는 semanticSpec이나 graphicSpec을 직접 수정하지 않는다. 기존
wrapped child action만 순서대로 호출하므로 전체 decomposition이 trace에 남는다.

Title은 guide가 아니므로 `createTitle`을 호출하지 않는다.

## Test program

STEP1 primitive line program과 test는 변경하지 않는다. `carsLineChartActions`의:

```javascript
.createAxes({ y: { ticksAndLabels: { count: 6 } } })
.createLegend()
```

를 다음으로 교체한다.

```javascript
.createGuides({
  axes: { y: { ticksAndLabels: { count: 6 } } }
})
```

Legend option을 생략해도 supported line-series encoding이 있으므로 자동 생성한다.
`createTitle`은 별도 top-level action으로 유지한다.

## 구현 순서

1. Guide collection option과 applicability helper를 구현한다.
2. Aggregate `createGuides` wrapped action을 등록한다.
3. Actions program의 개별 guide 호출을 교체한다.
4. Automatic, explicit, opt-out, empty, ambiguous case를 unit test한다.
5. Acceptance trace와 PNG regression을 갱신한다.
6. 영어 Guides API, action reference, supported features, LLM 문서를 갱신한다.

## 제외 범위

- `createTitle` orchestration
- Point legend
- Multiple legends
- Polar axes와 guides
- Existing guide edit 또는 partial completion

## 완료 조건

- `.createGuides()`가 지원 가능한 axes와 line-series legend를 생성한다.
- `axes`와 `legend` option이 기존 child action에 그대로 전달된다.
- `false`가 해당 guide를 명시적으로 제외한다.
- Trace가 `createGuides → createAxes/createLegend` 계층을 보존한다.
- Actions program에 개별 top-level guide 생성 호출이 남지 않는다.
- Primitive line program과 Phase 1 scatterplot 결과가 유지된다.
- 관련 test와 문서가 통과하고 변경이 commit/push된다.

## 검증 결과

- Unit/acceptance test 208개 통과
- PNG render regression 5개 통과
- `cars-line-chart-actions.png`에서 axes, combined legend, title 결과 확인
- STEP1 primitive line program과 Phase 1 scatterplot program 변경 없음
