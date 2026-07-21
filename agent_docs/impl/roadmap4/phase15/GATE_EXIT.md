# P15-Exit — Public docs and release-readiness closeout

## 상태

- Gate: `P15-Exit`
- 상태: `approved`
- 승인: `2026-07-21` 사용자 명시 승인 (`승인해. release 직전으로 준비`)
- Candidate checkpoint: `6f9411c` (`approve phase 15 public docs gate`)
- Package: `ggaction@0.0.4`
- Remote: `origin/main`
- 승인 결과: Phase 15와 Roadmap 4 completed 전환, release preparation 허용

## 완료 범위

- D-001 sticky-header fragment offset을 shared CSS custom property chain으로 수정했다.
- Direct hash, heading permalink와 TOC link가 desktop/mobile h2/h3에서 같은 computed pixel offset을 사용한다.
- Point radius, direct line authoring order와 inherited rule datum precedence를 Current runtime과 일치하게 공개했다.
- 여덟 facade의 shortest decision, inference, guide lifecycle와 edit handoff를 누적 감사했다.
- Current declarations, action reference, capabilities, metadata, search, images와 LLM bundle을 재생성·검증했다.
- Version/tag/publish/deploy 없이 exact package artifact와 isolated consumer를 검증했다.

## Release-readiness summary

| 항목 | 결과 |
| --- | --- |
| Candidate | `6f9411cbb2eb7cdc13d3dceec1ceff4c5dc1ce30` |
| Version | `0.0.4` |
| Tarball SHA-256 | `3e1acedc0591cc70a280a4eee38fbd2f3a6647a3afd91cbf597459add3e7b136` |
| Normal / coverage | `1,830/1,830`; 94.63% lines, 89.93% branches, 98.72% functions |
| Browser / render | `47/47`; `124/124` |
| Docs | `36/36`; 110 built pages; 320/390/768px pass |
| Galleries | approved 123; active review 0 |
| Package | 380 entries; installed JS/TS/Browser consumer pass |

Full command/evidence detail: [RELEASE_READINESS.md](./RELEASE_READINESS.md).

## Compatibility와 non-goals

- Runtime API, semantic/graphic schema, renderer와 chart pixels는 P15에서 변경하지 않았다.
- Existing package entry points와 version remain unchanged.
- No release tag, npm publish, GitHub release, PR or documentation deployment was created.
- Historical roadmap records were not rewritten as Current contracts.

## 승인 요청 범위

1. D-001과 public docs cumulative audit를 Current documentation baseline으로 확정
2. Candidate commit/version/tarball checksum과 누적 검증을 release-ready evidence로 채택
3. Phase 15와 Roadmap 4를 completed로 닫고 active Phase를 비우는 것 승인
4. 실제 publish/deploy는 별도 요청 전까지 수행하지 않는 경계 확인

사용자 승인으로 위 네 항목을 확정했다. Release version/tag/publish/deploy는 별도 release-candidate
체크포인트가 소유한다.
