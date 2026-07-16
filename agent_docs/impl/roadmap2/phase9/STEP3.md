# Roadmap 2 — Phase 9 Step 3: Mark-Item Resolver and Selection State

## 목표

Final semantic visual units를 stable selectable items로 해석하고 reusable selection resource를 저장한다.

## 진행 상태

- [x] Canonical item key/member/value/graphic identity contract
- [x] Point row-symbol resolver
- [x] Histogram/aggregate/grouped/stacked/ranged bar item resolvers and complete stack grain
- [x] Line/area series-path resolver and unique-field policy
- [x] Rule-line resolver
- [x] Deterministic selection ID, `currentSelection` and immutable stored definition
- [x] Empty/multiple/ambiguous selection behavior
- [x] Current-state re-resolution through stored selection intent
- [x] Selector and package-boundary contract tests
- [x] STEP status and local verification

## 경계

Resolvers consume semantic/materialization calculations, not concrete dimensions. Graphic child IDs are attachment
targets only after semantic selection has resolved.

## 구현 결과

- `src/materialization/selection/items.js`는 point row, final bar cell, line/area series와 rule row를 canonical item으로
  해석한다. 각 item은 semantic key, fields/channels/properties, member rows와 하나 이상의 concrete attachment
  ID를 가진다.
- Multi-row path는 모든 member가 공유하는 unique field와 explicit series key만 노출한다. 따라서 x/y처럼 path
  안에서 여러 값인 field/channel은 selector 입력으로 해석되지 않는다.
- Histogram resolver는 segment의 semantic start/end를 `y`/`y2`, bin endpoints를 `x`/`x2`로 노출한다.
  Concrete top-left/size는 property `x`/`y`/`width`/`height`로만 노출한다. Stack grain은 같은 bin/category의
  segment attachment를 모두 보존하고 semantic 전체 endpoint와 concrete union bounds를 별도로 계산한다.
- Selection definition은 `materializationConfigs.selections[id]`에 selector intent만 저장한다. Selected key는
  저장하지 않으며 `resolveStoredSelection()`이 현재 mark items를 다시 만든 뒤 selector를 평가한다.
- `context.currentSelection`은 omitted lookup 전용이다. Omitted ID의 첫 default는 `${target}Selection`이고 같은
  role의 중복 생성은 거부한다.

## 검증

- `npm run test:unit`
- `npm run test:contracts`

## 완료 조건

Every implemented mark type exposes deterministic item keys and selection state survives an equivalent rematerialization.
