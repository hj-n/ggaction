# STEP 3 — Grammar and Statistics Ownership

## 진행 상태

- [x] Student-t distribution kernel을 하나의 pure statistics owner로 통합
- [x] Regression validation, fit methods와 prediction 책임 분리
- [x] Scale/facet file-directory 이름 충돌 제거
- [x] Quantile policy별 literal oracle와 non-equivalence 경계 보존
- [x] Statistics, transform, interval와 regression tests 통과

동일한 수학 이름보다 현재 numeric contract를 우선한다. Runtime 결과, error와 stable rounding은 바꾸지 않는다.

## 결과

- Regression과 interval이 하나의 pure Student-t kernel을 사용하되 기존 wrapper validation과 오류 문구는 유지한다.
- Regression은 parameter/transform validation, method fit, prediction/derivation과 facade로 분리했다.
- `scales/index.js`, `facets/index.js`, `regression/index.js`가 각각 유일한 grammar 진입점이다.
- Aggregate, box와 discretized-scale quantile은 같은 이름만으로 합치지 않고 literal 결과와 서로 다른 input policy를 테스트로 고정했다.
- normal suite 1,543개가 통과했다.
