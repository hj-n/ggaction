# STEP 7 — Immutable Child-Program State

## 진행 상태

- [ ] Canonical `children`과 `compositionSpec` state
- [ ] Constructor, clone, ownership과 freeze invariants
- [ ] Unit/composition parent capability guard
- [ ] Original child와 earlier parent immutability coverage

Ordinary unit program은 empty children과 absent composition intent를 유지한다. Composition parent만 ordered
child IDs와 layout intent를 소유하며 child semantic state를 merge하지 않는다.

