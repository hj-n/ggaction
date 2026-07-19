# STEP 2 — Core Program State

## 진행 상태

- [x] Composition state validation을 pure owner로 분리
- [x] Materialization config structural transition을 pure owner로 분리
- [x] Context/resolved-scale transition과 class facade 책임 정리
- [x] Subclass-preserving clone, ownership과 trace invariants 유지
- [x] Focused core/immutability/action tests와 full normal suite 통과

`ChartProgram`은 observable state와 private method contract를 유지한다. 이 STEP은 schema를 바꾸지 않고
constructor validation과 state transition의 module ownership만 정리한다.

## 결과

- `ChartProgram`은 public/private facade와 immutable transition 연결만 소유한다.
- program state, child ownership, composition validation, materialization-config transition은 각각의 pure owner가 담당한다.
- 기존 schema, subclass-preserving clone, action trace와 오류 계약은 유지했다.
- focused core/composition tests 46개와 normal suite 1,541개가 통과했다.
