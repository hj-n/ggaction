# Roadmap 2 — Phase 3 Step 1: Canonical Baselines and Phase Contract

## 목표

Existing cars histogram과 jobs grouped-bar primitive/public pair를 재감사하고 모든 Phase 3 variant가
공유할 두 canonical baseline과 executable reference contract를 고정한다.

## 진행 상태

- [x] Existing histogram semantic/graphic/order/Canvas-call diff audit
- [x] Existing grouped-bar semantic/graphic/order/Canvas-call diff audit
- [x] Valid-row, group order, aggregate/bin grain과 missing-cell policy 고정
- [x] 두 baseline primitive/public exact equivalence
- [x] `baseline` metadata와 expanded target chain 확인
- [x] Roadmap 2 gallery pair 재생성
- [x] Browser와 high-resolution PNG 확인
- [x] Gate 0 사용자 baseline confirmation
- [x] Chart contract와 Phase status 갱신
- [x] Conceptual commit와 push

## Baseline audit 결과

### Cars histogram

- Valid row: 406개; Origin first-appearance order: `USA → Europe → Japan`.
- Displacement domain: `[50, 500]`, step `50`, 9개 bin.
- Bin total: `98, 104, 33, 40, 28, 44, 37, 18, 4`.
- Non-empty stacked rect: 15개; y domain: `[0, 120]`.
- Graphic order: grid → bars → complete x axis → complete y axis → legend → title/subtitle.
- Primitive/public Canvas call: 각각 647개이며 complete semantic/graphic/order/call이 정확히 같다.

### Jobs grouped bar

- Valid row: 7,650개; year 15개; sex order: `men → women`.
- Final grain: `year × sex`, mean aggregate, observed rect 30개.
- Outer x domain: `1850 … 2000`; xOffset domain: `men → women`.
- Outer bandwidth: `33.333…`; inner bandwidth: `16.666…`; band `0.72`의 final bar width는 `12`.
- Y domain: `[0, 0.004]`; graphic order는 grid → bars → complete axes → legend다.
- Primitive/public Canvas call: 각각 889개이며 complete semantic/graphic/order/call이 정확히 같다.

두 baseline은 current public result와 existing independent primitive 사이에 교정이 필요한 차이가 없었다.
Roadmap 2 artifact는 expanded public chain을 저장하며 2× PNG의 decoded pixel hash도 pair별로 같다.
2026-07-15에 사용자가 두 baseline을 수정 없이 승인했다.

## 작업 내용

- Current public defaults와 older primitive의 bin boundaries, stack order, band geometry, guide/title theme와
  drawing order를 비교한다.
- 차이가 있으면 public result를 자동 정답으로 삼지 않고 하나의 canonical visual을 선택해 primitive를
  독립 reference calculation으로 교정한다.
- Histogram은 finite Displacement와 Origin order, concrete bins/counts를 고정한다.
- Grouped bar는 `year × sex` mean grain, outer/inner domain order와 missing combination omission을 고정한다.
- Baseline artifact는 이후 STEP의 shared fixture/manifest가 한 번만 소유하도록 정리한다.

## 범위 경계

이 STEP에서는 새 bin mode, layout, width, padding, reassignment 또는 orientation을 구현하지 않는다.

## 완료 조건

두 baseline pair의 complete state와 Canvas calls가 같고 gallery에서 Gate 0 검토가 가능하다.
