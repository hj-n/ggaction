# Roadmap 4 Phase 10 — Overlay/inset composition (`skipped`)

## 진행 상태

- [x] P9-Exit 사용자 승인
- [x] Overlay/inset 사용 사례와 우선순위 재검토
- [x] P-006을 `Maybe Future`로 이동
- [x] Phase 10 implementation과 Gate를 만들지 않기로 결정
- [x] Phase 11 진입 차단 해제

## 결정

2026-07-21 사용자 명시 결정으로 Phase 10을 구현 전에 건너뛴다. P-006은 거절하거나 현재 API로
간주하지 않고 `Maybe Future`로 보존한다.

## 영향

- `overlay()` 또는 inset-specific public action, type, state schema와 renderer branch를 추가하지 않는다.
- Phase 10을 위한 primitive, example, artifact, test, public docs와 approval Gate를 만들지 않는다.
- 기존 mark의 `layout: "overlay"`와 layered chart 동작은 별개인 현재 기능이며 변경하지 않는다.
- Phase 11 Parallel Coordinates는 P-006에 의존하지 않으므로 바로 설계할 수 있다.

## 재개 조건

실제 사용자 시나리오가 기존 layer/facet/concat으로 표현되지 않고, child placement·clipping·z-order를
공개 composition 계약으로 소유해야 할 필요가 확인되면 새 Roadmap에서 API 후보부터 다시 검토한다.
