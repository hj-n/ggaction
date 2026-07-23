# Gate R42-P1-A — Renderer Target Boundary

## Gate state

`planned`

## Review target

Phase 1 source와 evidence를 구현한 뒤 다음을 검토한다.

1. Public Canvas adapter만 backing-store, CSS dimension, `pixelRatio`, scale와 clear를 소유한다.
2. Internal resolver는 program의 `graphicSpec`과 exactly one root canvas/dimension만 읽는다.
3. Internal drawer는 Canvas 2D-compatible drawing context와 resolved concrete target만 읽는다.
4. PDF-like vector context는 `.canvas`, `clearRect`, `scale` 없이 concrete tree를 그릴 수 있다.
5. Existing Browser Canvas와 Node PNG observable behavior는 바뀌지 않는다.

## Required evidence

- Exact source diff
- Focused target-boundary test
- Existing Canvas/PNG unit tests
- Full unit/contract results
- Public export/package diff가 없다는 확인
- Remote checkpoint

## Approval effect

Approval은 browser-safe SVG renderer Phase 2 구현을 허용한다. PDF와 distribution closeout은 각 후속 Gate까지
차단된다.

## Work blocked before approval

- `ggaction/svg` runtime/types/package/docs
- `ggaction/pdf` runtime/types/package/docs
- Phase 2 이후 implementation
