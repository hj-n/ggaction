# Roadmap 2 — Phase 11 Step 2: Graphic-Tree Contracts

## 목표

Named ownership, sibling placement, tree validity, stable identity와 primitive/public equivalence를 shared executable
contracts로 정의한다.

## 진행 상태

- [x] Canvas, plot, mark, guide and chart-layout ownership matrix
- [x] Stable system ID and user-ID collision policy
- [x] Reachability, unique attachment and cycle/orphan validation
- [x] Local sibling-order and depth-first draw-order contract
- [x] Named `children` versus repeated drawable `items` contract
- [x] Extension top-level graphic compatibility contract
- [x] Tree-aware vertical-slice equivalence assertion
- [x] Immutable attachment/subtree structural-copy fixtures
- [x] STEP status, conceptual commit and push

## 확정 계약

- `canvas`와 `plot-main`은 ordinary chart program당 하나인 stable system graphic ID다. User resource가 같은 ID를
  요청하면 existing global graphic identity와 충돌하므로 silent rename 없이 clear conflict를 낸다.
- `graphicSpec.order`는 root만, named container의 `children`은 direct child만, drawable의 `items`는 generated
  concrete instance만 저장한다. 같은 named graphic은 tree에서 정확히 한 번만 reachable해야 한다.
- Draw order는 root와 local children 순서의 depth-first traversal이다. Renderer와 test helper가 같은 production
  `graphicTree` grammar를 사용하므로 별도 traversal 규칙을 만들지 않는다.
- `createGraphics` attachment는 structural create-only다. Equivalent placement는 idempotent하고 reparent는
  지원하지 않는다. Subtree removal은 `editGraphics({ target, remove: true })`가 소유한다.
- Extension author가 parent를 생략한 explicit top-level graphic을 만드는 기능은 유지한다. Ordinary domain
  actions만 inferred Canvas/plot ownership을 보장한다.
- `assertChartProgramsEquivalent`는 이제 tree snapshot을 평가하므로 orphan, duplicate, cycle 또는 서로 다른
  attachment를 concrete object가 우연히 같아도 동등하다고 판정하지 않는다.

## Executable evidence

- `test/unit/grammar/graphic-tree.test.js`
- `test/unit/actions/primitives/create-graphics.test.js`
- `test/unit/actions/primitives/edit-graphics.test.js`
- `test/contracts/graphic-tree-equivalence.test.js`
- `test/support/graphic-tree.js`

## 완료 조건

Ownership and order can be checked without PNG inspection, and no new public API or implicit semantic compiler is
introduced.
