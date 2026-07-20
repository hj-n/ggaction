# Step 3 — Coordinate, encoding과 dimension scales

## 진행 상태

- [x] `parallel` coordinate vocabulary/schema/selectors
- [x] normalized ordered dimension definition과 atomic `encodeParallelCoordinates`
- [x] namespaced dimension scale create/edit/rematerialization plan
- [x] trace, structural copy, ambiguity와 invalid-state regression

`dimensions`는 coordinate와 encoding에 중복 저장하지 않는다. 모든 validation을 preflight한 후 wrapped semantic/scale
actions를 호출하며 rejected call은 partial coordinate, layer, scale 또는 trace를 남기지 않는다.
