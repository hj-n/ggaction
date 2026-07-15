# Roadmap 2 — Phase 5 Step 9: Integration and Closeout

## 목표

Phase 5 전체 guide/layout surface를 통합 검증하고 accepted contracts를 current behavior로 승격한다.

## 진행 상태

- [x] Full action/parameter/format/layout-error matrix
- [x] Selector ambiguity와 action-order convergence
- [x] Occupied bounds와 same-edge collision policy
- [x] Materialization-plan order/dedup/failure atomicity
- [x] Canvas resize와 browser/PNG parity
- [x] Examples, tutorials, API/reference/LLM docs
- [x] Action index/catalog와 contract promotion
- [x] Architecture update 필요성 검토
- [x] Full local/remote CI
- [x] Phase/Roadmap status, cleanup, commit와 push

## Closeout evidence

- Axis position/format, directional grid edit, left legend와 title layout/edit matrix는
  `test/unit/actions/guides/`의 focused suites와 세 approved variant pair가 검증한다.
- Selector ambiguity, invalid option, insufficient margin와 failed-edit atomicity는 axis/grid/legend/title
  action suites가 검증하고 action-order convergence는 grid, legend, title 및 Canvas integration tests가 검증한다.
- `test/contracts/materialization-plan.test.js`가 plan order와 dedup을 고정하고 actual occupied bounds와
  same-edge collision은 legend/title suites가 concrete graphic 기준으로 검증한다.
- Roadmap 2 gallery의 49 variants는 primitive/public call-chain metadata와 decoded pixel hash를 exact 비교한다.
- `ACTION_INDEX.json`에는 Phase 5 direct action/capability가 Planned로 남아 있지 않으며 contract test가
  이 completed boundary를 기계적으로 고정한다.
- Local verification: 748 tests, 245 render tests, source coverage 95% 이상, docs/catalog freshness 통과.
- Remote verification: CI run `29410299789`의 test, coverage, Jekyll build, built-doc checks와 desktop/mobile
  browser tests 및 Pages deployment run `29410298797`가 성공했다.
- Module ownership이나 state/materialization boundary의 추가 변경은 없으며 Step 8에서
  `SECOND_ARCHITECTURE.md`에 반영한 deterministic text layout이 최종 architecture update다.

## 완료 조건

All Phase 5 variants are approved primitive/public pairs and no accepted Phase 5 contract remains planned.
