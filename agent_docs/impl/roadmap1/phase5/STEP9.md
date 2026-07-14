# Phase 5 — Step 9: Regression Scatterplot Guides

## 목표

Shared axes/grid, composite Origin legend, quantitative size legend를 `createGuides()`에
통합한다.

## 진행 상태

- [x] Shared x/y axes deduplication
- [x] Existing horizontal grid compatibility
- [x] Point color+shape+line composite legend recipe
- [x] Quantitative size legend values와 symbols
- [x] Right-side multi-legend vertical layout
- [x] Legend rematerialization after Canvas/scale edits
- [x] `createLegend`/`createGuides` applicability
- [x] Trace, shortest call, layout tests
- [x] Legend/guide documentation
- [x] Primitive equivalence, commit, push

## Legend 규칙

- 같은 Origin field를 사용하는 color, shape, line을 하나의 categorical legend로 합친다.
- Size는 Acceleration quantitative scale을 설명하는 별도 legend다.
- Quantitative size legend의 chart-independent 기본 symbol count는 5개다.
- Fixed confidence-band color는 legend 대상이 아니다.
- Chart별 hidden default를 만들지 않고 기존 right placement를 사용한다.
