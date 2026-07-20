# Step 2 — Primitive jitter visuals와 P4-A

## 진행 상태

- [x] Cars Origin × Acceleration vertical band-jitter primitive
- [x] Gapminder 2005 life expectancy × cluster horizontal band-jitter primitive
- [x] semantic position 보존, point count, key와 containment assertions
- [x] Browser-neutral Node Canvas 2x PNG와 deterministic repeated render
- [x] P4-A review package 작성
- [ ] P4-A 사용자 승인

두 primitive는 아직 존재하지 않는 `jitterPoints`를 호출하지 않는다. 기존 point encoding 뒤 independent
oracle이 계산한 concrete x 또는 y 배열을 `editGraphics`로 적용해 목표 이미지만 고정한다.
