# STEP 2 — Gradient Plot Data and Position-role Revision

## 진행 상태

- [x] Gradient owner, source, profile/body/center ownership mapping
- [x] Complete data/x/y role and consumer preflight
- [x] Immutable profile revision and component rebind
- [x] Vertical/horizontal scale and guide handoff
- [x] Contract/type/docs synchronization and cumulative verification
- [x] Gate evidence/commit/push

## 실행 순서

1. Stable gradient owner, raw source/profile provenance, strip body/optional center와 x/y scale/axis/grid/density-legend
   ownership을 mapping한다.
2. Omitted `data`, `x`, `y`를 current owner provenance에서 보존하고 create-time channel vocabulary로 normalized complete
   candidate를 만든 뒤 source field/type/role compatibility를 preflight한다.
3. New immutable profile revision을 raw source에서 만들고 body/center consumer를 explicit rebind한다.
4. Stable owner/component/coordinate를 유지하며 orientation, position scales, axes/grid, density legend와
   selection/highlight를 current final category-strip items에서 다시 materialize한다.
5. Current contracts, declarations, inventory, public docs와 generated references를 동기화하고 focused부터 cumulative,
   coverage, Canvas/PNG/Browser와 packed consumer 순서로 검증한다.

## Gate evidence

구현 완료 뒤 exact public calls/source/state/trace/test/compatibility 결과와 remote commit을
[`GATE_A.md`](./GATE_A.md)에 기록한다.
