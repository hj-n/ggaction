# STEP 2 — Independent Polar Line Reference Geometry

## 진행 상태

- [x] Deterministic series grouping and theta ordering
- [x] Continuous and categorical theta mapping
- [x] Radius mapping and Cartesian projection
- [x] Exact open `M/L` and closed `M/L/Z` commands
- [x] Seam, duplicate theta, reverse, short/invalid series fixtures

Reference 계산은 test가 소유하며 이후 구현할 source grammar와 독립적이다. Equal theta value는 source order를
stable tie-break로 사용한다. Open line은 endpoint를 연결하지 않고 closed line만 정확히 하나의 final `Z`를 가진다.
