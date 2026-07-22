# STEP 1 — Box Plot Data and Position-role Revision

## 진행 상태

- [ ] Box owner, source, summary/outlier and component ownership mapping
- [ ] Complete data/x/y role and consumer preflight
- [ ] Immutable summary/outlier revisions and component rebind
- [ ] Vertical/horizontal scale and guide handoff
- [ ] Selection/highlight, trace, atomicity and immutability tests

## 실행 순서

1. Stable box owner, raw source provenance, summary/outlier revision, body/whisker/cap/median/outlier consumer와
   x/y scale/guide ownership을 mapping한다.
2. Omitted `data`, `x`, `y`를 current owner provenance에서 보존하고 complete candidate가 exactly one categorical와
   one quantitative role인지 첫 child action 전에 검증한다.
3. New summary와 applicable outlier revision을 만들고 all owned visual consumer를 explicit rebind한다.
4. Orientation과 position scale/axis/grid binding을 complete candidate로 교체하고 stored appearance/statistical intent 및
   selection/highlight를 deterministic하게 replay한 뒤 orphan prior revisions를 release한다.
5. Partial role, source-only, vertical↔horizontal, missing/ambiguous/incompatible field, downstream failure와
   earlier-program/source/caller immutability를 검증한다.
