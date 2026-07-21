# Roadmap 4 Phase 13 — Rectangular hierarchy data/layout (`skipped`)

## 진행 상태

- [x] P12-Exit 사용자 승인
- [x] Rectangular hierarchy 사용 사례와 우선순위 재검토
- [x] P-007을 `Maybe Future`로 이동
- [x] Phase 13 implementation과 Gate를 만들지 않기로 결정
- [x] Phase 14는 별도 요청 전까지 열지 않음

## 결정

2026-07-21 사용자 명시 결정으로 Phase 13을 구현 전에 건너뛴다. P-007과 후보
`createHierarchyData`는 거절하거나 Planned/public API로 간주하지 않고 `Maybe Future`로 보존한다.

## 영향

- Hierarchy source schema, treemap/partition layout grammar, derived-data action, public type와 renderer branch를 추가하지 않는다.
- Phase 13을 위한 primitive, example, artifact, test, public docs와 approval Gate를 만들지 않는다.
- Existing rect, ranged encoding, 2D-bin heatmap과 composition 동작은 변경하지 않는다.
- Roadmap 4에는 active Phase가 없으며 Phase 14 facade closeout도 자동으로 시작하지 않는다.

## 재개 조건

실제 hierarchy dataset과 representative treemap/partition chart가 제시되고 parent/value rollup, forest policy,
stable ordering과 output bounds 계약을 검토할 필요가 생기면 새 Roadmap 또는 별도 명시 요청에서 API 후보부터
다시 검토한다.
