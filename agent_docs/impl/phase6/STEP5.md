# Phase 6 — Step 5: Atomic encodeDensity

## 목표

Density data derivation, target layer data binding, positional encodings와 baseline area를
하나의 atomic `encodeDensity` action으로 묶는다.

## 진행 상태

- [x] Target/source inference와 ambiguity errors
- [x] Derived dataset/output field deterministic naming
- [x] `densityChannel: "y"` default
- [x] Explicit `densityChannel: "x"`
- [x] `createDensityData` wrapped delegation
- [x] Target layer data binding
- [x] Direction-aware `encodeX`/`encodeY`
- [x] Optional `encodeGroup` delegation
- [x] Final `rematerializeAreaMark`
- [x] Shortest call, trace, order, docs, full regression, commit, push

## Action hierarchy

```text
encodeDensity
├─ createDensityData
├─ editSemantic(layer data binding)
├─ encodeX
├─ encodeY
├─ encodeGroup?
└─ rematerializeAreaMark
```

`encodeDensity`는 계산, field validation, scale validation을 복제하지 않는다. 각 child가
자신의 책임을 소유하고 aggregate는 target, output mapping과 호출 순서만 결정한다.

## Inference와 defaults

- Target: current eligible area 또는 유일한 area.
- Source: explicit source, 아니면 target area가 현재 참조하는 dataset.
- Derived ID: `${target}DensityData`.
- Output fields: `${field}_value`, `${field}_density`.
- Density channel: y.
- Steps: 100.
- Extent: shared source extent.
- Bandwidth: explicit value 또는 density grammar의 automatic result.

Inference 후보가 여러 개이면 첫 번째를 고르지 않고 explicit target/source를 요구한다.

## Atomicity 검증

- Earlier program에는 source-bound empty area가 그대로 남는다.
- Result program에서만 layer가 derived dataset을 참조한다.
- Trace direct children은 계약 순서와 같다.
- Encoding 중간 상태를 외부에 반환하지 않는다.
- Target에 기존 conflicting positional/group encoding이 있으면 변경 전에 오류다.

## 구현 결과

- Shortest call은 current area와 그 source dataset을 추론하며 `${target}DensityData`를 만든다.
- Default y-density와 explicit x-density가 동일한 primitive materializer를 사용한다.
- Value/density scale policy는 channel 방향과 함께 이동하며 explicit option이 default를 덮어쓴다.
- Direct child trace는 계약의 순서를 그대로 보존한다.
- 전체 385개 테스트와 coverage gate를 통과했다 (`lines 94.39%`, `branches 89.49%`, `functions 98.52%`).
