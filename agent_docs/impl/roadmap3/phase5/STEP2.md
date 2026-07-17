# STEP 2 — Independent Annular-Sector Geometry

## 진행 상태

- [ ] 12시 origin과 clockwise degree projection
- [ ] Maximum 90-degree cubic segmentation
- [ ] Pie center, annular inner edge와 full-circle seam
- [ ] Angular padding and reverse sweep
- [ ] Literal anchor values and geometry invariants

Test-owned reference geometry는 production `src/grammar/polarPaths.js`를 import하지 않는다. 각 sector는 outer
arc를 따라간 뒤 center 또는 reverse inner arc로 돌아와 정확히 하나의 `Z`로 닫힌다. Literal quarter-sector
endpoint와 full annulus command shape로 independent oracle 자체도 고정한다.
