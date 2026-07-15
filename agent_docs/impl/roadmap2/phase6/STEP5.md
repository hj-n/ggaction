# Roadmap 2 — Phase 6 Step 5: Interval Data and Vertical Error Bar

## 목표

Approved baseline을 immutable interval summary와 composite `createErrorBar` public flow로 구현한다.

## 진행 상태

- [x] Pure interval grammar for mean/median and stderr/stdev/CI/IQR
- [x] Independent numeric fixtures, missing/sample-size and ordering coverage
- [x] Interval transform schema, provenance and owned concrete rows
- [x] `createIntervalData` wrapped create/materialize hierarchy
- [x] Default/inferred `createErrorBar` owner, source, grouping and orientation
- [x] Explicit target, current eligible layer and unique eligible layer source resolution
- [x] Omitted x/y/data/coordinate/scale reuse from any compatible encoded mark
- [x] Ambiguous source and ambiguous two-quantitative-axis rejection
- [x] Main rule and fixed-span cap child hierarchy
- [x] Default appearance assignments and guide-title inference
- [x] Canvas/scale rematerialization and atomic failure
- [x] Baseline primitive/public exact equivalence and `user-facing.png`
- [x] Types, contracts, conceptual commit and push

## Important hierarchy

`createErrorBar` must call `createIntervalData`, `createRuleMark`, position endpoint actions and all appearance actions
as wrapped children. It may orchestrate cap fixed-span materialization but may not duplicate child validation or write
final semantic/graphic branches directly.

## 완료 조건

The shortest canonical chain without ID/data/group/statistic/style options exactly matches Gate B. The no-option
layered chain after an eligible x/y-encoded mark exactly matches Gate B.1.
