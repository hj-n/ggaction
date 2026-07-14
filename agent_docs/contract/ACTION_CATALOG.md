# Action Contract and Coverage Catalog

이 문서는 ggaction의 direct action 계약과 테스트 coverage를 관리하는 기준 문서다.
일반 사용자를 위한 설명은 `docs/`에 두고, 여기서는 API의 현재 동작, 계획된 동작,
내부 상태에 미치는 영향과 검증 근거를 함께 기록한다.

## 범위

Catalog의 최상위 분류는 두 개뿐이다.

- **User-facing actions**: `ChartProgram`의 public type에 선언되어 차트 작성자 또는
  advanced 작성자가 직접 호출할 수 있는 action
- **Primitives**: extension action이 semantic/graphic state를 직접 작성할 때 사용하는
  `editSemantic`, `createGraphics`, `editGraphics`

`action()` wrapper와 renderer는 action method가 아니므로 제외한다. Runtime trace에만
나타나는 `rematerializePointMark`, `createLegendSymbols` 같은 내부 wrapped action도
Catalog 본문에서 제외한다. Public type에 선언된 materialization action은 현재 지원되는
direct call이므로 User-facing actions에 포함한다. 이 경계가 바뀌면 type, public reference,
Catalog와 contract test를 같은 변경에서 갱신해야 한다.

## 상태와 coverage 표기

### 구현 상태

- **Implemented**: 현재 구현, public type과 테스트 대상에 존재한다.
- **Planned**: 사용자와 추가하기로 합의했지만 아직 구현되지 않았다.
- **Proposed**: 필요성만 확인됐거나 이름, 값, 우선순위가 아직 결정되지 않았다.

### 현황 기호

- **✅**: 현재 계약과 대표·경계·오류 테스트가 충분하다.
- **⚠️**: 구현됐지만 값 종류, 상호작용 또는 영향 검증이 일부 부족하다.
- **❌**: 구현 또는 실행 가능한 검증 근거가 없다.
- **—**: 해당 action에 적용되지 않는다.

Coverage 퍼센트는 사용하지 않는다. 체크된 case는 반드시 아래에 명시된 테스트 파일에서
실행 가능해야 한다. 숫자와 임의 문자열처럼 열린 값 공간은 모든 값을 나열하는 대신
경계값, 대표값, 잘못된 값과 의미 있는 상호작용으로 나눈다.

## 전체 현황

아래 표의 action 링크는 상세 계약으로 이동한다. `Contract`는 parameter와 값 공간,
`Effects`는 semantic/graphic/rematerialization 설명, `Tests`는 현재 case coverage 상태다.

