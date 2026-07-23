# ggaction 0.0.7 release record

## 진행 상태

- [x] Roadmap 4.2 SVG/PDF renderer 구현과 closeout
- [x] Canvas, SVG, PNG, PDF renderer 문서와 runtime signature 정렬
- [x] Example index, LLM routes, Getting Started와 contributor verification 개선
- [x] Package, lockfile, README와 docs version을 `0.0.7`으로 정렬
- [x] Changelog와 generated release notes 준비
- [x] Final candidate commit의 local/remote qualification
- [x] Annotated `v0.0.7` tag 생성과 push
- [x] Exact-tag protected Release workflow와 `npm-release` 승인
- [x] npm, GitHub Release와 GitHub Pages 결과 검증

## Version 결정

`0.0.6` 이후 browser-safe SVG와 Node vector PDF renderer, `ggaction/basic` browser entry, renderer 간 numeric
font-weight 정규화, installed-consumer 검증과 문서 전수 개선이 누적되었다. 기존 pre-1.0 release sequence와
일치하도록 다음 version을 `0.0.7`로 정하고 package, lockfile, README status, docs config, generated LLM bundle,
package contract test와 changelog를 같은 version으로 정렬했다.

## Qualification 증거

Final release commit은 `81a1e129f3dd5bcef419f65304c2c256fd40d6f5`이며 annotated `v0.0.7` tag가 이
commit을 가리킨다. Exact tag ref에서 실행한 Release workflow `30019063191`이 다음 검증을 모두 통과했다.

- 전체 테스트: `1,939/1,939` 통과
- coverage: line `94.67%`, branch `90.04%`, function `98.45%`; critical floor `68/68` 통과
- Browser Canvas와 packed browser entry: `47/47` 통과
- Node PNG: `124/124` 통과; approved gallery `123`, active review `0`
- 문서: 정적 페이지 `111`, 320/390/768px 브라우저 검증 통과
- generated contract/docs drift, package contents, installed JavaScript/TypeScript consumer 검증 통과
- canonical package: entry `399`, packed `370,944` bytes, unpacked `1,748,100` bytes

## Release 결과

- Final workflow: `30019063191`, final conclusion `success`, dispatch ref `v0.0.7`
- Canonical tarball SHA-1: `796d71e9fa3fd3a09bf97b69748132da49601835`
- Canonical tarball SHA-256: `f9c244bac711d5de5fd90fe1a4df0df3f33c08639904cda2e29d873fdcd37650`
- npm `ggaction@0.0.7`의 `dist.shasum`은 canonical SHA-1과 정확히 일치하며 `latest`는 `0.0.7`이다.
- GitHub Release `v0.0.7`는 draft나 prerelease가 아닌 public release다.
- GitHub Pages는 exact tag에서 빌드되어 `/ggaction/` 문서와 base-path 내부 검색 결과를 제공한다.

Final workflow의 publish job은 앞선 동일 candidate 배포를 registry SHA-1으로 확인하고 npm publish를
의도대로 건너뛴 뒤 GitHub Release를 검증·정렬했다. Pages build와 deploy는 exact tag source에서 다시
성공했다.

## 실행 경위와 복구

첫 실행 `30016636658`은 workflow ref를 `main`으로 선택해 exact-tag guard에서 중단되었다. 이를 workflow
오류로 오인해 manual-main 호환 변경을 PR `#17`로 반영했고, 실행 `30017669587`이 exact tag를 checkout하여
canonical artifact를 검증하고 최초 npm publish, GitHub Release와 Pages deploy를 완료했다.

저장소 규칙을 재확인한 뒤 workflow ref 자체도 tag여야 함을 확인했다. `v0.0.7` ref에서 final workflow
`30019063191`을 다시 실행해 동일 canonical SHA를 검증했으며 중복 npm publish는 수행하지 않았다. Closeout은
exact-tag guard를 복원해 이후 release가 같은 운영 경계를 따르도록 한다.

`actions/upload-artifact@v4`와 `actions/download-artifact@v5`의 Node 20 deprecation annotation이 있었지만
GitHub가 Node 24로 실행했고 release 결과에는 영향을 주지 않았다.

## Release 실행 경계

Package publish와 documentation deploy는 사용자의 별도 실행 승인 후 수행했다. Verify job이 exact annotated
tag에서 만든 하나의 canonical artifact를 protected publish job이 그대로 재사용했고 npm, GitHub Release와
Pages는 모두 같은 tag commit을 기준으로 생성되었다. 이 기록과 exact-tag guard 복원 commit은 release tag
이후의 내부 closeout 변경이며 배포된 package 또는 Pages artifact를 변경하지 않는다.
