# Roadmap 2 — Phase 4 Step 9: Regression Methods and Prediction Interval

## 목표

Polynomial/LOESS fitting, prediction interval과 optional regression band를 public regression hierarchy에 구현한다.

## 진행 상태

- [ ] Shared method/parameter validation
- [ ] Stable polynomial least-squares grammar
- [ ] Deterministic LOESS grammar
- [ ] Mean/prediction interval calculation
- [ ] `createRegressionData` provenance
- [ ] `createRegression` band policy와 forwarding
- [ ] Singular/minimum-row/boundary/invalid coverage
- [ ] Primitive/public equivalence와 user-facing PNG
- [ ] Types, docs, contracts, commit와 push

## 완료 조건

Method-specific parameters, band policy and result provenance are exact, atomic and trace-visible.