| Layer | Action | Status | Contract | Effects | Tests |
| --- | --- | --- | ---: | ---: | ---: |
| User-facing | [`createCanvas`](#createcanvas) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`editCanvas`](#editcanvas) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createData`](#createdata) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`filterData`](#filterdata) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createDensityData`](#createdensitydata) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createRegressionData`](#createregressiondata) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createPointMark`](#createpointmark) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createLineMark`](#createlinemark) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createBarMark`](#createbarmark) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createAreaMark`](#createareamark) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeX`](#encodex) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeY`](#encodey) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeColor`](#encodecolor) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeStrokeDash`](#encodestrokedash) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeSize`](#encodesize) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeShape`](#encodeshape) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeOpacity`](#encodeopacity) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`encodeRadius`](#encoderadius) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`encodeXOffset`](#encodexoffset) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeY2`](#encodey2) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeYRange`](#encodeyrange) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeGroup`](#encodegroup) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeHistogram`](#encodehistogram) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`encodeDensity`](#encodedensity) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`encodeBarWidth`](#encodebarwidth) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createRegression`](#createregression) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createAxes`](#createaxes) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createXAxis`](#createxaxis) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createYAxis`](#createyaxis) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createXAxisLine`](#createxaxisline) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createYAxisLine`](#createyaxisline) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`editXAxisLine`](#editxaxisline) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`editYAxisLine`](#edityaxisline) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createXAxisTicks`](#createxaxisticks) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createYAxisTicks`](#createyaxisticks) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`editXAxisTicks`](#editxaxisticks) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`editYAxisTicks`](#edityaxisticks) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createXAxisLabels`](#createxaxislabels) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createYAxisLabels`](#createyaxislabels) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`editXAxisLabels`](#editxaxislabels) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`editYAxisLabels`](#edityaxislabels) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createXAxisTicksAndLabels`](#createxaxisticksandlabels) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createYAxisTicksAndLabels`](#createyaxisticksandlabels) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`editXAxisTicksAndLabels`](#editxaxisticksandlabels) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`editYAxisTicksAndLabels`](#edityaxisticksandlabels) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createXAxisTitle`](#createxaxistitle) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createYAxisTitle`](#createyaxistitle) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`editXAxisTitle`](#editxaxistitle) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`editYAxisTitle`](#edityaxistitle) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createGrid`](#creategrid) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createHorizontalGrid`](#createhorizontalgrid) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createVerticalGrid`](#createverticalgrid) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createLegend`](#createlegend) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createSizeLegend`](#createsizelegend) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`rematerializeSizeLegend`](#rematerializesizelegend) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createGuides`](#createguides) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createTitle`](#createtitle) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createCoordinate`](#createcoordinate) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createScale`](#createscale) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`rematerializeScale`](#rematerializescale) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createDerivedData`](#createderiveddata) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`materializeFilteredData`](#materializefiltereddata) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`materializeRegressionData`](#materializeregressiondata) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`materializeDensityData`](#materializedensitydata) | Implemented | ✅ | ✅ | ✅ |
| User-facing | [`createRegressionBand`](#createregressionband) | Implemented | ✅ | ✅ | ⚠️ |
| User-facing | [`createRegressionLine`](#createregressionline) | Implemented | ✅ | ✅ | ⚠️ |
| Primitive | [`editSemantic`](#editsemantic) | Implemented | ✅ | ✅ | ✅ |
| Primitive | [`createGraphics`](#creategraphics) | Implemented | ✅ | ✅ | ✅ |
| Primitive | [`editGraphics`](#editgraphics) | Implemented | ✅ | ✅ | ✅ |

## 상세 계약 작성 규칙

각 action section은 다음 순서로 작성한다.

1. signature, 목적, 필수 state와 action-level 결과
2. parameter별 타입, 필수 여부, accepted values, default/inference
3. parameter 상호작용과 우선순위
4. semantic, graphic/rendering, rematerialization 영향
5. 오류 조건과 실행 가능한 coverage 근거

대칭인 x/y guide action은 같은 parameter contract를 공유할 수 있지만, 전체 현황과
상세 heading에는 두 action을 모두 명시한다.

## User-facing actions

### Canvas

#### `createCanvas`

- Signature: `createCanvas({ width?, height?, background?, margin? })`
- 목적과 필수 state: Canvas가 없는 program에 logical Canvas와 plot bounds를 만든다.
- `width`
  - Status: Implemented. 양의 finite number이며 기본값은 `640`이다.
  - Effect: `canvas.properties.width`와 plot width를 결정한다. 이후 auto-range scale,
    mark, axis, grid, legend와 title geometry의 기준이 된다.
- `height`
  - Status: Implemented. 양의 finite number이며 기본값은 `400`이다.
  - Effect: Canvas와 plot height를 결정하고 모든 y geometry 및 reserved layout에 영향을 준다.
- `background`
  - Status: Implemented. 비어 있지 않은 color string이며 기본값은 `"white"`다.
  - Effect: concrete Canvas background만 바꾸며 semantic state에는 들어가지 않는다.
- `margin`
  - Status: Implemented. non-negative finite scalar 또는 `{ top?, right?, bottom?, left? }`다.
    scalar는 네 방향에 broadcast되고 partial object는 기본 margin의 나머지 방향을 유지한다.
  - Effect: graphical materialization config의 plot bounds를 결정한다. Canvas 생성 시 아직
    consumer가 없으므로 rematerialization은 발생하지 않는다.
- 오류와 상호작용: unknown option, invalid dimension/color/margin, 두 번째 Canvas를 거부한다.
- Coverage: `test/unit/actions/canvas/create-canvas.test.js`,
  `test/unit/grammar/layout/canvas-layout.test.js`가 defaults, partial options, invalid values와
  duplicate를 검증한다.

#### `editCanvas`

- Signature: `editCanvas({ width?, height?, background?, margin? })`
- 목적과 필수 state: 기존 Canvas의 한 개 이상 property를 immutable하게 편집한다.
- `width`, `height`, `background`, `margin`
  - Status: Implemented. 값 계약은 `createCanvas`와 같다. 생략한 property는 기존 값을 유지한다.
  - Effect: width/height/margin은 auto-range scale을 시작점으로 모든 registered consumer의
    deterministic materialization plan을 실행한다. background만 바꾸면 consumer를 다시 만들지 않는다.
  - Interaction: explicit scale range는 Canvas bounds 변경으로 재계산되지 않는다.
- 오류: 빈 edit, Canvas 부재, unknown option과 invalid resolved bounds를 거부한다.
- Coverage: `test/unit/actions/canvas/edit-canvas.test.js`가 partial edit, margin-only edit,
  auto/explicit range 차이와 rematerialization을 검증한다.

### Data

#### `createData`

- Signature: `createData({ id, values })`
- `id`
  - Status: Implemented. 필수 user-defined ID다. 지원 문자 규칙을 통과하고 기존 dataset과
    중복되지 않아야 한다.
  - Effect: `semanticSpec.datasets`의 key 역할을 하며 성공 후 current data가 된다.
- `values`
  - Status: Implemented. 필수 array이며 각 row는 plain object여야 한다. 빈 배열, nested array,
    object-valued cell은 허용한다.
  - Effect: caller-owned 값을 deep clone/freeze하여 immutable source dataset으로 저장한다.
    graphic output은 만들지 않는다.
- 오류: missing/invalid ID, non-array, non-object row와 duplicate dataset을 거부한다.
- Coverage: `test/unit/actions/data/create-data.test.js`가 empty/multiple data, ownership,
  trace summary, invalid values와 duplicates를 검증한다.

#### `filterData`

- Signature: `filterData({ id, source?, field, oneOf })`
- `id`: Implemented, 필수 derived dataset ID. 새 ID여야 한다.
- `source`: Implemented, dataset ID. 생략하면 current data를 사용하며 유일하게 추론되지 않으면 오류다.
- `field`: Implemented, 비어 있지 않은 필드 이름. 각 row에 값이 없어도 비교 결과가 false일 수 있다.
- `oneOf`: Implemented, scalar accepted-value array. strict equality membership으로 row를 유지하며
  transform input은 소유권 복사된다.
- Effect: filter provenance를 가진 immutable derived dataset을 만들고 wrapped
  `materializeFilteredData`가 concrete values를 저장한다. 기존 source는 변하지 않는다.
- Coverage: `test/unit/actions/data/filter-data.test.js`가 source inference, scalar types,
  ownership, invalid options와 primitive equivalence를 검증한다.

#### `createRegressionData`

- Signature: `createRegressionData({ id, source?, x, y, groupBy?, method?, confidence?, interval? })`
- `id`, `source`: Implemented. 새 derived ID와 existing source ID이며 source는 current data로 추론된다.
- `x`, `y`: Implemented. 필수 quantitative field 이름이다. finite numeric values가 필요하다.
- `groupBy`: Implemented. optional field 이름이며 생략 시 하나의 regression을 만든다. 값의 first
  appearance order가 group order다.
- `method`: Implemented. 현재 가능한 값은 `"linear"`뿐이고 기본값도 `"linear"`다.
- `confidence`: Implemented. `(0, 1)`의 finite number이며 기본값은 `0.95`다. Student-t
  mean-response confidence bounds의 폭을 바꾼다.
- `interval`: Implemented. 현재 가능한 값은 `"mean"`뿐이고 기본값도 `"mean"`이다.
- Effect: source, fields, grouping, resolved defaults를 transform provenance에 저장하고 observed
  unique x별 fitted y/lower/upper row를 materialize한다. graphic은 직접 만들지 않는다.
- Coverage: `test/unit/actions/data/regression-data.test.js`와
  `test/charts/regression-scatterplot/reference-values.test.js`가 grouped/ungrouped 값,
  confidence bounds와 invalid/degenerate groups를 검증한다. 여러 confidence 대표값 coverage는 부분적이다.

#### `createDensityData`

- Signature: `createDensityData({ id, source?, field, groupBy?, bandwidth?, extent?, steps?, as? })`
- `id`, `source`, `field`, `groupBy`: Implemented. 새 derived ID, existing source, 필수 quantitative
  field와 optional grouping field다.
- `bandwidth`
  - Status: Implemented. positive finite number 또는 `"auto"`; 기본은 `"auto"`다.
  - Effect: Gaussian kernel 폭을 결정한다. auto는 deterministic Scott-rule 결과를 provenance에
    concrete number로 다시 저장한다.
- `extent`
  - Status: Implemented. `"auto"` 또는 오름차순 finite `[min, max]`; 기본은 `"auto"`다.
  - Effect: 모든 group이 공유하는 sample grid의 시작과 끝을 결정한다.
- `steps`
  - Status: Implemented. 2 이상의 integer이며 기본값은 `100`이다.
  - Effect: inclusive grid의 row 수와 area path resolution을 결정한다.
- `as`
  - Status: Implemented. 서로 다른 두 개의 non-empty field 이름이며 기본은
    `[`${field}_value`, `${field}_density`]`다.
  - Effect: derived row와 이후 encoding이 참조할 output field 이름을 결정한다.
- Effect: grouped Gaussian KDE provenance와 deterministic values를 저장한다.
- Coverage: `test/unit/actions/data/density-data.test.js`와
  `test/charts/density-area/reference-values.test.js`가 auto/explicit bandwidth, extent,
  grouped/ungrouped, ownership과 오류를 검증한다. steps의 여러 경계/대표 조합은 부분적이다.

#### `createDerivedData`

- Signature: `createDerivedData({ id, source, transform })`
- `id`: Implemented, 필수 새 dataset ID.
- `source`: Implemented, 필수 existing dataset ID.
- `transform`: Implemented, 필수 transform definition array. 현재 filter/regression/density schema만
  semantic validation이 가능하며 값 materialization은 해당 전용 action이 담당한다.
- Effect: source와 transform provenance만 저장하고 values는 만들지 않는다.
- 오류: duplicate ID, unknown source, invalid/empty transform schema를 거부한다.
- Coverage: transform schema는 data action 및 `test/charts/regression-scatterplot/semantic.test.js`에서
  검증되지만 각 transform을 이 low-level action으로 직접 호출하는 조합은 부분적이다.

#### `materializeFilteredData`

- Signature: `materializeFilteredData({ id })`
- `id`: Implemented. filter transform이 하나 저장된 existing derived dataset ID다.
- Effect: source values를 strict membership으로 필터링해 derived values만 갱신한다.
- Coverage: `test/unit/actions/data/filter-data.test.js`에서 child trace와 결과를 검증한다.

#### `materializeRegressionData`

- Signature: `materializeRegressionData({ id })`
- `id`: Implemented. regression transform이 저장된 existing derived dataset ID다.
- Effect: provenance를 읽어 deterministic OLS values를 다시 계산한다.
- Coverage: `test/unit/actions/data/regression-data.test.js`에서 child trace와 결과를 검증한다.

#### `materializeDensityData`

- Signature: `materializeDensityData({ id })`
- `id`: Implemented. density transform이 저장된 existing derived dataset ID다.
- Effect: KDE values를 계산하고 resolved auto bandwidth까지 provenance에 갱신한다.
- Coverage: `test/unit/actions/data/density-data.test.js`에서 child trace와 결과를 검증한다.

### Marks

#### `createPointMark`

- Signature: `createPointMark({ id, data?, shape? })`
- `id`: Implemented, 필수 새 layer/graphic ID.
- `data`: Implemented, existing dataset ID. 생략하면 current data를 사용한다.
- `shape`
  - Status: Implemented. `"circle" | "square"`, 기본값 `"circle"`.
  - Effect: semantic mark는 항상 `point`지만 concrete collection child는 circle 또는 rect가 된다.
- Effect: dataset cardinality와 같은 길이의 point graphic collection을 만들며 아직 위치 property가
  없으므로 encoding 전에는 보이지 않을 수 있다.
- Coverage: `test/unit/actions/marks/create-point-mark.test.js`가 두 shape, empty data,
  multiple marks, inference, conflicts와 trace를 검증한다.

#### `createLineMark`

- Signature: `createLineMark({ id, data?, strokeWidth? })`
- `id`, `data`: `createPointMark`와 같은 ID/data 계약이다.
- `strokeWidth`: Implemented, non-negative finite number이며 concrete default는 `2`다. 명시한 값은
  mark materialization config에 저장되어 path 재생성 후에도 유지된다.
- Effect: semantic `line` layer와 길이 0의 path collection을 만든다. x/y encoding이 완성되기
  전에는 path가 없다.
- Coverage: `test/unit/actions/marks/create-line-mark.test.js`가 default/explicit data,
  empty dataset, invalid width와 conflicts를 검증한다.

#### `createBarMark`

- Signature: `createBarMark({ id, data? })`
- `id`, `data`: 필수 새 ID와 optional existing dataset/current data다.
- Effect: semantic `bar` layer와 길이 0의 rect collection을 만든다. 관련 x/y/grouping semantics가
  완성될 때 rect가 materialize된다.
- Coverage: `test/unit/actions/marks/create-bar-mark.test.js`가 inference, empty data,
  invalid options와 conflicts를 검증한다.

#### `createAreaMark`

- Signature: `createAreaMark({ id, data?, fill?, opacity? })`
- `id`, `data`: 필수 새 ID와 optional existing/current dataset이다.
- `fill`: Implemented, non-empty color string. 기본값은 theme mark color `"#4c78a8"`다.
- `opacity`: Implemented, `[0, 1]` finite number. 기본값은 `0.2`다.
- Effect: semantic `area` layer와 빈 path collection을 만들고 fill/opacity는 graphical config에
  저장한다. ranged y 또는 density encoding이 완성되면 closed path를 만든다.
- Coverage: density/regression chart와 area materialization tests가 default와 representative
  appearance를 검증한다. fill vocabulary와 opacity 양 끝값의 direct action coverage는 부분적이다.

### Shared scale option contract

Encoding의 `scale` object는 channel에 따라 아래 subset을 사용한다.

- `id`: Implemented. user-defined scale ID; 생략하면 channel 이름(`x`, `y`, `color`, `size`,
  `shape`, `strokeDash`, `xOffset`)을 사용한다.
- `type`: Implemented. position은 field type에 따라 `linear | time | ordinal`, color/shape/dash/offset은
  `ordinal`, size는 `linear`만 허용한다.
- `domain`: Implemented. `"auto"` 또는 type에 맞는 explicit array. explicit domain은 data inference,
  `zero`, `nice`보다 우선한다.
- `range`: Implemented. `"auto"` 또는 type/channel에 맞는 explicit array. position auto range는
  Canvas plot bounds를 사용한다.
- `nice`: Implemented for linear/time position scale. boolean이며 auto domain만 읽기 좋은 경계로
  확장한다. ordinal에는 허용되지 않는다.
- `zero`: Implemented for linear scale. boolean이며 auto domain에만 zero를 포함한다. explicit domain이
  있으면 적용되지 않는다.
- `palette`: Implemented for color scale. palette name이며 `range`와 동시에 사용할 수 없다.
- Planned/Proposed: 추가 palette vocabulary와 interpolated color scale은 아직 확정되지 않았다.

### Position and grouping encodings

#### `encodeX`

- Signature: `encodeX({ field, target?, fieldType?, scale?, coordinate?, aggregate?, bin?, stack? })`
- `field`: Implemented, dataset에 존재하는 field. 현재 supported mark grain에 맞는 값 type이 필요하다.
- `target`: Implemented, mark ID. 생략하면 current mark, 아니면 유일한 eligible mark를 추론한다.
- `fieldType`: Implemented. point/area는 `quantitative`, line은 `temporal`, bar는 `quantitative`
  bin 또는 `ordinal`을 지원한다. 생략 시 지원되는 mark별 기본을 사용한다.
- `scale`: Implemented. 위 shared contract를 사용한다. 기본 ID는 `x`, auto range는 left-to-right plot bounds다.
- `coordinate`: Implemented, coordinate ID. 생략 시 positional action이 Cartesian `main` coordinate를
  만들거나 existing compatible coordinate를 사용하고 layer에 저장한다.
- `bin.maxBins`: Implemented for quantitative bar x. positive integer이며 histogram aggregate의
  default는 `10`; bin boundaries와 bar x/width를 결정한다.
- `aggregate`, `stack`: x의 현재 supported combinations에는 사용되지 않으며 잘못된 combination은 거부된다.
- Effect: x encoding과 scale을 semantic state에 저장하고 scale 및 compatible mark/guide consumers를
  rematerialize한다.
- Coverage: position, histogram, ordinal bar, temporal chart tests가 주요 mark 조합을 검증한다.
  explicit scale option의 전체 교차조합은 부분적이다.

#### `encodeY`

- Signature: `encodeY({ field?, target?, fieldType?, scale?, coordinate?, aggregate?, bin?, stack? })`
- `field`: point/area/line/ordinal-bar에서는 필수 field다. histogram count y는 x field에서 추론한다.
- `target`, `fieldType`, `scale`, `coordinate`: x와 같은 selection/storage contract이며 auto range는
  bottom-to-top plot bounds다.
- `aggregate`: Implemented values `"mean" | "count"`. line과 ordinal bar는 mean, histogram은 count를
  사용한다. raw quantitative point/area는 생략한다.
- `stack`: Implemented values `"zero" | null`. histogram color series는 zero stack, grouped ordinal
  bar는 `null`이다.
- `bin`: 현재 y에서는 지원되지 않는다.
- Effect: y semantic, scale, bar aggregate grain 또는 line mean grain을 저장하고 mark geometry와
  existing guides를 rematerialize한다.
- Coverage: supported charts가 raw/mean/count, zero/null 조합을 검증한다. unsupported 조합과
  scale override의 pairwise coverage는 부분적이다.

#### `encodeXOffset`

- Signature: `encodeXOffset({ field, target?, fieldType?, scale? })`
- `field`: Implemented, nominal grouping field. ordinal x/mean y/non-stacked bar에만 허용된다.
- `target`: optional eligible bar ID.
- `fieldType`: Implemented, 유일한 값 `"nominal"`, 기본값도 nominal이다.
- `scale`: ordinal scale contract; 기본 ID `xOffset`, domain은 grouping order, range는 parent x band다.
- Effect: x band 안에 group sub-band를 만들고 scale을 materialize한다. concrete rect는 color/group
  semantics와 width가 완성될 때 생성된다.
- Coverage: grouped-bar semantic/reference tests가 automatic child action과 geometry를 검증한다.
  direct explicit range 조합은 부분적이다.

#### `encodeY2`

- Signature: `encodeY2({ field, target?, fieldType?, scale? })`
- `field`: 필수 quantitative upper-bound field.
- `target`: optional area ID.
- `fieldType`: 유일한 값 `"quantitative"`, 기본값도 quantitative다.
- `scale`: 생략 또는 `{ id: existingYScale }`만 허용하며 y와 다른 scale을 만들 수 없다.
- Effect: semantic y2를 existing y scale에 연결하고 closed area path를 rematerialize한다.
- Coverage: ranged area/regression tests가 shared scale과 invalid prerequisites를 검증한다.

#### `encodeYRange`

- Signature: `encodeYRange({ lower, upper, target?, fieldType?, coordinate?, scale? })`
- `lower`, `upper`: 필수 quantitative field names이며 각각 y와 y2가 된다.
- `target`, `fieldType`, `coordinate`, `scale`: `encodeY` 계약을 공유한다.
- Effect: wrapped `encodeY` 뒤 `encodeY2`를 호출하는 atomic action이다. 중간의 incomplete area
  상태를 public workflow에 노출하지 않는다.
- Coverage: regression band와 area tests가 hierarchy와 path geometry를 검증하며 explicit scale
  variations는 부분적이다.

#### `encodeGroup`

- Signature: `encodeGroup({ field, target?, fieldType? })`
- `field`: 필수 nominal field. density area에서는 density transform의 `groupBy`와 일치해야 한다.
- `target`: line 또는 area ID; 생략 시 current/unique eligible target을 추론한다.
- `fieldType`: 유일한 값 `"nominal"`, 기본값도 nominal이다.
- Effect: series를 path별로 나누는 semantic group만 저장한다. scale이나 guide는 만들지 않으며
  필요한 position encoding이 이미 완성됐을 때 path를 rematerialize한다.
- Coverage: line, regression, density tests가 grouped/ungrouped와 mismatch를 검증한다.

#### `encodeHistogram`

- Signature: `encodeHistogram({ field, target?, coordinate?, maxBins?, stack?, xScale?, yScale? })`
- `field`, `target`, `coordinate`: binned x에 전달되는 field와 optional target/coordinate다.
- `maxBins`: positive integer, 기본값 `10`; `encodeX.bin.maxBins`로 전달된다.
- `stack`: `"zero" | null`, 기본값 `"zero"`; `encodeY`로 전달된다.
- `xScale`, `yScale`: optional scale objects이며 각각 child x/y action에 전달된다.
- Effect: wrapped `encodeX`와 `encodeY`를 원자적으로 결합해 bin/count semantics와 concrete rects를 만든다.
- Coverage: histogram unit/chart tests가 defaults, stack, bin boundaries, scale rules와 trace hierarchy를 검증한다.

#### `encodeDensity`

- Signature: `encodeDensity({ field, target?, source?, groupBy?, bandwidth?, extent?, steps?, as?, densityChannel?, coordinate?, valueScale?, densityScale? })`
- `field`, `source`, `groupBy`, `bandwidth`, `extent`, `steps`, `as`: `createDensityData`와 같은 계약이며
  derived ID는 `${target}DensityData`로 namespace된다.
- `target`: area mark ID. 생략하면 current 또는 유일한 eligible area를 추론한다.
- `densityChannel`: `"x" | "y"`, 기본값 `"y"`. y이면 value→x/density→y, x이면 반대로 연결한다.
- `coordinate`: optional compatible coordinate ID.
- `valueScale`: position scale object, 기본 `{ nice: false, zero: false }`.
- `densityScale`: position scale object, 기본 `{ nice: true, zero: true }`; baseline을 그리기 위해 domain이
  zero를 포함해야 한다.
- Effect: density data 생성, layer data rebinding, x/y encoding, optional group encoding, baseline-closed
  area path materialization을 하나의 hierarchy로 수행한다.
- Coverage: density data/mark/chart/guide tests가 두 orientation, grouped/ungrouped, explicit/auto
  density options와 rematerialization을 검증한다. 여러 steps×bandwidth pair는 부분적이다.

### Appearance and series encodings

#### `encodeColor`

- Signature: `encodeColor({ field, target?, fieldType?, layout?, scale? })`
- `field`: 필수 nominal field.
- `target`: point, line, bar 또는 area ID; current/unique inference를 지원한다.
- `fieldType`: 유일한 값 `"nominal"`, 기본값도 nominal이다.
- `layout`: bar에서 `"stack" | "group"`; histogram default는 stack이고 ordinal grouped bar는 group이다.
  다른 mark에서는 생략해야 한다.
- `scale`: ordinal color scale. `palette` 또는 explicit `range` 중 하나를 사용할 수 있다.
- Effect: color semantic과 scale을 저장한다. point fill, line stroke, bar fill, area fill로 materialize한다.
  group layout은 wrapped `encodeXOffset`, stack layout은 zero-stack bar geometry를 사용한다.
- Coverage: 모든 대표 chart와 legend tests가 mark별 materialization을 검증한다. palette vocabulary,
  explicit ranges와 layout 오류의 전체 matrix는 부분적이다.

#### `encodeStrokeDash`

- Signature: `encodeStrokeDash({ field, target?, fieldType?, scale? })`
- `field`, `target`, `fieldType`: nominal field, optional line ID, nominal-only type다.
- `scale`: ordinal dash scale. range는 non-negative finite number array들의 array다.
- Effect: line series별 concrete `strokeDash`와 categorical legend symbol을 rematerialize한다.
- Coverage: line semantic, series legend와 scale tests가 auto/explicit dash를 검증하며 다양한 dash
  pattern 경계는 부분적이다.

#### `encodeSize`

- Signature: `encodeSize({ field, target?, fieldType?, scale? })`
- `field`: 필수 quantitative field.
- `target`: optional point ID.
- `fieldType`: 유일한 값 `"quantitative"`.
- `scale`: linear size-area scale; auto range는 `[24, 196]`이다.
- Effect: semantic size를 concrete area로 mapping하고 circle radius=`sqrt(area/pi)`, square side=`sqrt(area)`로
  materialize한다. constant `encodeRadius`와 함께 사용할 수 없다.
- Coverage: regression scatterplot과 size legend tests가 representative mapping을 검증한다. explicit
  domain/range와 constant-size conflict의 값 matrix는 부분적이다.

#### `encodeShape`

- Signature: `encodeShape({ field, target?, fieldType?, scale? })`
- `field`, `target`, `fieldType`: nominal field, optional point ID, nominal-only type다.
- `scale`: ordinal shape scale. 현재 resolved symbol vocabulary는 `"circle" | "square"`다.
- Effect: point graphic을 heterogeneous collection으로 바꾸고 각 datum의 concrete primitive type과
  legend symbol을 rematerialize한다.
- Coverage: regression scatterplot과 point/legend tests가 circle/square mapping을 검증한다.

#### `encodeOpacity`

- Signature: `encodeOpacity({ value, target? })`
- `value`: 필수 finite `[0, 1]` number. 0은 완전 투명, 1은 완전 불투명이다.
- `target`: optional point ID.
- Effect: semantic encoding이 아니라 mark graphical config와 모든 point child opacity를 바꾼다.
- Coverage: point/regression tests와 validation이 representative 및 invalid range를 검증한다.

#### `encodeRadius`

- Signature: `encodeRadius({ value, target? })`
- `value`: 필수 non-negative finite number. 0은 보이지 않는 point, 양수는 circle radius 또는 square
  half-side가 된다.
- `target`: optional point ID.
- Effect: graphical mark config와 concrete size만 바꾸며 semanticSpec에는 기록하지 않는다.
  field-driven `encodeSize`와 동시에 사용할 수 없다.
- Coverage: scatterplot/point tests가 constant radius, rematerialization과 invalid values를 검증한다.
- Proposed: Polar position의 radial channel 이름은 이미 이 action이 차지한 `encodeRadius`와 충돌한다.
  Polar API를 설계할 때 별도 이름을 사용자와 결정해야 한다.

#### `encodeBarWidth`

- Signature: `encodeBarWidth({ band?, target? })`
- `band`: `(0, 1]` finite number, 기본값 `0.72`. 각 xOffset slot 중 rect가 차지하는 비율이다.
- `target`: optional complete grouped bar ID.
- Effect: graphical mark config에 band fraction을 저장하고 rect x/width를 rematerialize한다.
- 오류: ordinal x, mean/non-stacked y, matching color/xOffset가 완성되지 않으면 거부한다.
- Coverage: grouped-bar semantic/reference tests가 default, explicit value, invalid range와 geometry를 검증한다.

