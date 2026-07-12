# STEP 4 — Aggregate Line `encodeY`

## 목표

`mean` aggregation을 지원하는 line `encodeY`를 구현한다. Temporal x와 aggregate
y가 모두 존재하면 현재 semantic encoding을 기준으로 derived series를 계산하고
최초의 concrete line path를 materialize한다.

```javascript
.encodeY({
  field: "Acceleration",
  fieldType: "quantitative",
  aggregate: "mean",
  scale: { nice: true, zero: false }
})
```

## 진행 상태

- [ ] Line `encodeY` option과 target validation
- [ ] Immutable mean aggregation과 derived series 계산
- [ ] 현재 non-aggregate encoding 기반 grouping
- [ ] Temporal x 기준 series 정렬
- [ ] Aggregate 결과 기반 y domain resolution
- [ ] `zero → nice` automatic domain 처리
- [ ] Wrapped line path materialization action
- [ ] Canvas 변경 시 scale/path rematerialization
- [ ] 별도 actions program의 raw y block 교체
- [ ] Unit, acceptance, PNG regression
- [ ] 영어 Encoding/action/LLM 문서 갱신

## Action 구조

```text
encodeY(...)
├─ editSemantic(layer[trends].encoding.y.field)
├─ editSemantic(layer[trends].encoding.y.fieldType)
├─ editSemantic(layer[trends].encoding.y.aggregate = mean)
├─ editSemantic(layer[trends].encoding.y.scale)
├─ createScale(y, linear, nice = true, zero = false)
└─ rematerializeLineMark(trends)
   ├─ 현재 encoding으로 group/aggregate
   ├─ temporal x 값으로 정렬
   ├─ rematerializeScale(x)
   ├─ rematerializeScale(y)
   ├─ editGraphics(length)
   ├─ editGraphics(points)
   ├─ editGraphics(stroke)
   ├─ editGraphics(strokeWidth)
   └─ editGraphics(strokeDash)
```

`rematerializeLineMark`는 Chart Authoring API가 아니라 domain action이 호출하는
wrapped internal materialization action이다. Trace에는 의미 있는 재계산 단계로
남지만 일반 사용자가 직접 호출할 필요는 없다.

## Aggregation과 grouping

Aggregate 값은 source dataset을 변경하지 않고 계산한다. Group key는 현재
non-aggregate encoding field들의 조합이다. 동일 field가 여러 channel에서
사용되면 group key에는 한 번만 포함한다.

STEP4 직후에는 x만 non-aggregate encoding이므로 다음과 같다.

```text
group key  = Year
measure    = mean(Acceleration)
series key = 없음
series     = 1개
```

후속 Origin series encoding이 추가되면 동일 materializer가 다음 grouping을
사용할 수 있어야 한다.

```text
group key  = Year × Origin
series key = Origin
series     = Origin별 path
```

각 series 안의 aggregate tuple은 normalized temporal x 오름차순으로 정렬한다.
유효한 aggregate tuple이 없거나 path당 point가 2개 미만이면 오류다.

## Scale 규칙

- Line y는 `quantitative` field와 `linear` scale을 사용한다.
- STEP4의 aggregate vocabulary는 `mean` 하나다.
- Automatic y domain은 raw row가 아니라 aggregate 결과에서 계산한다.
- Automatic domain은 `zero`를 먼저 적용하고 `nice`를 적용한다.
- Explicit domain은 `zero`와 `nice`보다 우선한다.
- x와 y의 explicit/automatic range를 사용해 concrete point를 계산한다.

## Graphical 결과

Color 또는 strokeDash encoding이 없으면 하나의 renderable solid path를 만든다.

```javascript
{
  points: [...],
  stroke: "#4c78a8",
  strokeWidth: 2,
  strokeDash: []
}
```

Graphical 기본값은 semantic encoding이 아니며 `graphicSpec`에만 저장한다.

## Canvas rematerialization

Canvas width, height, margin 변경으로 automatic range가 바뀌면 positional scale을
먼저 resolve하고 해당 line mark의 points를 wrapped action으로 다시 계산한다.
하나의 line mark를 여러 positional scale이 소비해도 mark rematerialization은 한
번만 호출한다.

## Test program

- STEP1 primitive line program과 test는 변경하지 않는다.
- `carsLineChartActions`의 raw y encoding/scale block만 `encodeY`로 교체한다.
- 후속 primitive color/strokeDash semantic 변경은 최종 line materialization을
  명시적으로 다시 호출해 resolved scale과 path를 stale 상태로 남기지 않는다.
- 최종 helper 기반 graphical edits는 이후 encoding action 단계까지 유지한다.

## 구현 순서

1. Dataset과 line encoding에서 immutable derived series를 계산한다.
2. Mean, grouping, temporal sort, invalid/empty 상태를 unit test한다.
3. Wrapped `rematerializeLineMark`를 구현하고 x/y scale을 resolve한다.
4. Line용 aggregate `encodeY`를 기존 point `encodeY`와 함께 연결한다.
5. Canvas bounds 변경 시 관련 line mark를 한 번씩 rematerialize한다.
6. Actions program의 raw y block을 교체하고 후속 semantic 변경을 재계산한다.
7. Unit, acceptance, PNG regression으로 기존 결과를 검증한다.
8. 영어 public/LLM 문서를 현재 API와 맞춘다.

## 제외 범위

- Aggregate vocabulary 확장
- Public transform/derived-dataset API
- `encodeColor`의 line grouping orchestration
- `encodeStrokeDash`
- Legend와 title domain action

## 완료 조건

- `encodeX().encodeY()`만으로 단일 평균 line이 렌더링된다.
- Semantic y encoding에 `aggregate: "mean"`과 scale ID가 저장된다.
- Resolved y domain은 aggregate 결과를 사용한다.
- Source dataset과 이전 ChartProgram은 변경되지 않는다.
- Canvas resize 후 scale과 path points가 함께 갱신된다.
- Primitive line program, scatterplot API, 기존 PNG 결과가 유지된다.
- 관련 test와 문서가 통과하고 변경이 commit/push된다.
