# Roadmap 2 — Phase 5 Step 4: Directional Grid Editing

## 목표

Existing horizontal/vertical grid를 stable binding을 보존한 채 부분 수정하는 direct actions를 구현한다.

## 진행 상태

- [ ] `editHorizontalGrid`와 `editVerticalGrid`
- [ ] Count/values/auto precedence와 mutual exclusion
- [ ] Color/lineWidth/strokeDash partial edits
- [ ] Missing grid, empty/unknown option과 invalid value failures
- [ ] Wrapped directional rematerialization과 trace
- [ ] Canvas/scale edits와 action-order convergence
- [ ] Primitive/public equivalence, types, docs, contracts, commit와 push

## 완료 조건

Grid edits는 scale/coordinate binding을 바꾸지 않고 해당 direction의 concrete lines만 완전히 갱신한다.
