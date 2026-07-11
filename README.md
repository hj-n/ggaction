# ggaction

차트 제작 과정을 immutable action과 계층적 trace로 표현하는 JavaScript
라이브러리다.

현재는 [STEP 1](./agent_docs/impl/STEP1.md)의 프로젝트 기반만 구성된
상태다. `chart()`와 `render()`의 module 경계는 존재하지만 실제 동작은
아직 구현되지 않았다.

## 개발

```bash
npm test
```

현재 계약의 핵심 개념은 [Core concepts](./docs/CORE_CONCEPTS.md), 초기 설계는
[Initial architecture](./agent_docs/INITIAL_ARCHITECTURE.md)를 참고한다.
