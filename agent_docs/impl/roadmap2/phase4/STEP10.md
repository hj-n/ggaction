# Roadmap 2 — Phase 4 Step 10: Integration and Closeout

## 목표

Phase 4 전체 surface를 통합 검증하고 accepted planned contracts를 current behavior로 승격한다.

## 진행 상태

- [x] Full action/parameter/error matrix
- [x] Selector ambiguity와 action-order convergence
- [x] Derived revision ownership/orphan release
- [x] Materialization-plan order/dedup/failure injection
- [x] Canvas resize와 browser/PNG parity
- [x] Examples, tutorials, API/reference/LLM docs
- [x] Action index/catalog와 contract promotion
- [x] Architecture update 필요성 검토
- [x] Full local/remote CI
- [x] Phase/Roadmap status, cleanup, commit와 push

## 통합 검증 결과

### Action, parameter와 failure matrix

- Area는 create-time outline과 `editAreaMark`의 create/replace/remove, invalid appearance, encoded fill conflict,
  target inference/ambiguity와 earlier-program immutability를 검증한다.
- Density는 4개 kernel, `unit | count`, bandwidth/extent/steps 경계, horizontal/vertical orientation,
  grouped/ungrouped 계산과 invalid/ambiguous edit를 검증한다.
- Filter는 `oneOf | predicate | range`, 모든 comparison operator, inclusive/exclusive boundary, string/number
  compatibility, mutually exclusive mode와 atomic failure를 검증한다.
- Regression은 linear/polynomial/LOESS, degree/span, mean/prediction interval, optional band, grouped/ungrouped
  inference, component edit와 invalid method-specific 조합을 검증한다.

각 statistical transform은 production helper와 독립된 reference fixture 및 monotonicity, interval containment,
non-negativity, group order 같은 invariants로 검증한다.

### Selector, revision과 materialization

- Explicit/current/unique selector는 성공하고 missing/ambiguous target은 state 변경 전에 실패한다.
- `editDensity`는 deterministic revision ID를 만들고 selected consumer만 rebind한다. 이전 revision은 다른
  consumer가 참조하면 유지하고 orphan일 때만 `releaseDerivedData`로 제거한다.
- Density revision과 Canvas resize를 반대 순서로 실행해도 semantic state, resolved scales와 final
  `graphicSpec`이 수렴한다.
- Ordered materialization plan은 duplicate step을 제거하면서 순서를 유지한다. Injected mid-plan failure는
  이후 step을 실행하지 않으며 input program을 변경하지 않는다.
- Canvas resize는 point/area/line, scales, axes, grids와 legends를 현재 dependency state로 다시 만든다.

### Visual, docs와 contracts

- Phase 4의 12개 variant는 모두 independent primitive/public program, executable call-chain metadata와 exact
  decoded-pixel parity를 가진다.
- Canonical examples, tutorials, API pages, action reference, supported-features page와 generated LLM docs를
  audit했다. 모든 implemented Phase 4 parameter와 limitation이 current behavior와 일치한다.
- `ACTION_INDEX.json`과 generated catalog에서 Phase 4 direct actions는 current이며 accepted Phase 4 capability는
  planned 목록에 남아 있지 않다.
- `SECOND_ARCHITECTURE.md`의 derived-transform 목록을 polynomial/LOESS와 mean/prediction interval까지 포함하도록
  현재 구현에 맞췄다. Module ownership이나 state/materialization boundary 변화는 없어 추가 구조 개정은 없다.

## 검증 명령과 결과

- `npm test`: 707 passed
- `npm run test:coverage`: line 95.01%, branch 90.98%, functions 98.47%
- `npm run test:render`: 230 passed, 46개 Roadmap 2 variant gallery의 primitive/public pair와 displayed call chain 검증
- `npm run contracts:catalog:check`, `npm run docs:images`, `npm run docs:llms`: generated artifact freshness 통과
- Remote CI: test, coverage, Jekyll build, built-link/asset 검사, desktop/mobile docs와 PNG gallery 통과

## 완료 조건

All Phase 4 variants are approved primitive/public pairs and no accepted Phase 4 contract remains planned.
