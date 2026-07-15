# Roadmap 2 — Phase 5 Step 2: Mirrored Axis Primitive

## 목표

Public position/format implementation 전에 top x axis, right y axis와 fixed-decimal labels의 final concrete
target을 raw primitive로 고정한다.

## 진행 상태

- [x] Custom top/right Canvas margins와 plot bounds reference
- [x] Top x line, outward ticks, labels와 title geometry
- [x] Right y line, outward ticks, labels와 rotated title geometry
- [x] `.1f` concrete label text와 independent expected values
- [x] Existing point/grid geometry의 matching plot-bound rematerialization
- [x] Future public action이 없는 primitive-only trace
- [x] Expanded target call-chain metadata와 `primitive.png`
- [ ] Gate A browser/PNG visual confirmation
- [ ] Feedback 반영과 primitive 재확인
- [x] STEP status, conceptual commit와 push

## Gate A 결과

- Canvas는 `640 × 400`, margin은 `{ top: 80, right: 90, bottom: 30, left: 30 }`이며 plot bounds는
  `{ left: 30, right: 550, top: 80, bottom: 370 }`이다.
- Top x ticks는 plot 바깥쪽 위로, right y ticks는 오른쪽으로 향한다. Labels도 각 edge 바깥에 배치된다.
- X title은 rotation `0`, y title은 `Math.PI / 2`이고 labels는 `.1f` target text를 저장한다.
- Points와 horizontal grid는 같은 new plot bounds에서 독립적으로 다시 계산했다.
- Focused capability tests 9개와 full render tests 232개가 통과했다. Gallery는 47 variants를 desktop/mobile로
  검증하며 Gate variant에는 primitive와 expanded future public chain만 존재한다.

## Gate A target

- x axis: top, outward 6px ticks, fixed one-decimal labels, horizontal title
- y axis: right, outward 6px ticks, fixed one-decimal labels, `Math.PI / 2` title
- Plot/grid/points는 새 margins의 동일 bounds를 공유한다.

## 완료 조건

Mirrored edge direction, label alignment, title rotation과 plot alignment가 승인되고 target chain이 artifact에
저장된다.
