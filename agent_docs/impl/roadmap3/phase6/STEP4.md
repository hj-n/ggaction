# STEP 4 — Nested Canvas Primitive and Renderer

## 진행 상태

- [x] Nested Canvas concrete property validation
- [x] Extension primitive의 nested Canvas attachment
- [x] Root-only backing-store resize/clear
- [x] Nested save/translate/clip/background/restore traversal
- [x] Balanced nested scope와 root-only resize unit coverage

Root Canvas와 nested Canvas는 같은 graphic type을 쓰되 tree position으로 역할을 구분한다. Nested Canvas는
local `x`, `y`, `width`, `height`를 요구하고 child drawing을 자신의 bounds로 clip한다.
