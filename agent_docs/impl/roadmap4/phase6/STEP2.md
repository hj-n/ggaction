# Step 2 — Paint primitive, Cars target와 P6-A

## 진행 상태

- [x] shared `FillPaint` validation, normalization과 immutable structural copy
- [x] `editGraphics` string→paint→string 및 paint-as-scalar collection distribution
- [x] final item bounds를 사용하는 rect/bar/area/closed-path Canvas fill adapter
- [x] mock renderer와 Node PNG parity
- [x] explicit primitive Cars gradient plot program
- [x] vertical/horizontal/reversed-scale/hard-stop/multi-stop focused variants
- [x] existing string fill snapshots와 unsupported open-path/stroke validation
- [x] Browser/PNG source와 image를 포함한 P6-A package
- [ ] P6-A 사용자 승인

Primitive target은 public `createGradientPlot`을 호출하지 않고 density/profile expected values와 low-level graphics를
명시적으로 author한다. P6-A 승인 전에는 facade를 구현하지 않는다.

## 실행 순서

1. Shared concrete graphic schema가 string 또는 validated immutable paint object를 하나의 fill 값으로 받게 한다.
2. Primitive editing에서 paint object를 scalar로 보존하고 caller-owned endpoints/stops를 복제한다.
3. Renderer adapter가 각 final item bounds에서 normalized endpoint를 해석하고 draw call 동안만 backend gradient를 만든다.
4. Rect, bar, area와 closed path에 같은 adapter를 연결하고 기존 string path는 그대로 유지한다.
5. Independent profile vector를 low-level `createGraphics`/`editGraphics` chain으로 그린 Cars target을 render한다.

## P6-A review package

- Exact `FillPaint` schema와 public/non-public boundary
- Primitive executable source, semantic/profile fixture, concrete graphic excerpt와 trace
- Cars Browser Canvas/Node PNG, vertical/horizontal/reversed/hard-stop/multi-stop variants
- Focused paint tests와 기존 string fill cumulative regression
- 승인 후에만 Step 3–4의 public GradientPlot owner/facade 구현을 시작한다.
