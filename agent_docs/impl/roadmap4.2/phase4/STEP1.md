# STEP 1 — Close the Renderer Consumer Matrix

## 진행 상태

- [ ] Concrete node/path/paint/structure/behavior matrix 정의
- [ ] Canvas/PNG/SVG/PDF executable evidence 매핑
- [ ] Package runtime/type/export/installed-consumer audit
- [ ] Browser dependency graph와 Node adapter isolation audit
- [ ] Public docs/generated docs/architecture stale wording audit
- [ ] Approved SVG/PDF artifact ownership 확인
- [ ] Cumulative verification 실행
- [ ] Remote checkpoint 기록

## Consumer matrix policy

Matrix는 현재 backend-neutral concrete output에만 한정한다. `canvas`, `collection`, `circle`, `rect`, `line`,
`text`, `path`, `M/L/C/Z`, solid/linear-gradient fill, stroke/dash/opacity, authored order와 nested Canvas clipping을
행으로 두고 각 renderer의 focused 또는 all-public-chart executable evidence를 연결한다.

Renderer-specific output contract는 별도 행으로 유지한다.

- Canvas: logical drawing과 optional raster density
- PNG: Node file, physical dimensions와 `pixelRatio`
- SVG: deterministic complete document, viewBox와 optional title/description
- PDF: one logical-size vector page, selectable text와 optional metadata

## Distribution audit

`package.json` export, runtime named export와 declaration value export는 exact set으로 비교한다. Browser bundle
evidence는 default/basic/svg만 허용하고 Node filesystem/native dependency는 png/pdf entry 뒤에만 둔다.
Installed tarball consumer는 JavaScript와 TypeScript에서 여섯 public entry를 실제 import한다.

Public docs는 current supported output만 설명하며 SVG/PDF를 limitation으로 남기거나 Canvas/PNG만 전체 renderer로
표현한 stale wording을 제거한다. Historical roadmap/current action evidence는 당시 범위를 보존한다.
