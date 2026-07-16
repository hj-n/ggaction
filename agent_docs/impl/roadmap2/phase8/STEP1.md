# Roadmap 2 — Phase 8 Step 1: Contract and Baseline Audit

## 목표

Planned box-plot inventory, existing bar/rule/error-bar/range boundaries와 Cars fixtures를 감사해 구현 전
contract와 independent oracle policy를 고정한다.

## 진행 상태

- [ ] `createBoxPlot` and box-data Planned inventory audit
- [ ] Current bar range, width, rule span and error-bar reuse boundary audit
- [ ] Cars MPG Tukey and Horsepower minmax dataset audit
- [ ] Quantile, whisker, outlier order and ownership contract
- [ ] ID/source/channel/coordinate/scale inference and ambiguity matrix
- [ ] Encoding-before-composite and composite-before-encoding convergence contract
- [ ] Deterministic child identity and drawing-order contract
- [ ] Gate manifests, artifact paths and future call chains
- [ ] STEP status, conceptual commit and push

## 핵심 결정

- Canonical partition은 category field 하나이며 `groupBy`는 Phase 8에 포함하지 않는다.
- Quartile은 existing linear `(n - 1) × p` convention을 재사용한다.
- Owner ID는 box body이고 omitted first ID는 `boxPlot`이다.
- New geometry는 ranged bar와 band-width-aware median span에 한정한다.

## 완료 조건

Public contract, numeric oracle, component ownership, reuse boundary와 three visual Gates가 implementation 전에
모호하지 않다.
