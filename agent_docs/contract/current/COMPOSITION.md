# Current program composition actions

## `editCompositionLayout`

- Signature: `editCompositionLayout({ gap?, align?, padding? })`.
- Requires an existing composition program and at least one layout option.
- `gap`: non-negative finite distance between adjacent child slots.
- `align`: `"start" | "center" | "end"` on the cross axis.
- `padding`: a non-negative scalar for all sides or a partial `{ top?, right?, bottom?, left? }` patch.
- Effect: preserves the ordered child IDs and child program references, then rebuilds the complete parent snapshot
  from canonical child state. Omitted options preserve current values.

### Formal values — `editCompositionLayout`

- Implemented: `editCompositionLayout({ gap?: NonNegativeFinite; align?: "start" | "center" | "end"; padding?: NonNegativeFinite | Partial<FourSidePadding> }): ChartProgram`.
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `editCompositionLayout`

- ✅ Covered: scalar and partial padding, every alignment, gap, child preservation, immutable earlier program,
  complete rematerialization and invalid option rejection.
- Evidence: `test/unit/actions/composition/concat.test.js`, `test/gates/program-composition/public.test.js`.

## `replaceCompositionChild`

- Signature: `replaceCompositionChild({ target, program })`.
- `target`: one existing child slot ID.
- `program`: one complete unit or nested composition `ChartProgram` with no unfinished action stack.
- Effect: preserves the target ID, slot order and all sibling references, replaces only the named child, then
  rebuilds the complete parent snapshot. The child program itself remains immutable and is retained by reference.

### Formal values — `replaceCompositionChild`

- Implemented: `replaceCompositionChild({ target: UserId; program: CompleteChartProgram }): ChartProgram`.
- Proposed (NOT IMPLEMENTED): —

### Value coverage — `replaceCompositionChild`

- ✅ Covered: unit replacement, nested-child eligibility, slot/order preservation, immutable source and sibling
  identity, namespaced snapshot rebuilding, unknown target and incomplete child rejection.
- Evidence: `test/unit/actions/composition/concat.test.js`, `test/gates/program-composition/public.test.js`,
  `test/gates/program-composition/png.render.js`.
