# STEP 9 — Layout Edit, Replacement and Public Surface

## 진행 상태

- [x] `editCompositionLayout`
- [x] `replaceCompositionChild`
- [x] Atomic relayout과 slot preservation
- [x] Default/extension/PNG exports와 exact TypeScript
- [x] Current contracts, examples, docs와 gallery pair

Layout edit는 children을 보존하고 replacement는 target slot identity와 order를 보존한다. 두 action 모두
existing graphic snapshot을 부분 수정하지 않고 canonical child state에서 전체 composition을 다시 materialize한다.
