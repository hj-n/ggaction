# Roadmap 2 — Phase 4 Step 5: Density Vocabulary and Editing

## 목표

네 density kernels, 두 normalization modes와 immutable `editDensity`를 구현한다.

## 진행 상태

- [ ] Shared kernel/normalization validation grammar
- [ ] `createDensityData`와 `encodeDensity` forwarding/provenance
- [ ] `editDensity` deterministic revision ID
- [ ] Explicit consumer rebind와 orphan release
- [ ] Complete materialization plan
- [ ] Formula/default/boundary/invalid coverage
- [ ] Atomic failure와 earlier-program immutability
- [ ] Primitive/public equivalence와 user-facing PNG
- [ ] Types, docs, contracts, commit와 push

## 완료 조건

Density changes never mutate a source/old derived dataset and every affected consumer is current after the action.
