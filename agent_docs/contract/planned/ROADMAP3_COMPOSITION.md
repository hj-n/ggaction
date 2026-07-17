# Roadmap 3 Planned Composition and Facet contracts

Gate A에서 승인된 Phase 6~8 계약이다. Composition intent는 `semanticSpec` layer grammar 밖에 둔다.

## Facet

```typescript
facet({ id?, field, data?, columns?, gap?, align?, padding? }): ChartProgram;
editFacetHeaders({ fontSize?, fontFamily?, fontWeight?, color?, offset? }): ChartProgram;
```

- `facet` is a chainable `ChartProgram` action whose base is current `this`.
- First slice requires one direct source, uses first-appearance facet values, shared scale domains and guides in each
  cell. Omitted columns creates one row; explicit positive integer wraps deterministically.
- Child IDs are opaque deterministic IDs and never embed raw facet values.
- Existing title is promoted to parent; headers are parent-owned concrete repeated graphics.
- Unit-only actions reject a composition parent without an explicit future child-target contract.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 7.

## Facet resolution and derived replay

```javascript
.facet({
  field: "Origin",
  scales: { x: "shared", y: "independent", color: "shared" }
});
```

- Shared auto domains resolve from the full facet source; independent auto domains resolve from cell-filtered data.
  Explicit domains take precedence.
- Regression, density, interval/error band and box dependencies replay their registered immutable transform DAG per
  cell.
- Parent guide composition is independent from scale resolution and explicitly materializes shared legend or
  outer-only axes without merging child semantics.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 8.
