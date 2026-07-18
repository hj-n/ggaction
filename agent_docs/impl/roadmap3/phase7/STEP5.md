# STEP 5 — Histogram Facet Primitive

## 진행 상태

- [ ] Shared global bin boundaries
- [ ] Shared y count domain
- [ ] `columns: 2` wrapping
- [ ] Parent title와 headers
- [ ] Explicit extension primitive chain

Cars `Displacement` histogram을 Origin별로 분리한다. Bin boundaries는 모든 cell이 공유하고 y domain은
cell별 count 결과의 union에서 결정한다. 세 번째 cell은 두 번째 row의 첫 column에 온다.

