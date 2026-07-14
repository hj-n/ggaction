# Planned Primitive contracts

These contracts are accepted or pending future API work; they are not current public behavior.

## graphic parent attachment

```typescript
createGraphics({
  id: UserId;
  type: GraphicType;
  length?: NonNegativeInteger;
  parent?: UserId;
  before?: UserId;
  after?: UserId;
}): ChartProgram;
```

- `parent`를 생략하면 existing top-level behavior를 유지한다. 지정하면 existing `canvas` 또는
  `collection`을 parent container로 요구하며 새 graphic을 그 container의 direct child로 붙인다.
- graphic ID는 tree depth와 무관하게 program 전체에서 unique하고 같은 selector로 조회할 수 있다.
  self-parent, duplicate ID, unknown/non-container parent와 attachment cycle은 오류다.
- `before`와 `after`는 계속 mutually exclusive이며 parent를 지정하면 같은 parent의 direct sibling만
  anchor로 사용할 수 있다. 다른 parent 또는 top-level anchor를 섞으면 오류다.
- Equivalent repeated creation은 type, length, parent와 sibling placement가 모두 같을 때만 idempotent다.
  Existing graphic의 parent를 바꾸는 reparent operation은 이 contract에 포함하지 않는다.
- Attachment는 ownership과 deterministic rendering order만 정의한다. 좌표 변환, clipping 또는 layout을
  암시하지 않으며 child geometry는 계속 concrete Canvas coordinates다. Composition action이 필요한
  위치를 먼저 materialize한 뒤 resulting graphic root를 attach해야 한다.
- Renderer는 Canvas부터 ordered child tree를 depth-first로 방문한다. Container는 backend-neutral하며
  renderer-specific `svg` 또는 `g` node를 semantic/graphic schema에 추가하지 않는다.
- Update는 modified ancestor path만 structural copy하고 이전 program과 caller-owned child data를
  보존한다. Parent attachment가 생기면 raw top-level iteration에 의존하는 consumer를 tree traversal로
  함께 전환한다.
- Status: Planned, NOT IMPLEMENTED. top-level compatibility, Canvas/collection parents, nested lookup,
  sibling ordering, idempotence/conflicts, cycle rejection, immutable updates와 renderer order coverage가 필요하다.
