# Step 5 — Binned `createHeatmap`

## 진행 상태

- [x] pre-gridded/binned discriminated options validation
- [x] generated data ID와 wrapped child hierarchy
- [x] x/x2/y/y2/count color materialization
- [x] inference, ambiguity와 error attribution
- [x] primitive/public semantic and graphic parity
- [x] P5-D Browser/PNG 검증
- [ ] P5-D 사용자 승인

Facade는 `createBin2DData`의 숫자 로직을 복제하지 않는다. `bin` 생략 시 현재 pre-gridded 동작과 오류를
그대로 보존한다.
