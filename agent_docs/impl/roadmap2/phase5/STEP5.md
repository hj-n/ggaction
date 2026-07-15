# Roadmap 2 — Phase 5 Step 5: Left Legend Primitive

## 목표

Public left position/edit action 전에 categorical, composite와 size legend blocks의 mirrored side-layout target을
raw primitive로 고정한다.

## 진행 상태

- [x] Left-side occupied bounds와 block-order reference
- [x] Symbol→label order와 domain order preservation
- [x] Categorical/composite/size concrete geometry
- [x] Border/title/style representative target
- [x] Existing plot/guide geometry와 non-overlap verification
- [x] Primitive-only trace와 expanded target chain metadata
- [x] `primitive.png`와 Gate B browser/PNG confirmation
- [x] Feedback 반영과 primitive 재확인
- [x] STEP status, conceptual commit와 push

## Gate B target

- Canvas margin은 left `190`, right `80`으로 바꾸되 plot width `490`은 유지한다.
- 왼쪽 범례는 `offset: 80`으로 y-axis guide의 바깥쪽에 두며 categorical block 다음에 size block을
  top-to-bottom으로 배치한다.
- 각 item은 왼쪽에서도 symbol→label 순서를 유지하고 resolved domain order를 바꾸지 않는다.
- 하나의 bordered background가 두 block의 occupied bounds를 감싸며 title/label style target도 함께 고정한다.
- Gallery는 target public chain과 `primitive.png`만 표시하고 approval 전에는 public action을 실행하지 않는다.
- Gate B target은 사용자 승인을 받아 Step 6 public implementation의 canonical oracle로 확정했다.

## 완료 조건

Right-side contract를 mirror한 left block의 spacing, order와 alignment가 승인된다.
