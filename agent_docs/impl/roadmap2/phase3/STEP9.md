# Roadmap 2 — Phase 3 Step 9: Position Field-Type Compatibility and Orientation

## 목표

Gate D를 재현하고 accepted mark × channel × fieldType compatibility와 bar orientation inference를
구현한다.

## 진행 상태

- [x] Canonical compatibility matrix와 single owner
- [x] Point x/y quantitative/temporal/ordinal combinations
- [x] Line/area current independent/measure-axis compatibility
- [x] Ranged/measure-axis quantitative restrictions
- [x] Vertical ordinal/temporal x bar
- [x] Horizontal ordinal/temporal y bar
- [x] Current time/ordinal/linear scale validation; aliases는 Phase 10으로 유지
- [x] Orientation inference without duplicate semantic option
- [x] Scale/mark/axes/grid deterministic materialization plan
- [x] Aggregate/bin/stack/range narrowing rules
- [x] Shared-scale conflict, ambiguity와 atomic failure coverage
- [x] Two approved primitive/public pairs와 PNG
- [x] Types/docs/current contract/catalog, commits와 push

## 구현 원칙

- Field type을 자동 변환하거나 unsupported channel pair를 임의 orientation으로 해석하지 않는다.
- Channel action이 field semantics를 저장하고 complete compatible pair가 orientation을 결정한다.
- Generic compatibility owner와 mark-specific grain policy를 분리해 같은 matrix를 여러 action에 복사하지 않는다.
- Renderer는 final rect/line/path/circle/text만 읽고 orientation이나 field type을 추론하지 않는다.
- Numeric/string 4자리 연도는 UTC year로 normalize하되 source dataset과 semantic field는 보존한다.
- `utc`, `band`, `point`와 transformed scale vocabulary는 Phase 10 소유이므로 이 step은 현재
  `time`, `ordinal`, `linear` vocabulary를 사용한다.

## 완료 조건

Accepted compatibility matrix와 두 approved pair가 통과하고 incompatible pair는 earlier program을 보존한다.
