# Roadmap 2 — Phase 7 Step 7: Area Curves and Boundary Composition

## 목표

Approved Gate C를 area curve materialization과 optional boundary wrapped components로 구현한다.

## 진행 상태

- [x] Area create/edit curve validation and concrete commands
- [x] All accepted curve interpolation coverage
- [x] Lower/upper boundary deterministic IDs
- [x] Wrapped line position/group/appearance assignments
- [x] Curve inheritance and boundary override precedence
- [x] Boundary enable/disable and drawing-order behavior
- [x] Area/boundary ordered deduplicated rematerialization
- [x] Gate C primitive/public exact equality
- [x] Style boundaries, errors, trace and immutability coverage
- [x] Architecture record update when materialization ownership changes
- [x] STEP status, conceptual commit and push

## 완료 조건

Area와 boundaries가 ordinary child layers로 남고 every curve/style variant가 final concrete path로 저장된다.
