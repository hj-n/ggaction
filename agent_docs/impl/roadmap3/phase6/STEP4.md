# STEP 4 — Nested Canvas Primitive and Renderer

## 진행 상태

- [ ] Nested Canvas concrete property validation
- [ ] Extension primitive의 nested Canvas attachment
- [ ] Root-only backing-store resize/clear
- [ ] Nested save/translate/clip/background/restore traversal
- [ ] Browser/PNG parity와 balanced scope coverage

Root Canvas와 nested Canvas는 같은 graphic type을 쓰되 tree position으로 역할을 구분한다. Nested Canvas는
local `x`, `y`, `width`, `height`를 요구하고 child drawing을 자신의 bounds로 clip한다.

