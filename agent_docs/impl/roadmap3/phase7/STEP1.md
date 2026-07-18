# STEP 1 — Phase Contract and Gate H Targets

## 진행 상태

- [x] Direct-source first slice 확정
- [x] Scatterplot과 histogram exact call chain 확정
- [x] One-row default와 explicit wrapping target 확정
- [x] Shared ordinal Cylinders legend proposal 반영
- [x] Gate 전 public/runtime boundary 명시

Phase 7은 shortest `.facet({ field: "Origin" })`와 explicit `columns: 2`를 함께 검증한다. Existing title은
cell마다 복제하지 않고 parent로 승격하며 facet header는 parent-owned repeated graphics로 만든다.

두 target은 `Cylinders`를 ordinal color field로 encode하고 `reds` palette를 사용한다. Facet의 explicit
`guides: { legend: "shared" }` option은 axis를 cell마다 유지하면서 categorical legend 하나를 parent로
승격한다.
