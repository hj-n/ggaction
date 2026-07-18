# STEP 3 — Requested and Resolved Density Provenance

## 진행 상태

- [x] Density transform schema extension
- [x] Auto bandwidth/extent requested intent preservation
- [x] Resolved parameter storage
- [x] `editDensity` revision compatibility
- [x] Numeric and immutability regression tests

Density transform은 requested values와 one materialized revision의 resolved values를 함께 기록한다.
`"auto"`를 숫자로 덮어쓰지 않는다. Existing explicit parameters remain unchanged, while auto values are
recomputed for every facet cell and new density revision.

이 semantic schema 변경은 SECOND_ARCHITECTURE, current density contract, exact TypeScript state declarations와
public state-inspection documentation에 함께 반영한다.
