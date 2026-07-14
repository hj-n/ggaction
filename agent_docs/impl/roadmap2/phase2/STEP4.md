# Roadmap 2 — Phase 2 Step 4: Curve Grammar and Line Editing

## 목표

Gate A의 primitive를 재현하는 8-value curve grammar, `createLineMark.curve`와 `editLineMark`를 구현한다.

## 진행 상태

- [x] Eight-token curve validation과 default `linear`
- [x] Linear/step family exact command builders
- [x] Basis/cardinal/monotone/natural cubic builders
- [x] Short-series fallback과 monotone ordering validation
- [x] `createLineMark({ curve })`
- [x] `editLineMark({ target?, strokeWidth?, curve? })`
- [x] Target inference, ambiguity, empty edit와 invalid option policy
- [x] Canvas/scale/group rematerialization과 deterministic trace
- [x] Earlier-program immutability와 atomic failure
- [x] Approved primitive/public exact pair와 PNG
- [x] TypeScript, action reference, marks/path docs
- [x] Contract/catalog promotion, conceptual commits와 push

## 구현 결과

`src/grammar/curveCommands.js`가 8-value closed vocabulary와 final `M/L/C` command 생성을 소유한다.
Linear와 세 step mode, endpoint-extended uniform cubic basis, tension-0 cardinal, monotone-x cubic Hermite,
natural cubic을 deterministic pure calculation으로 제공한다. Smooth curve의 2-point input은 linear로
fallback하며 monotone input은 strictly increasing x를 검증한다.

`createLineMark({ curve })`는 explicit graphical intent를 mark materialization config에 저장한다.
`editLineMark`는 current/unique/explicit line target을 해석하고 curve 또는 stroke width를 immutable하게
교체한다. Complete line은 wrapped `rematerializeLineMark`를 호출하고 incomplete line은 future
materialization을 위해 config만 보존한다. Canvas, scale와 grouping 변경도 같은 stored curve를 사용한다.

Gate A의 `curve-step`과 `curve-monotone-edit`은 user-facing program으로 승격되었다. 각 public program은
primitive와 complete semantic/graphic state, drawing order, Canvas calls와 2× PNG가 일치한다. Current action
contract, TypeScript, API/reference/recipe/tutorial/extension 문서와 generated catalog를 함께 갱신했다.

## 완료 조건

8개 token의 exact command fixture와 renderer parity가 통과하고 두 approved visual variant가
primitive/public pair가 된다.
