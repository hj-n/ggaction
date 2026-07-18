# STEP 7 — Immutable Facet Child Derivation

## 진행 상태

- [x] Complete preflight before mutation
- [x] Filtered immutable dataset revision per cell
- [x] Affected layer rebind
- [x] Shared-domain scale/mark/guide rematerialization
- [x] Base program과 caller rows immutability

각 child는 source dataset을 보존한 채 namespaced filtered revision을 추가하고 affected layers를 명시적으로
rebind한다. Meaningful state transition과 rematerialization은 wrapped action hierarchy에 남긴다.

Point와 complete histogram/aggregate bar만 첫 slice source로 허용한다. Histogram child는 parent template에서
한 번 결정한 bin boundary를 공유하고, 각 cell count에서 얻은 union y domain을 사용한다. Ordinal scale은
full direct source의 first-appearance domain을 공유한다.
