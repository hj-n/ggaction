# Roadmap 2 — Phase 6 Step 3: Rule Actions

## 목표

Approved Gate A geometry를 semantic rule mark와 reusable endpoint/appearance assignment actions로 구현한다.

## 진행 상태

- [ ] Rule vocabulary, schema, selector eligibility and default `rule` ID
- [ ] `createRuleMark` empty line collection and trace
- [ ] Field/datum `encodeX`/`encodeY` rule support
- [ ] `encodeX2` and rule `encodeY2` support/reassignment
- [ ] Full-span/bounded/diagonal rule materializer
- [ ] `encodeStroke` and `encodeStrokeWidth`
- [ ] Existing `encodeStrokeDash` and `encodeOpacity` rule compatibility
- [ ] Canvas/scale/endpoint reassignment materialization plans
- [ ] Primitive/public equivalence and `user-facing.png`
- [ ] Types, contracts, focused coverage, conceptual commit and push

## Action hierarchy

Rule create owns only semantic identity, data binding and empty graphical structure. Position and appearance remain
independent assignments; reauthoring calls the same encode action and never uses `editRuleMark`.

## 완료 조건

Gate A primitive and public programs converge exactly, including trace-visible wrapped materialization actions.
