# Roadmap 2 — Phase 7 Step 3: Vertical Error-Band Actions

## 목표

Approved Gapminder target를 vertical ranged-area actions와 statistical/explicit `createErrorBand`로 재현한다.

## 진행 상태

- [x] Area-compatible `encodeY2` assignment/reassignment
- [x] Atomic `encodeYRange` validation and wrapped hierarchy
- [x] Vertical area materialization and consumer plans
- [x] `createErrorBand` ID/source/channel/group inference
- [x] Statistical `createIntervalData` composition
- [x] Explicit interval mode without derived data
- [x] Existing `encodeColor` composition and legend compatibility
- [x] Primitive/public state, trace, Canvas-call and pixel equality
- [x] Unit/contract/immutability/error/rematerialization coverage
- [x] STEP status, conceptual commit and push

## 핵심 검증

Statistical output를 explicit center/lower/upper rows로 다시 넣은 program이 같은 concrete paths를 만든다.
Repeated `encodeYRange`는 lower/upper를 하나의 atomic action으로 교체하며 이전 program은 바뀌지 않는다.

## 완료 조건

Canonical Gapminder public chain이 Gate A primitive와 exact match하고 vertical statistical/explicit contracts가 통과한다.
