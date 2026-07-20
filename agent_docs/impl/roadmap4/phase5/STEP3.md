# Step 3 — `createWindowData` vertical slice

## 진행 상태

- [x] schema/validation과 pure window grammar
- [x] transform registry와 immutable action
- [x] duplicate rejection, source inference와 facet replay
- [x] trace, runtime export, declarations와 package smoke
- [x] Window oracle parity와 error attribution
- [ ] P5-B 사용자 승인

Production 구현은 P5-A 승인 뒤 시작한다. Operation별로 action을 늘리지 않고 한 ordered `operations`
contract가 순차 dependency를 소유한다. `createWindowData`는 immutable create-only이며 revision/rebind는
이번 Step 범위가 아니다.
