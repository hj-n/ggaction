# STEP 7 — Immutable Facet Child Derivation

## 진행 상태

- [ ] Complete preflight before mutation
- [ ] Filtered immutable dataset revision per cell
- [ ] Affected layer rebind
- [ ] Shared-domain scale/mark/guide rematerialization
- [ ] Base program과 caller rows immutability

각 child는 source dataset을 보존한 채 namespaced filtered revision을 추가하고 affected layers를 명시적으로
rebind한다. Meaningful state transition과 rematerialization은 wrapped action hierarchy에 남긴다.

