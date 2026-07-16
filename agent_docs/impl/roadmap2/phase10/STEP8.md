# Roadmap 2 — Phase 10 Step 8: Discretized Color and Interval Legends

## 목표

Quantize, quantile and threshold scales를 appearance consumers와 inferred interval legends에 통합한다.

## 진행 상태

- [x] Type-specific domain/range resolution and mapping
- [x] Concrete interval labels and legend symbols
- [x] Point consumer and shared scale compatibility
- [x] Reverse and invalid threshold coverage
- [x] Gate C exact public equivalence
- [x] STEP status, conceptual commits and pushes

`unknown` mapping remains in STEP11 with the shared cross-scale mapping-policy matrix.

## 완료 조건

All discretized color types produce deterministic classes, legends and rematerialization without renderer inference.
