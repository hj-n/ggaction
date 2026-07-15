# Roadmap 2 — Phase 7 Step 2: Cars Vertical Primitive

## 목표

Public error-band actions 없이 raw semantic/graphic primitives로 Cars grouped vertical target를 만들고 Gate A에서
형태, layering, opacity와 guides를 승인받는다.

## 진행 상태

- [x] Independent Year × Origin mean/CI expected rows
- [x] Raw derived dataset and area semantic bindings
- [x] Closed grouped y/y2 path geometry
- [x] Origin fills through concrete palette values
- [x] Axes, horizontal grid, legend and title composition
- [x] Variant manifest and exact future call chain
- [x] `cars-vertical/primitive.png` and renderer/browser checks
- [ ] Gate A user confirmation
- [x] STEP status, conceptual commit and push

## Gate A

Primitive trace에는 future `createErrorBand`가 없어야 한다. Three Origin bands의 order, temporal spacing,
CI containment, overlap readability와 no-boundary default를 시각적으로 확인한다. 승인 전에는 corresponding
public program을 구현하지 않는다.

### Gate A candidate

- Artifact: `.artifacts/test/png/roadmap2/cars-error-band/cars-vertical/primitive.png`
- Independent rows: 36 Year × Origin intervals, first-appearance series order `USA → Europe → Japan`
- Scale domains: x `1970-01-01 → 1982-01-01`, y `[-20, 60]`
- Sparse evidence retained: Japan 1979 has `n = 2` and 95% CI `[-8.212409472864, 42.612409472864]`
- Concrete result: three closed linear paths, opacity `0.2`, no boundary paths
- Drawing order: horizontal grid, bands, axes, legend, title
- Trace exclusions: no `createErrorBand`, `createIntervalData`, or `encodeYRange`
- Local evidence: 3 Gate tests, primitive PNG render and 56-variant gallery verification passed

## 완료 조건

Independent numeric rows와 final concrete paths가 일치하고 canonical visual target가 승인된다.
