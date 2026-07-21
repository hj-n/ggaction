# ggaction 0.0.5 release candidate

## 진행 상태

- [x] Roadmap 4 P15-Exit 승인과 closeout
- [x] Patch version `0.0.5` 추천 및 package/lock/docs version 정렬
- [x] Changelog와 generated release notes 준비
- [ ] Final candidate commit의 전체 qualification과 checksum
- [ ] Annotated `v0.0.5` tag 생성
- [ ] Protected Release workflow dispatch
- [ ] npm/GitHub Release/Pages 결과 검증

## Version 결정

`0.0.4`는 이미 공개되었고 Roadmap 4의 surface는 additive capability와 backward-compatible repair다. 현재
pre-1.0 release sequence와 일치하도록 다음 candidate를 `0.0.5`로 준비한다. Package, lockfile, docs version,
README status, hard-coded package tests와 changelog가 같은 version을 사용한다.

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
