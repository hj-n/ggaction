# Roadmap 2 — Phase 11 Step 4: Canvas, Plot and Mark Attachment

## 목표

Approved tree를 `createCanvas`와 ordinary mark actions에 연결해 Canvas-first domain flow가 parent parameter 없이
stable plot ownership을 만들게 한다.

## 진행 상태

- [x] `createCanvas` wrapped creation of Canvas and `plot-main`
- [x] Plot container identity, idempotence and collision validation
- [x] Point, line, area, bar and rule automatic plot attachment
- [x] Mark-before/after-encoding order independence
- [x] Incomplete mark empty collection attachment
- [x] Existing extension-authored top-level graphic compatibility
- [x] Mark create/edit/rematerialize trace hierarchy
- [x] Unit, type and immutable-state coverage
- [x] STEP status, conceptual commit and push

## 구현 결과

- `createCanvas`는 wrapped `createGraphics` 호출로 `canvas → plot-main`을 만든다.
- Shared graphic-hierarchy policy가 Canvas-first ordinary mark의 `parent: "plot-main"`을 결정한다. Canvas가 없는
  기존 조립 흐름과 explicit extension graphic은 top-level compatibility를 유지한다.
- Mark는 guide가 먼저 존재해도 첫 axis component 앞에 삽입되며 encoding, edit, rematerialization은 attachment를
  바꾸지 않는다.

## 완료 조건

Every ordinary Canvas-first semantic mark has one stable plot attachment without a new user parameter or duplicated
materialization policy.
