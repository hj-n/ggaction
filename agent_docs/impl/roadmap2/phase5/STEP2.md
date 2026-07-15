# Roadmap 2 — Phase 5 Step 2: Mirrored Axis Primitive

## 목표

Public position/format implementation 전에 top x axis, right y axis와 fixed-decimal labels의 final concrete
target을 raw primitive로 고정한다.

## 진행 상태

- [ ] Custom top/right Canvas margins와 plot bounds reference
- [ ] Top x line, outward ticks, labels와 title geometry
- [ ] Right y line, outward ticks, labels와 rotated title geometry
- [ ] `.1f` concrete label text와 independent expected values
- [ ] Existing point/grid geometry의 matching plot-bound rematerialization
- [ ] Future public action이 없는 primitive-only trace
- [ ] Expanded target call-chain metadata와 `primitive.png`
- [ ] Gate A browser/PNG visual confirmation
- [ ] Feedback 반영과 primitive 재확인
- [ ] STEP status, conceptual commit와 push

## Gate A target

- x axis: top, outward 6px ticks, fixed one-decimal labels, horizontal title
- y axis: right, outward 6px ticks, fixed one-decimal labels, `Math.PI / 2` title
- Plot/grid/points는 새 margins의 동일 bounds를 공유한다.

## 완료 조건

Mirrored edge direction, label alignment, title rotation과 plot alignment가 승인되고 target chain이 artifact에
저장된다.
