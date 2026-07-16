# Roadmap 2 — Phase 10 Step 4: Transformed Position Public Integration

## 목표

Approved Gate A를 `encodeX`, `encodeY`와 atomic `editScale({ type })`로 재현하고 transformed position consumers를
통합한다.

## 진행 상태

- [ ] Position scale option unions and semantic definitions
- [ ] Log/pow/sqrt/symlog scale materialization
- [ ] Atomic type transition, parameter cleanup and consumer preflight
- [ ] Point/axis/grid rematerialization and authoring-order convergence
- [ ] Primitive/public semantic, graphic, trace, Canvas and pixel equivalence
- [ ] Error, immutability and shared-consumer coverage
- [ ] STEP status, conceptual commits and pushes

## 완료 조건

Gate A public program exactly matches the approved primitive and scale type edits never leave partial state.
