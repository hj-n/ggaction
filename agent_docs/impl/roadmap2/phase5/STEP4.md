# Roadmap 2 — Phase 5 Step 4: Directional Grid Editing

## 목표

Existing horizontal/vertical grid를 stable binding을 보존한 채 부분 수정하는 direct actions를 구현한다.

## 진행 상태

- [x] `editHorizontalGrid`와 `editVerticalGrid`
- [x] Count/values/auto precedence와 mutual exclusion
- [x] Color/lineWidth/strokeDash partial edits
- [x] Missing grid, empty/unknown option과 invalid value failures
- [x] Wrapped directional rematerialization과 trace
- [x] Canvas/scale edits와 action-order convergence
- [x] Primitive/public equivalence, types, docs와 contracts
- [x] Conceptual commit와 push

## 구현 결과

- Direction edit는 existing semantic scale/coordinate binding을 유지하고 private tick/style config만 바꾼다.
- `count`, explicit `values`, `values: "auto"`는 각각 count mode, value mode와 current inference restoration을
  명시하며 stale count/value branch를 남기지 않는다.
- 각 edit action은 대응하는 wrapped `rematerializeHorizontalGrid` 또는 `rematerializeVerticalGrid`만 호출해
  concrete collection 전체를 갱신한다.
- Raw `editGraphics` target과 public edit 결과가 정확히 같고 Canvas/scale/edit 순서가 달라도 final state가
  수렴한다.

## 완료 조건

Grid edits는 scale/coordinate binding을 바꾸지 않고 해당 direction의 concrete lines만 완전히 갱신한다.
