# Phase 6 — Step 3: Density Grammar and Derived Data

## 목표

Reusable Gaussian KDE grammar와 immutable density derived-data actions를 구현한다.

## 진행 상태

- [x] Density option/field validation
- [x] Shared extent와 uniform sample resolver
- [x] Scott-rule automatic bandwidth
- [x] Grouped Gaussian KDE calculation
- [x] Output `as` field naming과 collision validation
- [x] `materializeDensityData`
- [x] `createDensityData`
- [x] Source inference와 transform provenance
- [x] Fixture equivalence, trace, immutability, error tests
- [x] Advanced data API docs, full regression, commit, push

## Action hierarchy

```text
createDensityData
├─ createDerivedData
└─ materializeDensityData
```

## 저장 계약

`createDensityData`는 source dataset을 교체하지 않고 새 named dataset에 다음을 저장한다.

- `source`
- `type: "density"`
- source field와 optional groupBy
- requested 또는 resolved bandwidth
- requested extent 또는 `"auto"`
- exact steps
- output field names
- `resolve: "shared"`
- immutable materialized values

## Validation

- `field`, `groupBy`, output names는 non-empty strings다.
- Initial groupBy는 string 하나만 허용한다.
- `as`는 서로 다른 두 field names다.
- Source field는 유효 row에서 quantitative이고 group field는 nominal이다.
- Duplicate dataset ID, missing/ambiguous source, unknown options는 변경 전에 오류다.
- Trace에는 large materialized rows를 복사하지 않는다.

## 검증 결과

- Cars fixture와 300개 derived rows 및 group/sample order가 정확히 일치한다.
- Automatic bandwidth는 source 전체 유효값에서 한 번 resolve되어 숫자로 저장된다.
- Primitive oracle도 exact density transform provenance를 저장하도록 갱신했다.
- 전체 377개 테스트와 coverage gate를 통과했다 (`lines 94.43%`, `branches 89.37%`, `functions 98.48%`).
