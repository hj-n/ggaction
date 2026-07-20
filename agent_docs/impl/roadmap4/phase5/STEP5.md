# Step 5 — Binned `createHeatmap`

## 진행 상태

- [ ] pre-gridded/binned discriminated options validation
- [ ] generated data ID와 wrapped child hierarchy
- [ ] x/x2/y/y2/count color materialization
- [ ] inference, ambiguity와 error attribution
- [ ] primitive/public semantic and graphic parity
- [ ] P5-D Browser/PNG와 사용자 승인

Facade는 `createBin2DData`의 숫자 로직을 복제하지 않는다. `bin` 생략 시 현재 pre-gridded 동작과 오류를
그대로 보존한다.
