# Phase 5 — Step 2: Graphical Foundation

## 목표

Field-driven shape와 confidence band를 표현할 최소 backend-neutral graphics 및 Canvas
rendering 기반을 구현한다.

## 진행 상태

- [x] Concrete child type을 갖는 heterogeneous drawable collection schema
- [x] Collection child recursive Canvas dispatch
- [x] Closed/filled path schema와 validation
- [x] Fill-only, stroke-only, fill+stroke path rendering
- [x] Collection broadcast와 structural-copy behavior
- [x] Renderer unit test와 mock context 확장
- [x] Extension graphic primitive documentation
- [x] 전체 regression, commit, push

## 핵심 계약

- Drawable `collection`의 각 child가 `circle` 또는 `rect` concrete type을 가진다.
- Program composition/layout용 `container`의 string child reference contract는 유지한다.
- Area path는 `closed: true`, `fill`, optional stroke를 가진다.
- Open line path는 기존처럼 stroke를 요구하고 fill을 강제하지 않는다.
- Renderer는 오직 `graphicSpec`의 concrete child type과 properties만 읽는다.

## 검증 결과

- Heterogeneous collection child는 deterministic ID와 concrete primitive type을 가진다.
- Compatible property broadcast와 child-target edit가 이전 program을 변경하지 않는다.
- Closed path의 fill-only와 fill+stroke, 기존 open stroke-only path가 모두 렌더링된다.
- 일반/coverage test 325개와 기존 high-resolution PNG regression 4개가 통과했다.
