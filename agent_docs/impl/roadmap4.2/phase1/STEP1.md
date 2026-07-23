# STEP 1 — Separate Canvas Adapter and Concrete Drawing

## 진행 상태

- [ ] Current root lifecycle과 draw traversal의 exact call order 고정
- [ ] Root target resolution helper 구현
- [ ] Canvas-independent concrete drawing helper 구현
- [ ] Public Canvas adapter를 helper 위에 재구성
- [ ] PDF-like context fixture로 no-canvas/no-density boundary 검증
- [ ] Focused/cumulative validation
- [ ] Remote checkpoint 기록

## 변경 경계

현재 `render`는 한 함수 안에서 다음 세 책임을 소유한다.

1. Program/`graphicSpec`과 root canvas dimension 검증
2. Browser/Node Canvas backing-store resize, CSS logical size, density scale와 clear
3. Root background, tree traversal, nested clip과 concrete primitive drawing

Phase 1은 1과 3을 renderer-internal reusable owner로 분리하고 2를 public Canvas adapter에 남긴다.
Internal drawing helper는 backend object를 program에 저장하지 않으며 `graphicSpec` 외 state를 받지 않는다.

## Compatibility target

- `render(program, context, { pixelRatio })` signature와 errors 유지
- Canvas physical width/height와 optional CSS logical width/height 유지
- Root `save → scale → clear → background/tree → restore` lifecycle 유지
- Nested canvas와 collection save/restore balance, authored tree order 유지
- `renderToPNG` result와 bytes deterministic behavior 유지
- Default/basic/png package graph와 public declaration 변경 없음
