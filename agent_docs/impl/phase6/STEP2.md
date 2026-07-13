# Phase 6 — Step 2: Primitive Density Area Baseline

## 목표

기존 stable actions와 low-level primitives만으로 완전한 density area chart를 작성해 이후
public action program의 executable graphical oracle로 사용한다.

## 진행 상태

- [ ] Density fixture를 이용한 concrete chart values
- [ ] Derived dataset semantic provenance
- [ ] Area x/y/group/color semantic contract
- [ ] Origin별 baseline-closed path
- [ ] Shared x/y/color scales
- [ ] Raw axes와 horizontal grid
- [ ] Top three-column swatch legend
- [ ] Title/subtitle와 explicit graphical order
- [ ] Acceptance, graphicSpec-only rendering, immutability
- [ ] 2× PNG 직접 확인, full regression, commit, push

## Primitive program 원칙

- `createCanvas`, `createData`와 현재 재사용 가능한 action은 사용한다.
- 아직 없는 density transform, baseline area, top legend만 `editSemantic`,
  `createGraphics`, `editGraphics`의 한 chain으로 작성한다.
- Fixture는 expected values를 제공하지만 primitive program 내부에서 raw action 호출을
  batching helper로 숨기지 않는다.
- Renderer가 `semanticSpec`, context, trace 없이 `graphicSpec`만으로 그릴 수 있어야 한다.

## 목표 graphical order

```text
canvas
→ horizontalGridLines
→ densities
→ x/y axes
→ color legend swatches/labels/title
→ chart title/subtitle
```

## 검증 기준

- `densities`는 Origin cardinality와 같은 path child 수를 가진다.
- 각 child points는 `steps + 2`개이고 `closed: true`다.
- 첫 점과 마지막 점은 density zero baseline에 있다.
- Paths, axes, grid, legend가 같은 resolved scale/domain을 사용한다.
- 2× PNG는 logical size의 정확히 두 배이고 세 tableau10 색과 충분한 ink를 포함한다.
