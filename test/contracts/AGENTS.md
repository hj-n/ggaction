# Contract Test Instructions

Apply these instructions to architecture, package, inventory, discovery, and coverage contracts.

- Encode mechanically verifiable architecture rules in focused tests. At minimum, enforce selector behavior, package boundaries, concrete-graphic validation, and materialization-plan ordering and deduplication.
- Keep cross-cutting invariants in `test/contracts/` and test the canonical machine-readable or implementation owner rather than prose placement.
- Keep named capability selectors in `test/capabilities.json`; reject unknown names and map them to explicit files or prefixes rather than filename substrings.
- Keep normal, render, and browser discovery exhaustive and mutually intentional. Reject test modules that no suite or module-script entry reaches.
- Preserve the global source coverage threshold and critical family/file floors so high aggregate coverage cannot hide regressions in state, grammar, policy, renderer, or adapter boundaries.
- Apply critical-family coverage floors automatically to new high-risk policy, selection, and renderer modules; use explicit overrides only when a stricter floor is justified.
- Test public runtime exports, TypeScript declarations, package export maps, browser safety, and packed artifact contents as one package-boundary contract.
- Keep current action inventory, lifecycle, status, evidence paths, and generated catalog mechanically synchronized with `ACTION_INDEX.json` and owning current contracts.
- Prefer semantic invariants and exact ownership assertions over broad snapshots. Snapshots may supplement but never replace focused contract evidence.
