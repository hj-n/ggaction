# Roadmap 2 — Phase 4 Step 3: Area and Regression Component Editing

## 목표

Gate A target을 `createAreaMark`/`createRegressionBand` outline과 stable component edit actions로 구현한다.

## 진행 상태

- [ ] Shared area appearance validation/config
- [ ] `createAreaMark`와 `createRegressionBand` outline
- [ ] `editAreaMark` create/replace/remove outline
- [ ] `editRegressionBand` wrapped area edit
- [ ] `editRegressionLine` wrapped line edit
- [ ] Target inference/ambiguity와 incompatible fill coverage
- [ ] Earlier-program immutability와 trace hierarchy
- [ ] Primitive/public exact equivalence와 user-facing PNG
- [ ] Types, docs, contracts, commit와 push

## 완료 조건

Appearance edits preserve semantic bindings and rematerialize only affected component consumers.
