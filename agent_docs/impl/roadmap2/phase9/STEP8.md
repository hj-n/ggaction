# Roadmap 2 — Phase 9 Step 8: Line-Series Highlight Primitive

## 목표

Cars Origin line chart에서 Japan series path를 raw primitives로 강조하고 Gate C에서 승인받는다.

## 진행 상태

- [x] Independent Origin series keys and Japan path selection
- [x] Equality selection through one unique path field value
- [x] Proposed accent stroke, width, dash and opacity target
- [x] Complement dimming and selected-last path order
- [x] Matching legend item highlight/dimming plus unchanged axes, grid and title
- [x] Primitive program, reference values, manifest and future call chain
- [x] Browser and `primitive.png` checks
- [ ] Gate C user confirmation
- [x] STEP status, conceptual commit and push

## Gate C

Confirm the entire Japan path—not individual vertices—is highlighted and remains connected and ordered.

Proposed appearance: selected Japan path uses `#dc2626`, `5px`, named `"dashed"` and opacity `1`;
the USA and Europe paths retain their geometry but use opacity `0.16`. The selected path is drawn last.

### Gate C candidate

- Semantic target: `trends/series/2`, the unique `Origin === "Japan"` series with 12 ordered annual points.
- Selection basis: one unique series-level `Origin` field value; no selector reads a vertex or concrete path command.
- Appearance: red `#dc2626`, 5px named `"dashed"`, opacity `1`; USA and Europe use opacity `0.16`.
- The Japan path keeps its original complete `M` + ordered `L` command sequence and moves to the last child.
- Because the selection is exactly one complete categorical `Origin` series, the matching legend symbol receives the
  selected stroke/width/dash while only the USA/Europe symbols use opacity `0.16`. Legend labels remain fully readable
  and byte-for-byte unchanged; legend order also stays unchanged.
- Every non-legend graphic, semantic layer, scale, axis, grid and title remains unchanged.
- A Canvas-only width change preserves `trends/series/2` and its 12 points while remapping concrete x positions.
- Browser gallery verification loaded the 1440×920 primitive with no console warnings or errors.
- Artifact: `.artifacts/test/png/roadmap2/mark-selection/line-series-japan/primitive.png`.
- Manifest: `test/gates/mark-selection-lines/variants/manifest.js` stores the exact future
  `highlightMarks({ select: { field: "Origin", op: "eq", value: "Japan" }, ... })` chain.

## 완료 조건

One path-level semantic selection and its concrete style/order define the future line public result.
