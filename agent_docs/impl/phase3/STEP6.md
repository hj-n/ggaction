# STEP 6 — Atomic `encodeHistogram`

## 목표

Explicit `encodeX`와 `encodeY` 조합을 하나의 atomic histogram action으로 묶는다.

```javascript
.createBarMark({ id: "bars" })
.encodeHistogram({
  field: "Displacement",
  maxBins: 10
})
```

`encodeHistogram`은 bin/count/stack을 다시 구현하지 않고 기존 wrapped child
action을 순서대로 호출한다.

## 진행 상태

- [x] `encodeHistogram` API와 option validation
- [x] `encodeX`/`encodeY` wrapped orchestration
- [x] Default `maxBins: 10`, `stack: "zero"`
- [x] Target/coordinate/xScale/yScale forwarding
- [x] Nested trace와 immutability
- [x] Explicit encoding 결과와 동일성 검증
- [x] `carsHistogramActions` progression
- [x] Acceptance와 별도 PNG regression
- [x] 영어 Encoding/action/LLM 문서
- [x] 전체 regression, conceptual commit, push

## API

```javascript
encodeHistogram({
  field,
  target?,
  coordinate?,
  maxBins = 10,
  stack = "zero",
  xScale?,
  yScale?
});
```

- `field`는 필수 quantitative field다.
- `target`은 생략하면 current bar mark를 사용한다.
- `coordinate`는 생략하면 기존 coordinate, 이후 `"main"`을 사용한다.
- `maxBins` validation은 `encodeX`가 소유한다.
- `stack` validation은 `encodeY`가 소유한다.
- Scale option validation과 default도 각 child action이 소유한다.
- Unknown aggregate option은 state 변경 전에 거절한다.

## Action 구조

```text
encodeHistogram(...)
├─ encodeX({
│    field,
│    target?,
│    coordinate?,
│    bin: { maxBins },
│    scale: xScale?
│  })
└─ encodeY({
     target?,
     stack,
     scale: yScale?
   })
```

`encodeY`는 x field를 다시 전달받지 않고 저장된 binned x field를 추론한다.
Aggregate는 histogram child action의 documented default인 `"count"`다.

## Thin aggregate 원칙

`encodeHistogram`은 다음을 직접 수행하지 않는다.

- Dataset field validation
- Bin boundary와 count 계산
- Semantic property edit
- Scale creation/resolution
- Rect materialization

이 책임은 이미 검증된 `encodeX`, `encodeY`, `rematerializeBarMark`에 남긴다. 따라서
child action의 default, 오류, rematerialization 개선은 aggregate에도 자동 적용된다.

## Progression program

Explicit encoding progression은 그대로 보존한다.

```text
carsHistogramEncodings.js
createBarMark -> encodeX -> encodeY
```

이를 복사한 새 action progression에서 두 호출만 교체한다.

```text
carsHistogramActions.js
createBarMark -> encodeHistogram
```

Raw color, grid, axes, legend, title block은 유지한다. 두 progression의
semanticSpec, resolved scales, graphical objects와 Canvas draw calls는 같아야 한다.

## 구현 순서

1. Aggregate option vocabulary를 정의한다.
2. Optional option을 undefined 없이 child args로 전달한다.
3. `encodeX` 이후 반환 program에서 `encodeY`를 호출한다.
4. Unit test로 defaults, forwarding, trace, validation, immutability를 검증한다.
5. `carsHistogramEncodings`를 복사해 `carsHistogramActions`를 만든다.
6. Explicit x/y action을 `encodeHistogram` 하나로 교체한다.
7. Acceptance에서 두 progression의 state/render 결과가 같은지 검증한다.
8. 별도 2× PNG를 생성하고 직접 확인한다.
9. Public/LLM 문서와 전체 regression을 갱신한다.

## 제외 범위

- Public bar `encodeColor`
- Raw color/rect edits 제거
- Histogram legend
- Axes/grid/title high-level action 변경
- 새로운 bin/count/materialization 알고리즘

## 완료 조건

- `createBarMark().encodeHistogram({ field })`가 renderable histogram을 만든다.
- Trace의 direct children은 `encodeX`, `encodeY`다.
- Explicit encoding progression과 semantic/resolved/graphic 결과가 같다.
- `carsHistogramEncodings` program/test/PNG가 보존된다.
- `carsHistogramActions`가 별도 acceptance/PNG를 가진다.
- 기존 point/line encodings와 Phase 1/2 결과가 유지된다.
- 관련 public/LLM 문서와 test가 통과한다.
- 변경이 하나의 conceptual commit으로 push된다.

## 검증 결과

- Unit/acceptance: 244 tests passed
- PNG regression: 8 tests passed
- `encodeHistogram` direct children: `encodeX`, `encodeY`
- Explicit/atomic progression의 semanticSpec, resolvedScales, graphicSpec 일치
- 신규 output: `test/output/cars-histogram-actions.png` (2×, 864×920)
- 직접 확인: explicit progression과 동일한 stacked histogram layout
