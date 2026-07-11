# Core concepts

이 문서는 현재 구현이 제공하는 핵심 계약만 설명한다. 전체 초기 설계는
`agent_docs/INITIAL_ARCHITECTURE.md`에 별도로 보존한다.

## 현재 상태

STEP 1의 프로젝트 기반과 module 경계만 구성되어 있다. 아래 항목은 구현될
계약이며 아직 동작하지 않는다.

## `ChartProgram`

차트의 semantic state, concrete graphic state, context와 action trace를 담는
immutable program이다. 모든 action은 기존 instance를 변경하지 않고 새로운
`ChartProgram`을 반환한다.

## `action()`

Authoring method를 감싸 호출을 trace에 기록하고, 내부의 wrapped action을
부모 action의 child로 연결한다.

## Primitive actions

- `editSemantic`: semantic property 하나를 생성하거나 수정한다.
- `createGraphics`: concrete graphic object 또는 collection을 생성한다.
- `editGraphics`: 기존 graphic의 concrete property 하나를 수정한다.

세 primitive는 내부 authoring 기반이며 일반적인 user-facing domain API가
아니다.

## Rendering

`render()`는 완전히 구체화된 `graphicSpec`만 읽는다. Semantic state, context,
trace를 사용해 렌더링 시점에 값을 추론하지 않는다.
