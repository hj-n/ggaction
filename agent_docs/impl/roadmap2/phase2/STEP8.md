# Roadmap 2 — Phase 2 Step 8: Scalar Aggregate Vocabulary

## 목표

Current mean/count grammar를 accepted scalar aggregate vocabulary로 확장하고 line/bar consumer가 같은 pure
calculation과 validity policy를 사용하게 한다.

## 진행 상태

- [x] `sum | median | min | max`
- [x] `distinct | valid | missing`
- [x] `variance | varianceP | stdev | stdevP | stderr`
- [x] `q1 | q3 | ciLower | ciUpper`
- [x] Finite/nominal compatibility와 missing-value rules
- [x] Empty/singleton/insufficient-sample omission policy
- [x] Final visual grain별 line/bar aggregation
- [x] Inferred/custom axis title policy
- [x] Scale/line/bar/axis/grid rematerialization
- [x] Aggregate replacement immutability와 atomic failure
- [x] Median/dispersion approved primitive/public pairs
- [x] Types/docs/current contract/catalog, commits와 push

## 완료 조건

모든 scalar operation의 representative, boundary와 invalid fixtures가 통과하고 approved median/dispersion
pair가 exact equivalence를 가진다.

## 현재 결과

- Scalar operation과 parameter object validation의 canonical owner를 `grammar/aggregate`로 통합했다.
- Line과 ordinal bar는 같은 pure scalar calculation 및 final-grain omission policy를 사용한다.
- Nominal input은 count/distinct/valid/missing에만 허용하고 output scale은 linear로 materialize한다.
- Aggregate reassignment는 inferred axis title, scale, path/rect, axes와 grid를 명시적으로 갱신하며
  explicit title과 이전 program은 보존한다.
- Median과 sample stdev public program은 승인된 primitive와 semanticSpec, graphicSpec, drawing order,
  Canvas calls 및 2× PNG가 정확히 일치한다.
