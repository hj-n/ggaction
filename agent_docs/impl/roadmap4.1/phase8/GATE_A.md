# Gate R41-P8-A — Facet Policy Editing

## Gate state

`ready-for-review`

Phase 8 implementation, Current contract synchronization and full verification are complete at functional checkpoints
`1726d2aa`, `2dcdd971` and `b818e1ce` on `origin/codex/roadmap4-1-lifecycle`. User approval is not recorded yet.

## Review target

Phase 8의 facet columns layout edit, scale/guide policy partial edit, retained-unit child rederivation과 atomic parent
snapshot replacement vertical slice 전체다.

## Exact public calls

```javascript
faceted.editCompositionLayout({ columns: 2 });
faceted.editFacetScales({ x: "independent", color: "shared" });
faceted.editFacetGuides({ axes: "outer", legend: "shared" });
```

Omitted layout, scale와 guide option은 current composition intent를 보존한다. `columns`는 facet-only이며 concat에서
거부한다. `editFacetScales`는 최소 한 used channel의 effective policy change를 요구하고 equivalent/unused channel을
거부한다. `editFacetGuides`는 최소 한 supplied policy를 요구하며 equivalent non-empty request도 canonical rederivation을
수행하는 desired-state edit로 허용한다.

## Resolution, preflight and trace

- `editCompositionLayout`은 composition scope에서 complete option object를 먼저 검증한다. Facet이면 current child
  descriptors와 supplied/current columns, gap, align, padding으로 `resolveFacetLayout`을 실행하고 columns를 포함한
  complete layout intent와 parent snapshot만 교체한다. Child object references, field/data/value order와 policies는
  그대로다. Concat에서 supplied columns는 state change 전에 명시적으로 실패한다.
- Scale edit는 current full channel policy에 supplied used-channel patch를 merge한다. Same scale ID를 사용하는 channel의
  shared/independent conflict, invalid value, unused channel과 no effective change를 먼저 거부한다. Omitted channel은
  current policy를 보존한다.
- Guide edit는 current axes/legend policy에 partial patch를 merge하고 `axes: "each" | "outer"`,
  `legend: false | "shared"` complete candidate를 만든다. Empty object는 거부하고 omitted guide policy와 all scale/layout
  intent는 보존한다.
- Both policy actions reconstruct the exact current facet definition from parent-retained semantic/materialization state:
  facet ID, partition anchor data, field, stored first-appearance values and deterministic child IDs. A retained child provides
  the unit graphic seed while parent state restores canonical source semantics, resolved scales, mark/guide/title/selection/
  highlight configs and the child's original unit Canvas config; parent-only facet config is not copied into the unit template.
- `deriveFacetChildren` then repeats canonical `filterData`, transform-specific `replayDerivedData`, explicit
  `rebindLayerData`, scale/mark/guide materialization and highlight replay for every stable child ID. Shared histogram x fixes
  one boundary set; independent x restores each child's requested bin policy and local domain. Parent trace records one
  `useProgram` per replaced child followed by `materializeComposition`; child traces retain their replay operations.
- Complete child derivation, scale resolution, outer-axis ownership, shared-legend compatibility and parent snapshot are run
  on a speculative immutable branch first. Failure discards that branch. The validated actual branch is returned once, so the
  previous parent, child programs, source rows, caller options, unrelated state and trace remain unchanged on rejection.

## Resulting state and compatibility

- Columns 1→2 changes only `compositionSpec.columns`, parent Canvas placement and header/title anchors. Existing child object
  lookup and references are retained exactly; concat layout behavior and `replaceCompositionChild` boundaries are unchanged.
- Shared→independent x replaces child programs under the same IDs and yields local domains such as `[0, 10]` and
  `[100, 110]`; omitted y remains shared. Stored parent title stays parent-owned, child titles remain stripped and existing
  point selection/highlight intent is replayed into the revised child graphics.
- Histogram shared x children retain one explicit resolved boundary set. Editing x independent removes that shared override,
  restores requested `{ maxBins }` provenance and recomputes cell-local domains/bars.
- `axes: "outer"` uses current occupied topology: with one column and two cells only the bottom child's x axis remains while
  both left-edge y axes remain. `legend: "shared"` removes repeated child guide graphics and creates one parent-owned concrete
  legend. Incompatible independent legend scales reject the entire call.
- Runtime, strict declarations, Current `COMPOSITION.md`, `ACTION_INDEX.json`, generated catalog/reference/search/LLM docs,
  public composition API and installed package TypeScript consumer are synchronized. `editFacetScales`, `editFacetGuides` and
  `facet-policy-editing` are absent from Planned inventory.
- No new chart, gallery variant, renderer, persisted state field, package entry point or Polar facet behavior was added.
  `SECOND_ARCHITECTURE.md` now records the deliberate retained-unit rederivation lifecycle.

## Required evidence

- Facet-only dispatch and complete layout/policy preflight
- Stable field/data/value/child identity and retained header/title/layout intent
- Shared/independent scale child rederivation and derived-data replay
- Each/outer axis ownership and compatible shared-legend promotion
- Selection/highlight replay and immutable previous parent/children/caller inputs
- Downstream failure atomicity and unrelated state preservation
- Existing concat/facet compatibility and focused/cumulative/Browser/PNG/package evidence

## Verification evidence

- Focused composition/facet/source-boundary suite: 37/37 pass. Exact Current contract/inventory/Canvas/Node-PNG and visual
  capability batch: 21/21 pass. Public docs suite: 37/37 pass; all catalog/signature/capability/action/reference/metadata/search
  freshness checkers pass.
- Normal cumulative suite: 1,911/1,911 pass. Coverage is 94.73% lines, 90.08% branches and 98.45% functions; all 68 critical
  floors pass.
- Node render suite: 124/124 pass; generated 123 approved variants and zero active-review variants. Both galleries pass
  Playwright loading verification. No Phase 8 chart/gallery variant was added.
- Shared Playwright Browser suite: 47/47 pass, including direct-source facets, facet resolution, packed default entry, every
  public logical Canvas size, high pixel density and no console/page errors.
- Exact Gate contract authors a three-cell facet, changes columns 1→2, x shared→independent and guides each/false→outer/shared,
  then renders six point glyphs plus two shared-legend symbols through mock Canvas and a non-empty Node PNG at 2×.
- Package boundary: 383 entries, 361,180 packed bytes and 1,707,586 unpacked bytes; bounded entry, 400KB packed and
  1,710,000-byte unpacked ceilings pass.
- Installed package consumer passes Node, extension, PNG, TypeScript, tutorial, private-export and all compatibility probes,
  including exact typed facet policy calls. Tarball SHA-256 is
  `2279b062f2c86f8911be3ea6df2c8ac01a42cf52c54bc6f600bd26689879540e`.
- `git diff --check` and agent-doc navigation 7/7 pass. Verified functional remote checkpoints: `1726d2aa` (runtime/types/tests),
  `2dcdd971` (contracts/architecture/docs) and `b818e1ce` (package consumer) on
  `origin/codex/roadmap4-1-lifecycle`.

## Approval effect

Approval은 Phase 8 facet policy editing 결과를 고정하고 Phase 9 cross-capability regression, inventory/docs/package
closeout을 허용한다. PR creation, npm publishing과 docs deployment 권한은 포함하지 않는다.

## Work blocked before approval

Phase 9 cross-capability regression, inventory/docs/package closeout.
