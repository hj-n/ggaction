# Roadmap 2 — Phase 11 Step 1: Hierarchy and Migration Audit

## 목표

Current create/edit primitive, tree walker, Canvas renderer와 every domain-created graphic consumer를 감사해
Phase 11 migration 범위와 기존 public behavior boundary를 구현 전에 고정한다.

## 진행 상태

- [x] `graphicSpec.order`, named `children` and drawable `items` current schema audit
- [x] `createGraphics(parent/before/after)` and subtree removal behavior audit
- [x] Canvas renderer depth-first traversal and invalid-tree behavior audit
- [x] Mark, grid, axis, legend, title and composite creation-site inventory
- [x] Flat-root assumptions in actions, layout, selectors, tests and docs inventory
- [x] Canvas-first public examples and extension top-level compatibility boundary
- [x] Canonical regression baseline state, Canvas calls and PNG lock
- [x] Executable migration inventory contract
- [x] STEP status, conceptual commit and push

## 감사 결과

- `graphicSpec.objects`는 이미 flat named registry이고, `order`/`children`과 drawable `items`의 역할은
  `graphicTree` grammar가 분리한다. Canvas renderer도 이 grammar의 depth-first walker를 사용한다.
- Primitive는 Canvas/collection parent, same-parent `before`/`after`, idempotent equivalent placement와 immutable
  subtree removal을 지원한다. Reparent는 current contract가 아니며 Phase 11에서도 추가하지 않는다.
- Mark, grid, axis, legend, title와 composite action의 `createGraphics` call은 모두 parent를 생략해 현재 public
  examples의 named graphics가 top-level root로 남는다.
- 16개 canonical public chart의 exact pre-migration root inventory를
  `test/contracts/graphic-hierarchy-migration.test.js`에 고정했다. 새 root가 추가되거나 순서가 바뀌면 migration
  contract를 의도적으로 갱신해야 한다.
- Canonical regression flat order는 `grid → points → band → line → axes → legends`다. Phase target은 semantic과
  per-node concrete geometry를 유지하되 `grid → band → points → line → axes → legends`로 의도적으로 바꾼다.
- 모든 canonical public example은 Canvas-first flow다. Extension author가 `createGraphics`에서 parent를 생략해
  top-level graphic을 만드는 current capability는 유지한다.

## Migration ownership

| Graphic family | Current owner | Phase target |
| --- | --- | --- |
| Canvas | `createCanvas` | top-level root |
| Plot marks and statistical layers | mark/composite actions | `plot-main` child |
| Grid | grid actions | first plot children |
| Axes | axis component actions | final plot children |
| Legend | legend recipes | direct Canvas children after plot |
| Title/subtitle | title actions | direct Canvas children after legends |
| Repeated concrete shapes | owning drawable `items` | unchanged |

## 완료 조건

Every named graphical consumer has one intended parent, placement policy, migration owner and executable baseline before
the target tree is authored.
