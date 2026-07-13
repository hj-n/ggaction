# Phase 5 — Step 7: Area Mark and Ranged Encoding

## 목표

Confidence band를 semantic area mark와 grouped closed paths로 materialize한다.

## 진행 상태

- [x] `createAreaMark`
- [x] Advanced `encodeY2`
- [x] Atomic `encodeYRange`
- [x] Advanced `encodeGroup`
- [x] Shared x/y scale domain across y and y2
- [x] Group별 closed filled area path materialization
- [x] Fill/opacity appearance options
- [x] Canvas/scale rematerialization consumers
- [x] Trace, invalid-state, primitive equivalence tests
- [x] Mark/encoding documentation, commit, push

## Action hierarchy

```text
encodeYRange
├─ encodeY
└─ encodeY2
```

`encodeGroup`은 path 분리만 정의하며 scale과 guide를 만들지 않는다.
