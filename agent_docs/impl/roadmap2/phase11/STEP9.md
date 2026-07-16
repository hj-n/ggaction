# Roadmap 2 — Phase 11 Step 9: Robustness, Architecture and Documentation

## 목표

Hierarchy behavior를 failure, immutability, architecture, extension documentation와 machine-readable evidence에
통합한다.

## 진행 상태

- [x] Unknown, self, non-container and cross-parent attachment errors
- [x] Duplicate attachment, orphan and cycle detection
- [x] Nested sibling placement and subtree removal
- [x] Earlier-program and caller-owned-input immutability
- [x] Renderer rejects invalid trees instead of skipping nodes
- [x] `SECOND_ARCHITECTURE.md` final graphic-tree and drawing-order update
- [x] Current primitive contract, action index and generated catalog evidence
- [x] Extension primitive and public concept documentation
- [x] Built-link, visual coverage, desktop/mobile browser checks
- [x] STEP status, conceptual commits and pushes

## 검증 결과

- Primitive/editor tests cover self, unknown, non-container and cross-parent rejection, frozen attachments and subtree
  removal without changing earlier programs.
- Canvas renderer tests reject orphan, duplicate, cyclic and unknown stored attachments before drawing.
- Current architecture, primitive contract, extension guide and semantic/graphic concept page describe the same
  root/plot/children/items contract; generated LLM documentation and action catalog are fresh.
- Local 1,090-test suite, contract/docs checks and remote coverage/PNG/Jekyll/built-link/browser CI pass.
- Deployed concept and extension pages pass 360px, 768px and 1440px Chromium checks without horizontal overflow,
  console errors or page errors.

## 완료 조건

Source, tests, architecture and public extension documentation describe one hierarchy contract and all mechanically
verifiable invariants are executable.
