# Roadmap 2 — Phase 9 Step 6: Longest Histogram Bar Primitive

## 목표

Final histogram count grain에서 maximum y bar 하나를 raw primitives로 강조하고 Gate B에서 승인받는다.

## 진행 상태

- [x] Independent bin/count rows and unique longest-bar key
- [x] Proof that selection uses semantic count, not concrete pixel height
- [x] Approved fill/stroke/opacity and selected-last order
- [x] Remaining bars, grids, axes and title unchanged
- [x] Primitive program, reference values, manifest and future call chain
- [x] Browser and `primitive.png` checks
- [ ] Gate B user confirmation
- [x] STEP status, conceptual commit and push

## Gate B

Confirm one longest rect is emphasized without changing bin boundaries, counts, scales or neighboring bars.

### Gate B candidate

- Semantic target: `bars/histogram/2`, Japan segment in Displacement `[50, 100)`, count `47`.
- Selection basis: final item channel `y = 47`; no selector reads the concrete `97.916...` pixel height.
- Appearance: gold `#facc15`, dark `#713f12` 2.5px stroke, opacity `1`, selected collection child last.
- Unselected rect properties, grids, axes, legend and title remain byte-for-byte structurally unchanged.
- A separately rematerialized Canvas height preserves the semantic key/count/interval while changing rect `y` and
  `height`.
- Artifact: `.artifacts/test/png/roadmap2/mark-selection/bars-longest-count/primitive.png`.
- Manifest: `test/gates/mark-selection-bars/variants/manifest.js` stores the exact future
  `highlightMarks({ select: { channel: "y", op: "max" }, ... })` chain without a user-facing program.

## 완료 조건

The target bar remains identical under a Canvas-only resize while its concrete geometry rematerializes.
