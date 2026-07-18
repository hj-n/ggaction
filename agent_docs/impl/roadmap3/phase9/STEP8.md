# STEP 8 — Rect Reference Grammar and Gate J-C

## 진행 상태

- [ ] Gapminder cell fixture and independent geometry oracle
- [ ] Explicit heatmap primitive with continuous color guide
- [ ] Discrete-cell and ranged-cell variants
- [ ] Optional text-overlay primitive
- [ ] Gate J-C user approval

Representative heatmap은 selected Gapminder countries × year cell에 `life_expect` color를 매핑한다. Cell bounds는
resolved x/y discrete bandwidth에서 결정하고, missing combination은 placeholder 없이 생략한다.
