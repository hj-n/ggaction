# Roadmap 2 — Phase 2 Step 6: Dash Vocabulary and Series Reassignment

## 목표

Gate B를 재현하는 named/constant dash와 `encodeGroup`/`encodeStrokeDash` reassignment를 구현한다.

## 진행 상태

- [x] Shared named dash registry와 direct pattern normalization
- [x] Named values를 받는 ordinal dash range
- [x] Constant `encodeStrokeDash({ value })`
- [x] Field↔constant atomic replacement
- [x] `encodeStrokeDash` field/current/new-scale reassignment
- [x] `encodeGroup` field reassignment
- [x] Group/color/dash compatibility validation
- [x] Existing legend inferred title update와 custom config preservation
- [x] Obsolete legend component cleanup
- [x] Canvas/scale rematerialization과 trace order
- [x] Four approved primitive/public pairs
- [x] TypeScript/docs/current contract/catalog, commits와 push

## 완료 조건

Named styles와 direct patterns가 renderer-ready numeric arrays로만 저장되고 네 visual pair와 전체 failure
matrix가 통과한다.

## 구현 결과

- `solid`, `dashed`, `dotted`, `dashdot`을 shared grammar에서 concrete numeric pattern으로
  정규화하며 semantic scale은 author가 입력한 이름을 보존한다.
- `encodeStrokeDash`가 field와 constant mode를 한 assignment action으로 소유하고, 전환 시
  obsolete legend component를 정리하되 이전 named scale resource는 보존한다.
- Line group/color/strokeDash field compatibility를 encoding 시점에 검증하고, reassignment 실패는
  이전 immutable program을 변경하지 않는다.
- 승인된 네 primitive target과 user-facing action program이 semantic state, graphic state,
  renderer call에서 정확히 일치한다.
- Canvas resize, Node PNG, desktop/mobile Roadmap gallery, full contract/docs/coverage suite를 검증했다.
