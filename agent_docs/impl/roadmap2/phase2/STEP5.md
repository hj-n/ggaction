# Roadmap 2 — Phase 2 Step 5: Dash and Series Reassignment Primitives

## 목표

Named/constant dash와 group/dash reassignment의 final concrete target을 raw primitive programs로 고정한다.

## 진행 상태

- [x] `named-dash-vocabulary` primitive
- [x] `constant-dash` primitive
- [x] `group-reassignment` primitive
- [x] `dash-reassignment` primitive
- [x] Concrete series partition, order와 dash pattern fixtures
- [x] Legend component cleanup/preservation target state
- [x] Expanded target chain metadata
- [x] Browser와 2× primitive PNG 생성
- [ ] Gate B 사용자 visual confirmation
- [ ] Feedback 반영과 primitive 재확인
- [x] STEP 상태, conceptual commit와 push

## 분리 원칙

Group reassignment는 scale-free group-only line에서, dash reassignment는 dash-owned series에서 검증한다.
Coupled fields를 one-at-a-time 호출로 불일치 상태에 두는 API chain은 목표로 만들지 않는다.

## 구현 결과

- Named dash는 first-appearance Cylinder order `[8, 4, 6, 3]`을 사용하고 5-cylinder row를 제외해
  `solid`, `dashed`, `dotted`, `dashdot`을 정확히 한 번씩 보여준다.
- Constant dash는 field mode의 `originDash` scale을 보존하지만 final encoding은
  `{ datum: "dotted" }`이고 obsolete legend semantic/graphics는 존재하지 않는 target이다.
- Group reassignment는 final `Cylinders` group만 저장하며 scale과 legend 없이 다섯 solid series를 만든다.
- Dash reassignment는 unused `originDash`와 active `strokeDash`를 함께 보존하고 legend를
  `Cylinders` 다섯 category로 갱신한 target이다.
- 네 program은 `createLineMark`, `encodeGroup`, `encodeStrokeDash`, `createLegend`를 호출하지 않고
  low-level primitive로 final semantic/graphic state를 명시한다.
- Gallery는 target call chain, 1440×920 primitive PNG와 user-facing approval placeholder를 표시하며
  desktop 1440px/mobile 390px에서 overflow와 browser error가 없다.

## 완료 조건

네 primitive의 series cardinality, order, concrete patterns와 legend state가 승인된다.
