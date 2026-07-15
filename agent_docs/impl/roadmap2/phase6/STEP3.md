# Roadmap 2 — Phase 6 Step 3: Rule Actions

## 목표

Approved Gate A geometry를 semantic rule mark와 reusable endpoint/appearance assignment actions로 구현한다.

## 진행 상태

- [x] Rule vocabulary, schema, selector eligibility and default `rule` ID
- [x] `createRuleMark` empty line collection and trace
- [x] Field/datum `encodeX`/`encodeY` rule support
- [x] `encodeX2` and rule `encodeY2` support/reassignment
- [x] Full-span/bounded/diagonal rule materializer
- [x] `encodeStroke` and `encodeStrokeWidth`
- [x] Existing `encodeStrokeDash` and `encodeOpacity` rule compatibility
- [x] Canvas/scale/endpoint reassignment materialization plans
- [x] Primitive/public equivalence and `user-facing.png`
- [x] Types, contracts, focused coverage, conceptual commit and push

## Action hierarchy

Rule create owns only semantic identity, data binding and empty graphical structure. Position and appearance remain
independent assignments; reauthoring calls the same encode action and never uses `editRuleMark`.

## 완료 조건

Gate A primitive and public programs converge exactly, including trace-visible wrapped materialization actions.

## 결과

- Public chain은 five semantic rule layers를 생성하고 approved primitive와 exact semantic/graphic parity를 이룬다.
- Scale 또는 Canvas 변경과 endpoint/style reassignment는 wrapped `rematerializeRuleMark`를 통해 concrete
  `line` children을 다시 계산한다.
- Artifact: `.artifacts/test/png/roadmap2/cars-error-bar/rule-geometry/user-facing.png`
