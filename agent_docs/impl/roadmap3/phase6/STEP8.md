# STEP 8 — Public Concat Operations

## 진행 상태

- [ ] Package-level `hconcat`
- [ ] Package-level `vconcat`
- [ ] Child resolution, ID validation과 complete preflight
- [ ] Wrapped `useProgram`/materialization trace hierarchy
- [ ] Nested composition materialization

Package operation은 blank parent를 만들고 meaningful wrapped operations로 retained children과 final snapshot을
기록한다. 최소 두 program, duplicate IDs와 incomplete child는 state change 전에 거부한다.

