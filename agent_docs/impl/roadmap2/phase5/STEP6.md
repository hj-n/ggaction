# Roadmap 2 — Phase 5 Step 6: Left Legend and Editing

## 목표

Gate B target과 stable legend layout/appearance edits를 `createLegend`/`editLegend`로 구현한다.

## 진행 상태

- [x] Categorical/composite/size/gradient left layout
- [x] Legend target selector와 ambiguity contract
- [x] Position/layout/title/symbol/style/border/count partial edits
- [x] Nested style merge와 auto/custom/hidden title transitions
- [x] Incompatible kind options, overlap와 insufficient-margin failures
- [x] Scale/domain/Canvas/edit rematerialization
- [x] Primitive/public exact equivalence와 user-facing PNG
- [x] Types, docs와 contracts
- [x] Full verification
- [x] Commit와 push

## 완료 조건

Legend semantic channels/order를 보존하면서 supported layout과 appearance가 하나의 stable edit resource로
동작한다.
