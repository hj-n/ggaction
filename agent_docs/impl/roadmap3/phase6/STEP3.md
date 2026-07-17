# STEP 3 — Namespaced Child Graphic Snapshot

## 진행 상태

- [x] Complete child graphic tree preflight
- [x] Deterministic ancestry namespace
- [x] Attachment, item ID와 order rewrite
- [x] Same local ID collision과 nested snapshot coverage

Snapshot은 child `graphicSpec`을 mutation 없이 복사하며 모든 named object, attachment와 generated item ID를
composition ancestry로 namespace한다. Renderer는 retained child program을 재귀적으로 읽지 않는다.
