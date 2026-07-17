# Roadmap 3 Planned Editing contracts

Gate A에서 승인된 Phase 1과 Phase 10 계약이다. 아직 current public behavior가 아니며 runtime, public
TypeScript와 user documentation에 노출하지 않는다.

## Shared position scale resolution

- Scale identity is separated from mark-specific layout policy so layered bar/line consumers can share semantic
  position without silently shifting pixels.
- Shared, independent, explicit and ambiguous cases require exact resolved-coordinate tests.
- Existing valid single-mark and intentionally independent-scale behavior remains compatible.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 10.

## Cross feature integration

- Polar, composition, facet, directional marks, Canvas/scale/data revisions, selection/highlight, package types,
  installed consumers and documentation are verified as one closeout matrix.
- Unsupported Polar/facet combinations must fail explicitly rather than partially materialize.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 10.
