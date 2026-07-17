# STEP 2 — Deterministic Polar Reference Geometry

## 진행 상태

- [x] Plot center와 available radius fixture
- [x] Degree cardinal-direction fixture
- [x] Continuous theta/radius mapping fixture
- [x] Reverse, explicit range와 invalid-boundary fixture
- [x] Cars와 Fashion deterministic reference values

Reference calculation은 test-owned pure code다. `0°`는 12시, positive degree는 clockwise이며 auto theta range는
`[0, 360]`, auto radial range는 `[0, min(plotWidth, plotHeight) / 2]`다.
