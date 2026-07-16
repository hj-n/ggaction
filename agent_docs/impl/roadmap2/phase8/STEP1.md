# Roadmap 2 — Phase 8 Step 1: Contract and Baseline Audit

## 목표

Planned box-plot inventory, existing bar/rule/error-bar/range boundaries와 Cars fixtures를 감사해 구현 전
contract와 independent oracle policy를 고정한다.

## 진행 상태

- [x] `createBoxPlot` and box-data Planned inventory audit
- [x] Current bar range, width, rule span and error-bar reuse boundary audit
- [x] Cars MPG Tukey and Horsepower minmax dataset audit
- [x] Quantile, whisker, outlier order and ownership contract
- [x] ID/source/channel/coordinate/scale inference and ambiguity matrix
- [x] Encoding-before-composite and composite-before-encoding convergence contract
- [x] Deterministic child identity and drawing-order contract
- [x] Gate manifests, artifact paths and future call chains
- [x] STEP status, conceptual commit and push

## 핵심 결정

- Canonical partition은 category field 하나이며 `groupBy`는 Phase 8에 포함하지 않는다.
- Quartile은 existing linear `(n - 1) × p` convention을 재사용한다.
- Owner ID는 box body이고 omitted first ID는 `boxPlot`이다.
- New geometry는 ranged bar와 band-width-aware median span에 한정한다.
- Canonical oracle은 production 통계 코드를 import하지 않고 Cars source row를 직접 partition/sort한다.
- Canonical internal fields는 `__boxPlot_q1`, `__boxPlot_median`, `__boxPlot_q3`,
  `__boxPlot_lowerWhisker`, `__boxPlot_upperWhisker`, fence와 count이다.
- Gate A의 independent result는 category `USA → Japan → Europe`, summary count `249/79/70`, outlier
  count `3/1/6`, source index `[251,316,329,332,333,337,351,386,395,402]`이다.
- Current bar materialization은 histogram/aggregate grain만 지원하며 ranged rect는 STEP3 확장 대상이다.
  Rule fixed span과 explicit error-bar cap은 재사용 가능하지만 median은 concrete box 폭 consumer가 필요하다.
- Gate artifact owner는 `test/gates/cars-box-plot/variants/manifest.js`, output은
  `.artifacts/test/png/roadmap2/cars-box-plot/cars-vertical-tukey/primitive.png`이다.

## 완료 조건

Public contract, numeric oracle, component ownership, reuse boundary와 three visual Gates가 implementation 전에
모호하지 않다.
