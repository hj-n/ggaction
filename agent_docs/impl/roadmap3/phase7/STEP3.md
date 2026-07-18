# STEP 3 — Facet Layout, Headers and Parent Title

## 진행 상태

- [ ] Omitted columns one-row layout
- [ ] Explicit column wrapping과 row-major placement
- [ ] Header concrete bounds
- [ ] Parent title promotion reference
- [ ] Gap, align과 padding validation

Facet layout은 resolved value 순서를 유지하고 `ceil(valueCount / columns)` rows를 만든다. Header와 promoted
title의 concrete position은 materialization에서 결정하며 renderer가 text를 재배치하지 않는다.

