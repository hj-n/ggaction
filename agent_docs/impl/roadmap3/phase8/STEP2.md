# STEP 2 — Dataset Dependency DAG and Partition Anchor

## 진행 상태

- [x] Dataset graph validator
- [x] Unique partition-anchor resolution
- [x] Topological replay order
- [x] Branch, cycle, missing ancestor와 ambiguity errors
- [x] Independent graph oracle

Visible layer dataset에서 source 방향으로 dependency graph를 추적한다. Facet field가 존재하고 모든 affected
branch가 공유하는 latest row-preserving dataset을 partition anchor로 선택한다. Cell filter는 이 anchor 뒤,
첫 statistical transform 전에 삽입한다.

Pure resolver는 program을 수정하거나 trace node를 만들지 않는다. Literal graph fixtures로 direct,
prefiltered, regression branch, box sibling branch와 invalid graphs를 검증한다.

구현된 `planFacetDependencies`는 visible layer의 dataset ancestry만 읽어 immutable plan을 반환한다.
`filter`는 row-preserving, regression/density/interval/box transforms는 statistical replay node로 분류한다.
현재 dataset provenance가 action별 단일 transform을 저장하므로 replay 대상 dataset도 정확히 한 transform만
허용하며, unsupported transform은 명시적으로 거부한다.
