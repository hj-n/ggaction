# Roadmap 3 Planned Polar contracts

Gate A에서 승인된 Phase 2~5 계약이다. Public angle unit은 degree이며 renderer는 Polar semantics를 읽지 않는다.

## Polar position actions

```typescript
encodeTheta({ target?, field, fieldType?, scale? }): ChartProgram;
encodeR({ target?, field, fieldType?: "quantitative", scale? }): ChartProgram;
encodePointRadius({ target?, value: NonNegativeFinite }): ChartProgram;
```

- `encodePointRadius`는 current glyph-size `encodeRadius`의 additive alias다. Semantic radial position은
  `encodeR`이 stored `radius` channel에 기록한다.
- Theta default는 0°=12시, clockwise, range `[0, 360]`; explicit span은 absolute `<= 360`이다.
- Auto radial range는 `[0, min(plotWidth, plotHeight) / 2]`이고 explicit range는 logical Canvas pixels다.
- First position action creates or reuses one unambiguous Polar coordinate. Cartesian x/y와 혼합하지 않는다.
- `encodeTheta → encodeR`과 reverse order는 같은 final state를 만든다. Incomplete one-channel point는
  semantic/config를 보존하지만 visible geometry를 만들지 않는다.
- Concrete point items store only final Cartesian x/y and ordinary shape graphics.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 2.

## Polar guide actions

```text
createThetaAxis         createRadialAxis
createThetaGrid         createRadialGrid
editThetaAxisLine       editRadialAxisLine
editThetaAxisTicks      editRadialAxisTicks
editThetaAxisLabels     editRadialAxisLabels
editThetaAxisTitle      editRadialAxisTitle
editThetaGrid           editRadialGrid
```

- Theta axis owns outer baseline/ticks/labels; radial axis owns center-to-edge components.
- Theta grid materializes spokes and radial grid concentric circles.
- `createAxes`/`createGuides` dispatch by stored coordinate type.
- Concrete guides use existing path, line and text schemas only.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 3.

## Polar line radar

```text
createLineMark/editLineMark: closed?: boolean
```

- Polar line series sort deterministically by theta domain and map every theta/radius pair before path creation.
- `closed: true` emits the radar closing command. First Polar line slice accepts only linear curve.
- Full-circle seam, duplicate angle, short series and reverse have independent geometry fixtures.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 4.

## Arc actions

```typescript
createArcMark({ id?, data?, innerRadius?, padAngle?, fill?, opacity?, stroke?, strokeWidth? }): ChartProgram;
editArcMark({ target?, innerRadius?, padAngle?, fill?, opacity?, stroke?, strokeWidth? }): ChartProgram;
encodeTheta2({ target?, field?, datum?, fieldType?, scale?, coordinate? }): ChartProgram;
encodeR2({ target?, field?, datum?, fieldType?, scale?, coordinate? }): ChartProgram;
```

- Arc is a distinct semantic mark. Existing bar semantics are not changed by coordinate type.
- Secondary endpoints share the primary channel scale and coordinate and use assignment/reassignment lifecycle.
- Pie/donut use normalized theta with inner radius; radial bar uses ordinal theta band and quantitative radial extent.
- Concrete sectors are backend-neutral command paths.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 5.

## Arc selection highlight

- Arc items expose one stable final semantic item per sector and support the current select/filter/highlight grammar.
- Bounds, attachment and bring-to-front behavior use the shared mark-selection policy boundary.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 5.
