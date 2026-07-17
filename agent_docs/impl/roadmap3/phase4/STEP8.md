# STEP 8 — Integration and Rematerialization

## 진행 상태

- [ ] `encodeTheta`/`encodeR` line targeting and order independence
- [ ] Continuous/categorical/reversed scale coverage
- [ ] Group, color, strokeDash and legend integration
- [ ] Polar axes/grid compatibility
- [ ] Canvas, scale, data and highlight rematerialization

하나의 Polar position encoding만 있는 incomplete line은 semantic으로 보존하되 visible path를 만들지 않는다.
두 번째 compatible encoding이 들어오면 complete path를 materialize한다.
