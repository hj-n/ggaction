# STEP 6 — Temporal Line Axes

## 목표

기존 `createAxes`를 resolved time scale과 aggregate line encoding까지 확장한다.
Actions line-chart program의 raw x/y axis graphics 전체를 다음 action 하나로
교체한다.

```javascript
.createAxes({ y: { ticksAndLabels: { count: 6 } } })
```

## 진행 상태

- [x] UTC calendar tick interval 선택
- [x] Time scale tick generation
- [x] Temporal label automatic formatting
- [x] Time scale axis line/tick/label/title 지원
- [x] Aggregate-aware axis title inference
- [x] Canvas 변경 시 temporal axis rematerialization
- [x] 별도 actions program의 raw axis block 제거
- [x] Unit, acceptance, PNG regression
- [x] 영어 Axes/action/LLM 문서 갱신

## Action 구조

```text
createAxes
├─ createXAxis
│  ├─ createXAxisLine
│  ├─ createXAxisTicksAndLabels
│  │  ├─ createXAxisTicks
│  │  └─ createXAxisLabels
│  └─ createXAxisTitle
└─ createYAxis
   ├─ createYAxisLine
   ├─ createYAxisTicksAndLabels
   │  ├─ createYAxisTicks
   │  └─ createYAxisLabels
   └─ createYAxisTitle
```

기존 wrapped action hierarchy는 유지한다. `createAxes`는 semantic에 저장된
coordinate와 scale을 읽으며 새 coordinate를 추론하거나 복구하지 않는다.

## Time tick 규칙

Time scale의 automatic ticks는 UTC calendar boundary에 맞춘다. `count`는 정확한
개수가 아니라 목표 밀도다. Domain span과 목표 count에 가장 가까운 supported
interval을 선택한다.

```text
year   = 1, 2, 5, 10 years
month  = 1, 2, 3, 6 months
day    = 1, 2, 7, 14 days
hour   = 1, 3, 6, 12 hours
minute = 1, 5, 15, 30 minutes
second = 1, 5, 15, 30 seconds
```

- Tick은 resolved domain 안에 있는 boundary만 생성한다.
- Explicit `values`는 기존처럼 finite timestamp 배열을 받는다.
- 생성 결과가 비어 있으면 domain endpoints를 사용한다.
- 1970-01-01부터 1982-01-01까지의 기본 target count에서는 2년 interval을
  선택해 1970, 1972, ..., 1982 tick을 만든다.

## Temporal label 규칙

`format: "auto"`는 resolved domain span에 따라 UTC label을 만든다.

```text
multi-year → YYYY
months     → YYYY-MM
days       → YYYY-MM-DD
hours      → YYYY-MM-DD HH:00
minutes    → HH:mm
seconds    → HH:mm:ss
```

Internal tick value와 graphical position은 timestamp를 사용하고, concrete text만
문자열로 저장한다. Numeric `{ decimals }` format은 linear scale에만 허용한다.

## Title inference

Axis title은 해당 scale의 unique encoding field에서 추론한다.

```text
x: Year                         -> Year
y: Acceleration + mean aggregate -> mean(Acceleration)
```

같은 scale을 소비하는 encoding들의 inferred title이 서로 다르면 명시적 `text`를
요구한다.

## Existing axis component 확장

- Axis line은 기존 numeric range를 그대로 사용하므로 time scale도 허용한다.
- Axis ticks와 labels는 `linear` 또는 `time` resolved scale을 받는다.
- Axis title geometry는 `linear` 또는 `time` scale을 받는다.
- Numeric `at`은 time scale에서 finite timestamp로 취급한다.
- Y quantitative axis의 기존 behavior와 advanced edit actions를 유지한다.

## Canvas rematerialization

Canvas width, height, margin 변경 시 기존 scale rematerialization이 time range를
다시 resolve한다. 연결된 x-axis line, ticks, labels, title은 기존 wrapped edit
actions를 통해 함께 갱신된다.

## Test program

STEP1 primitive line program과 test는 변경하지 않는다. `carsLineChartActions`에서
다음을 제거한다.

- x/y axis line, ticks, labels, title의 모든 `createGraphics`/`editGraphics`
- `xAxis`, `yAxis`, tick position helper 변수
- raw axis guide semantic edits

Line mark action chain 뒤에 `.createAxes({ y: { ticksAndLabels: { count: 6 } } })`를
추가한다. Explicit y count는 기존 primitive chart의 2-unit tick layout을 유지하기
위한 user-facing 선택이다. Legend와 chart title의 primitive/helper graphics는
후속 단계까지 유지한다.

## 구현 순서

1. Core UTC time tick generation과 auto formatter를 구현한다.
2. Axis tick/label resolver가 linear/time scale을 분기하도록 확장한다.
3. Axis title geometry와 aggregate-aware text inference를 확장한다.
4. Time axis unit/component test와 Canvas rematerialization test를 추가한다.
5. Actions program의 raw axis block을 `.createAxes()`로 교체한다.
6. Acceptance와 PNG 결과가 기존 layout을 유지하는지 검증한다.
7. 영어 Axes/action/supported-features/LLM 문서를 갱신한다.

## 제외 범위

- Locale/timezone option
- Custom time-format string
- Top/right axes
- Grid lines
- Legend, chart title, `createGuides`

## 검증 결과

- Unit/acceptance test 189개 통과
- PNG render regression 5개 통과
- 1970–1982 domain에서 2년 간격 UTC ticks와 labels 생성
- Linear aggregate y-axis의 10, 12, ..., 20 layout 유지
- `Year`, `mean(Acceleration)` title inference 검증
- Canvas 변경 후 time scale과 axis component rematerialization 검증
- Semantic axis에 resolved coordinate ID 저장
- Actions program의 raw axis semantic/graphic 호출 제거
- STEP1 primitive line program과 test 변경 없음
- 고해상도 actions line chart 직접 확인

## 완료 조건

- `.createAxes()`가 time x-axis와 linear aggregate y-axis를 생성한다.
- x tick text가 1970, 1972, ..., 1982로 materialize된다.
- Axis title이 `Year`, `mean(Acceleration)`으로 추론된다.
- Canvas resize 후 time axis geometry와 labels가 다시 계산된다.
- Actions program에서 raw axis graphics와 helper axis 계산이 사라진다.
- Primitive line program과 scatterplot axes behavior가 유지된다.
- 관련 test와 문서가 통과하고 변경이 commit/push된다.
