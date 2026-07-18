# STEP 8 — Public Derived Replay and Scale Resolution

## 진행 상태

- [x] Transform replay registry
- [x] Wrapped `replayDerivedData` and `rebindLayerData`
- [x] Channel resolution application
- [x] Deterministic cell rematerialization plan
- [x] Primitive/public exact equivalence

Approved Gate I-A behavior를 `facet`에 연결한다. Replay registry dispatches existing wrapped data materializers;
it does not duplicate statistical grammar. Layer rebind is one explicit wrapped action so the trace records the
dependency transition.

Scale, mark and each-cell guide rematerialization uses one deduplicated ordered plan. Earlier base/children and caller
options remain immutable.
