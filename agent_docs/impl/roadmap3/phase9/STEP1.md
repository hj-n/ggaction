# STEP 1 — Contracts and Gate Boundaries

## 진행 상태

- [x] Phase 9 public surface와 inference 경계 확정
- [x] Representative dataset과 chart 계약 확정
- [x] Gate J-A, J-B, J-C 분리
- [x] Implementation order와 closeout evidence 정의

Phase 9은 offset, text와 rect를 하나의 visual approval로 묶지 않는다. 각 capability는 graphical primitive를
먼저 승인받은 뒤 public vertical slice를 구현한다. Jobs는 directional parity, IMDb는 긴 categorical text,
Gapminder는 dense discrete cell과 continuous color를 검증한다.

구현은 다음 dependency order를 따른다.

```text
horizontal grouped reference geometry
→ Gate J-A primitive
→ shared offset grammar and yOffset scale
→ horizontal bar materialization and public pair
→ text content/position reference grammar
→ Gate J-B primitive
→ semantic text mark and public pair
→ rect cell reference grammar
→ Gate J-C primitive
→ semantic rect mark and public pair
→ integration and closeout
```
