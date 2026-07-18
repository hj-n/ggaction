# Roadmap 3 Release Candidate

## 진행 상태

- [x] Roadmap 3 Planned inventory zero
- [x] Current contract, exact TypeScript와 package export 동기화
- [x] Normal, render, browser, coverage와 installed-package 검증
- [x] Built documentation과 desktop/mobile 검증
- [x] Release note 초안과 version recommendation
- [ ] 사용자 release-candidate 승인
- [ ] Version 변경, tag, GitHub release와 npm publish

## 권고 version

첫 Roadmap 3 release는 `0.1.0`을 권고한다. 현재 `0.0.2` 이후 Polar coordinate, program composition, facet,
text/rect와 focused editing이라는 큰 public capability가 추가됐으므로 patch보다 pre-1.0 minor version이 의미에
맞다. 이 문서를 작성한 시점에는 `package.json`과 lockfile version을 변경하지 않았다.

## Release 범위

- Polar point, line/radar와 arc/donut/rose/radial-bar authoring
- Theta/radius axes와 grids, Polar selection/highlight와 Canvas/PNG output
- `hconcat`, `vconcat`, nested immutable snapshots, layout editing과 stable child replacement
- Cartesian `facet`의 derived-data replay, shared/independent scales, outer axes와 compatible shared legends
- Focused mark/guide/composite edits와 domain-level removal
- Horizontal grouped bars, text annotation, rect heatmap과 directional offsets
- Compatible temporal aggregate bar/line shared-position inference
- Cross-feature nested Polar composition과 Cartesian facet integration

## 검증 결과

2026-07-19 기준:

| 검증 | 결과 |
| --- | --- |
| Normal suite | 1,518 passed |
| PNG/render suite | 113 passed |
| Browser suite | 29 passed |
| Coverage | 94.87% lines, 90.09% branches, 98.49% functions; 52 critical floors passed |
| Roadmap galleries | Roadmap 2 77 variants, Roadmap 3 33 variants; exact primitive/public pairs verified |
| Package artifact | 301 entries; package audit passed |
| Installed consumer | Node 20, 22, 24; JS, TypeScript, extension, PNG, Polar, concat와 facet passed |
| Documentation | source 14 passed; Jekyll build, built checks와 desktop/mobile browser checks passed in CI |
| GitHub CI | `a7baa90` run `29650660321` passed all jobs |

로컬 `npm run docs:verify`는 source generation과 14개 docs test까지 통과한 뒤 설치되지 않은 Jekyll executable에서
중단됐다. Repository CI는 문서 runtime을 설치한 뒤 동일 commit의 Jekyll build와 browser 검증을 완료했으므로
문서 product 검증은 통과로 분류한다.

## Current limitation

- Polar program은 direct 또는 nested concat child로 지원한다.
- Polar source `facet`은 theta/radius facet scale과 guide resolution이 구현되지 않아 partial state를 만들기 전에
  명확한 validation error를 낸다.
- SVG, animation, interaction runtime과 automatic semantic-to-graphic compilation은 이번 release 범위가 아니다.

## 승인 뒤 수행할 작업

1. `0.1.0`으로 package와 lockfile version을 올린다.
2. `CHANGELOG.md`의 Unreleased 내용을 `0.1.0` release section으로 확정한다.
3. Release artifact, installed consumers, tests와 documentation CI를 다시 확인한다.
4. Release commit/tag를 push하고 GitHub release와 npm package를 publish한다.
5. Published package 설치와 documentation link를 외부 소비자 기준으로 smoke test한다.
