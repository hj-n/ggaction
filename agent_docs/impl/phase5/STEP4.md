# Phase 5 — Step 4: Immutable Data Filtering

## 목표

Source dataset을 수정하지 않고 named derived dataset을 만드는 `filterData`를 구현한다.

## 진행 상태

- [x] Derived dataset semantic paths와 validation
- [x] `createDerivedData` wrapped action
- [x] `materializeFilteredData` wrapped action
- [x] `filterData({ id, source?, field, oneOf })`
- [x] Current dataset inference와 ambiguity errors
- [x] Source/derived values immutability
- [x] Shortest valid call, trace, invalid-state tests
- [x] Data action public documentation
- [x] Primitive/action progression regression
- [x] Commit과 push

## Action hierarchy

```text
filterData
├─ createDerivedData
└─ materializeFilteredData
```

Derived dataset은 source ID, filter transform, materialized values를 저장한다. Source
dataset values는 교체하지 않는다.
