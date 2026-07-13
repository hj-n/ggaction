# Phase 6 — Step 10: Public Vertical Slice and Cleanup

## 목표

같은 final action chain을 browser example, acceptance, PNG, tutorial에 연결하고 Density
Area chart cycle과 Phase 6를 정리한다.

## 진행 상태

- [ ] Browser `index.html`/`main.js` example
- [ ] Logical Canvas dimensions와 page status
- [ ] Browser console warning/error verification
- [ ] Public/primitive 2× PNG physical dimensions
- [ ] Ink와 three Origin colors regression
- [ ] Density tutorial과 concise recipe
- [ ] Data/area/encoding/legend/guide API pages
- [ ] Action reference, supported features, navigation, `llms.txt`
- [ ] Intermediate program/snapshot cleanup
- [ ] Coverage, full CI, all representative PNG regression
- [ ] Chart/Phase final-state update
- [ ] Final conceptual commits와 push

## Public vertical slice

다음 결과는 `examples/cars-density-area/program.js`의 동일한 action flow를 사용한다.

- Browser example
- Standalone program
- Acceptance test
- Tutorial

Primitive baseline은 extension-level executable oracle로 보존한다. Implementation 단계별
temporary public program은 남기지 않는다.

## 최종 검증

- Browser Canvas는 `720×500`, console/page error는 0건이다.
- PNG는 default pixel ratio 2에서 `1440×1000`이다.
- 세 Origin path와 top legend가 보이고 title/subtitle/legend/plot이 겹치지 않는다.
- Renderer는 `graphicSpec`만 전달받아 같은 output을 그린다.
- General, acceptance, docs, coverage threshold와 기존 모든 chart PNG가 통과한다.
- `GOAL.md`, 이 STEP과 chart contract에 실제 결과/cardinality/coverage를 기록한다.
