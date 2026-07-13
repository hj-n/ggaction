# Phase 6 — Step 1: Grouped KDE Statistical Contract

## 목표

구현체와 독립된 fixture로 cars `Acceleration`의 Origin별 Gaussian KDE 결과를 먼저
고정한다. Primitive baseline과 이후 density grammar는 fixture를 import하지 않고 같은
rows와 scale inputs를 만들어야 한다.

## 진행 상태

- [ ] 유효 Acceleration/Origin row selection
- [ ] Origin first-appearance domain
- [ ] Gaussian kernel 함수와 normalization
- [ ] Explicit bandwidth `0.6`
- [ ] Shared observed extent
- [ ] Inclusive 100-step uniform sample grid
- [ ] Origin별 density rows와 deterministic order
- [ ] Representative density values와 numerical tolerance
- [ ] Invalid, empty, degenerate, immutable input tests
- [ ] 전체 regression, conceptual commit, push

## 계산 규칙

```text
cars
→ finite Acceleration + non-empty Origin
→ global [min, max] extent
→ 100 inclusive uniform sample values
→ Origin first-appearance groups
→ group별 Gaussian KDE(bandwidth = 0.6)
→ Acceleration_value / Acceleration_density rows
```

각 group의 density 적분은 이론적으로 1에 가까워야 하지만 observed min/max에서 sampling
하므로 numerical integral이 정확히 1일 것을 요구하지 않는다. 대신 대표 sample 값,
non-negative density, group별 peak 위치와 row cardinality를 고정한다.

## 검증 기준

- 모든 group이 동일한 100개 `Acceleration_value`를 사용한다.
- Row order는 Origin domain 순서, 그 안에서 value 오름차순이다.
- Density는 finite, non-negative number다.
- Input array와 nested row를 수정하거나 retain하지 않는다.
- `bandwidth <= 0`, invalid extent, `steps < 2`, 유효 row 없음은 오류다.
- Auto bandwidth는 별도 small fixture에서 positive finite 결과와 deterministic behavior를
  검증한다. 목표 chart의 golden output은 explicit `0.6`만 사용한다.

## 제외 범위

- Semantic/graphic schema 수정
- Area path와 renderer 수정
- Public action 및 docs
