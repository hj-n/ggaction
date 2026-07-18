# STEP 9 — Rect Mark and Heatmap Public Vertical Slice

## 진행 상태

- [ ] Semantic rect mark and completeness policy
- [ ] `createRectMark` and `editRectMark`
- [ ] Two-discrete and ranged position materialization
- [ ] Selection/highlight at final cell grain
- [ ] Primitive/public pair, browser, PNG, types and docs

Rect는 bar와 별도 semantic recipe다. Existing scale mapping과 concrete rect schema를 재사용하되 aggregation, baseline,
stack 또는 grouped-bar width policy를 암묵적으로 적용하지 않는다.
