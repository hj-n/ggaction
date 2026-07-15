# Roadmap 2 — Phase 5 Step 7: Positioned and Wrapped Title Primitive

## 목표

Public title position/wrapping implementation 전에 bottom title/subtitle block의 deterministic wrapped target을
raw primitive로 고정한다.

## 진행 상태

- [x] Bottom-edge alignment/offset와 occupied bounds reference
- [x] Word wrapping, long-token character fallback과 lineHeight target
- [x] Title/subtitle multi-line concrete text children
- [x] Plot/legend와 same-edge collision-free placement
- [x] Primitive-only trace와 expanded target chain metadata
- [x] `primitive.png`와 Gate C browser/PNG confirmation
- [ ] Feedback 반영과 primitive 재확인
- [x] STEP status
- [x] Conceptual commit와 push

## 완료 조건

Line breaks, line positions, block gap와 bottom placement가 승인되고 renderer가 wrapping을 수행하지 않는다.
