# Phase 5 — Step 6: Regression Grammar

## 목표

Grouped linear OLS와 Student-t mean-response confidence interval을 계산하는 reusable
regression grammar 및 derived-data action을 구현한다.

## 진행 상태

- [x] Regression option/field validation
- [x] Grouped OLS calculation
- [x] Student-t critical value calculation
- [x] Mean-response confidence interval
- [x] Observed unique x sampling
- [x] Deterministic regression row schema
- [x] `createRegressionData` wrapped action
- [x] Degenerate group and ambiguity errors
- [x] Statistical fixture equivalence tests
- [x] Advanced data API documentation, commit, push

## 저장 결과

Regression dataset은 source, x, y, optional groupBy, method, confidence transform과 concrete
derived values를 저장한다. Source 및 filtered values는 immutable하게 유지한다.
