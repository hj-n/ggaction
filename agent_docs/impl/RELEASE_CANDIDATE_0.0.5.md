# ggaction 0.0.5 release candidate

## 진행 상태

- [x] Roadmap 4 P15-Exit 승인과 closeout
- [x] Patch version `0.0.5` 추천 및 package/lock/docs version 정렬
- [x] Changelog와 generated release notes 준비
- [x] Final candidate commit의 전체 qualification과 checksum
- [ ] Annotated `v0.0.5` tag 생성
- [ ] Protected Release workflow dispatch
- [ ] npm/GitHub Release/Pages 결과 검증

## Version 결정

`0.0.4`는 이미 공개되었고 Roadmap 4의 surface는 additive capability와 backward-compatible repair다. 현재
pre-1.0 release sequence와 일치하도록 다음 candidate를 `0.0.5`로 준비한다. Package, lockfile, docs version,
README status, hard-coded package tests와 changelog가 같은 version을 사용한다.

## Qualification 증거

Package source candidate는 `1e8022bed372ae73ad00a3cbc2bbb5e2e567bd9c`다. 이 문서의 qualification
checkpoint는 `agent_docs/`에만 검증 결과를 추가하므로 배포 tarball의 내용에는 영향을 주지 않는다. Release
tag는 이 checkpoint를 포함한 clean `main` HEAD에만 생성한다.

- 전체 테스트: `1,831/1,831` 통과
- coverage: line `94.63%`, branch `89.94%`, function `98.72%`; critical floor `68/68` 통과
- Browser Canvas: `47/47` 통과
- Node PNG: `124/124` 통과; approved gallery `123`, active review `0`
- 문서: source check `37/37`, 정적 페이지 `110`, 320/390/768px 브라우저 검증 통과
- action catalog drift, package contents check, consumer installation과 private export rejection 통과
- package: `ggaction-0.0.5.tgz`, entry `380`, packed `345,048` bytes, unpacked `1,616,242` bytes
- SHA-256: `9658736bf4b4a16ffea54d462d6776907fcff5ba7e37065e4c8e4a94488e6d33`

README와 documentation home의 product positioning을 정렬한 뒤에도 package artifact의 내용과 checksum은
동일했다. 검증은 release workflow와 같은 package version에서 수행했으며, generated docs와 package artifact를
다시 생성해도 의도한 문서 변경 외의 tracked worktree가 변하지 않았다.

## Release 직전 경계

준비 완료 시 repository에는 exact candidate commit과 생성 가능한 release notes/tarball만 남는다. 다음 사용자
release 명령 전에는 annotated tag를 만들지 않고 Release workflow를 dispatch하지 않으며 npm, GitHub Release와
GitHub Pages를 변경하지 않는다.

실제 release는 다음 순서를 사용한다.

1. Clean final candidate commit에 annotated `v0.0.5` tag를 만든다.
2. Tag를 push한다.
3. `.github/workflows/release.yml`을 exact tag input으로 dispatch한다.
4. Protected `npm-release` 승인을 거쳐 verify job이 만든 단일 artifact를 publish job이 그대로 재사용한다.
5. npm registry, GitHub Release, Pages와 provenance가 같은 tag commit을 가리키는지 확인한다.
