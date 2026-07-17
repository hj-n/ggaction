# STEP 4 — Jobs Closed Radar Primitive

## 진행 상태

- [x] 2000년 8개 직군의 within-role sex share rows
- [x] Categorical role theta order and `[0, 1]` radius
- [x] One closed `M/L/Z` path per sex
- [x] Existing Polar axes, grids and categorical legend geometry
- [x] Browser and high-DPI PNG rendering

Jobs source count를 각 직군 안에서 men/women share로 정규화한다. 이 preprocessing은 test/example input
preparation이며 library transform을 암묵적으로 추가하지 않는다. 두 complementary radar paths가 categorical
theta spacing과 closure를 함께 검증한다.
