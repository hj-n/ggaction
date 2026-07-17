# STEP 1 — Phase Contract and Targets

## 진행 상태

- [x] Existing line/Polar ownership boundary 확인
- [x] Additive `closed?: boolean` 계약 확정
- [x] Open continuous-theta target 확정
- [x] Closed categorical-theta target 확정
- [x] Gate 전 public/runtime boundary 명시

Phase 4는 line series derivation과 path materialization만 확장한다. Polar coordinate, theta/radius scales,
axes/grids, categorical legend와 Canvas renderer는 existing capability를 재사용한다. Radar를 별도 mark나 action으로
만들지 않으며 `closed: true`인 Polar line으로 표현한다.
