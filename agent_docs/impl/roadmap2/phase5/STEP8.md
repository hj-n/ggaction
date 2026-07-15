# Roadmap 2 — Phase 5 Step 8: Title Layout and Editing

## 목표

Four-edge title position, deterministic wrapping/measurement와 stable `editTitle`을 구현한다.

## 진행 상태

- [x] Shared text measurement service와 Unicode-safe wrapping
- [x] Four positions, rotation, alignment, offset와 subtitle blocks
- [x] Inferred/explicit lineHeight와 maxWidth dependency validation
- [x] `editTitle` text/subtitle/layout/style partial updates
- [x] Subtitle removal과 nested style merge
- [x] Margin/collision failures와 Canvas edit rematerialization
- [x] Primitive/public exact equivalence와 user-facing PNG
- [x] Types, docs, contracts, commit와 push

## 완료 조건

Title semantic text와 graphical layout을 분리한 채 모든 edit가 deterministic concrete text block을 다시 만든다.
