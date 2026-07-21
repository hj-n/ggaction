# Phase 15 release-readiness report

## Candidate identity

| 항목 | 값 |
| --- | --- |
| Candidate source checkpoint | `6f9411cbb2eb7cdc13d3dceec1ceff4c5dc1ce30` |
| Branch / remote | `main` / `origin/main` |
| Package | `ggaction@0.0.4` |
| Tarball | `.artifacts/release/ggaction-0.0.4.tgz` |
| Entries | `380` |
| Packed / unpacked bytes | `344,427` / `1,614,341` |
| SHA-1 | `bfb75c8f8a407cd474c10a89f45d5d0d18e791f1` |
| SHA-256 | `3e1acedc0591cc70a280a4eee38fbd2f3a6647a3afd91cbf597459add3e7b136` |

Gate/report-only commits after the candidate modify `agent_docs/`, which is excluded from the package artifact. The
canonical tarball was produced twice from the same package surface and returned the same filename, sizes, SHA-1 and
SHA-256.

## Cumulative verification

| Verification | Result |
| --- | --- |
| Full normal suite | `1,830/1,830` pass |
| Coverage | lines `94.63%`, branches `89.93%`, functions `98.72%`; critical floors `68/68` pass |
| Browser Canvas/package example suite | `47/47` pass |
| Full Node PNG/render suite | `124/124` pass |
| Approved artifact gallery | `123` variants verified |
| Active-review gallery | `0` variants verified |
| Documentation source/generated suite | `36/36` pass |
| Built documentation | `110` pages checked |
| Docs browser | desktop search/accessibility/no-JS and every page at `320px`, `390px`, `768px` pass |
| Action catalog | generated catalog freshness pass |
| Package artifact | `380` entries and size ceilings pass |
| Installed-package consumer | default, extension, PNG, TypeScript, Browser/tutorial and private-export rejection pass |
| Deterministic tarball | two packs produced identical SHA-1/SHA-256 and sizes |
| Repository whitespace | `git diff --check` pass |

Package-consumer coverage includes numeric font weight, point jitter, path order, window data, 2D bin/binned heatmap,
Parallel Coordinates, Horizon, violin plot, categorical legend offset and sequential palette count.

## Release boundary

- `package.json` remains version `0.0.4`.
- No tag points at the candidate checkpoint.
- No npm publish, GitHub release, PR or GitHub Pages deployment was performed.
- Documentation was generated, built and tested locally only.
- The tarball exists under ignored `.artifacts/release/` and is evidence, not a committed binary.
- P15-Exit approval closes Roadmap 4 readiness only; publishing or deployment still requires a separate request.

## Environment note

Chromium/local HTTP and package-consumer checks ran with the required macOS sandbox approval. Documentation used the
repository-pinned `mise ruby@3.2.6` and locked bundle. No test failure was waived.
