# STEP 5 — Line Series Encodings

## 목표

`encodeColor`를 line mark까지 확장하고 `encodeStrokeDash`를 추가한다. 두 action은
nominal field를 기준으로 series를 나누고 각 concrete path에 stroke와 dash를
적용한다.

```javascript
.encodeColor({
  field: "Origin",
  fieldType: "nominal",
  scale: { palette: "tableau10" }
})
.encodeStrokeDash({
  field: "Origin",
  fieldType: "nominal"
})
```

## 진행 상태

- [x] Line `encodeColor` target과 option 확장
- [x] `scale.palette`와 기존 `scale.range` 규칙
- [x] `encodeStrokeDash` public action
- [x] Built-in dash range 10개
- [x] Explicit dash range validation
- [x] Nominal field 기반 series regrouping
- [x] Color/strokeDash scale resolution
- [x] Path stroke와 dash materialization
- [x] Canvas 변경 시 semantic style 재적용
- [x] 별도 actions program의 raw series block 제거
- [x] Unit, acceptance, PNG regression
- [x] 영어 API/action/LLM 문서 갱신

## API

### `encodeColor`

```javascript
encodeColor({
  field,
  target?,
  fieldType?,
  scale?: { id?, type?, domain?, range?, palette? }
})
```

- Point mark에서는 기존처럼 graphical `fill`을 변경한다.
- Line mark에서는 series를 regroup하고 graphical `stroke`를 변경한다.
- `palette: "tableau10"`은 semantic range `{ palette: "tableau10" }`로 저장한다.
- `palette`와 `range`를 함께 지정하면 오류다.

### `encodeStrokeDash`

```javascript
encodeStrokeDash({
  field,
  target?,
  fieldType?,
  scale?: { id?, type?, domain?, range? }
})
```

- STEP5에서는 line mark만 지원한다.
- 기본 scale ID는 `strokeDash`다.
- Field type은 `nominal`, scale type은 `ordinal`이다.

## 기본 dash range

```javascript
[
  [],
  [8, 4],
  [3, 3],
  [12, 4],
  [8, 3, 2, 3],
  [12, 3, 3, 3],
  [2, 2],
  [10, 3, 2, 3, 2, 3],
  [14, 4, 4, 4],
  [6, 2, 2, 2]
]
```

- Automatic range는 위의 10개를 사용한다.
- Category가 10개를 넘으면 처음부터 순환한다.
- Explicit range 자체는 비어 있으면 안 된다.
- 각 pattern은 빈 배열 또는 짝수 개의 non-negative finite number다.
- 홀수 길이, 음수, `NaN`, `Infinity`는 오류다.

## Action 구조

```text
encodeColor
├─ editSemantic(color.field)
├─ editSemantic(color.fieldType)
├─ editSemantic(color.scale)
├─ createScale(color)
└─ rematerializeLineMark
   ├─ nominal series regroup
   ├─ x/y/color scale resolve
   ├─ path collection resize
   ├─ points materialize
   └─ stroke materialize
```

```text
encodeStrokeDash
├─ editSemantic(strokeDash.field)
├─ editSemantic(strokeDash.fieldType)
├─ editSemantic(strokeDash.scale)
├─ createScale(strokeDash)
└─ rematerializeLineMark
   ├─ existing series grouping 재사용
   ├─ strokeDash scale resolve
   └─ path dash materialize
```

## Series 규칙

Color와 strokeDash가 같은 field를 사용하면 group key에 한 번만 포함한다.

```text
aggregate group = Year × Origin
series key      = Origin
```

서로 다른 field를 사용하면 두 field의 조합으로 series를 나눈다. Scale domain과
path series는 dataset에서 key가 처음 등장한 순서를 유지한다.

## Materialization 규칙

- Color encoding이 있으면 resolved color scale이 `stroke`를 결정한다.
- Color encoding이 없으면 기존 또는 default stroke를 유지한다.
- StrokeDash encoding이 있으면 resolved dash scale이 `strokeDash`를 결정한다.
- StrokeDash encoding이 없으면 기존 또는 default dash를 유지한다.
- `strokeWidth` 기본값은 2다.
- Geometry만 바뀌면 기존 appearance를 보존한다.
- Semantic style encoding이 있으면 해당 scale 결과가 기존 appearance보다 우선한다.

## Test program

STEP1 primitive line program과 test는 변경하지 않는다. `carsLineChartActions`에서
다음 raw block을 제거한다.

- Color/strokeDash encoding과 scale `editSemantic`
- 직접 호출한 `rematerializeLineMark`
- `trends`의 length, points, stroke, strokeWidth, strokeDash `editGraphics`

STEP5 이후 line mark 본체는 다음 Chart API chain만으로 완성된다.

```javascript
.createLineMark(...)
.encodeX(...)
.encodeY(...)
.encodeColor(...)
.encodeStrokeDash(...)
```

Axes, legend, title의 primitive/helper 값은 후속 단계까지 유지한다.

## 구현 순서

1. Color palette alias와 dash range validation/default를 구현한다.
2. Ordinal scale materialization을 color/strokeDash channel별로 확장한다.
3. `encodeColor`가 point fill과 line stroke를 각각 처리하도록 분기한다.
4. Line-only `encodeStrokeDash`를 wrapped action으로 등록한다.
5. Line materializer가 semantic scale을 이용해 stroke/dash를 적용한다.
6. Canvas rematerialization에서 semantic style이 유지되는지 검증한다.
7. Actions program의 raw series block을 두 encoding action으로 교체한다.
8. Unit, acceptance, PNG regression과 영어 문서를 갱신한다.

## 제외 범위

- Point strokeDash encoding
- Additional named color/dash palettes
- Legend domain action
- Axis와 title domain action
- User-facing line appearance edit action

## 검증 결과

- Unit/acceptance test 180개 통과
- PNG render regression 5개 통과
- Automatic dash range 10개와 category 순환 검증
- Explicit dash range와 invalid pattern validation 검증
- Point fill과 line stroke의 `encodeColor` 동작 모두 유지
- 동일 nominal field의 color/strokeDash grouping deduplication 검증
- Canvas 변경 후 semantic stroke/dash 재적용 검증
- Actions program의 line mark 본체에서 raw semantic/graphic 호출 제거
- STEP1 primitive line program과 test 변경 없음
- 고해상도 actions line chart 직접 확인

## 완료 조건

- Chart API만으로 Origin별 path 3개가 생성된다.
- 각 path가 정렬된 points, Tableau10 stroke, distinct dash를 가진다.
- Semantic color/strokeDash encoding과 ordinal scale이 저장된다.
- Explicit domain/range와 automatic dash range가 검증된다.
- Canvas 변경 후 geometry와 semantic style이 유지된다.
- Primitive line program과 기존 scatterplot 동작이 유지된다.
- 관련 test와 문서가 통과하고 변경이 commit/push된다.
