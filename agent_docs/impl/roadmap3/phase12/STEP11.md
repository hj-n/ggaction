# STEP 11 — 0.0.4 Release Candidate and Gate D

## 진행 상태

- [x] Version/package-lock을 `0.0.4`로 갱신
- [x] Repository metadata, README, docs, examples와 generated references 일괄 갱신
- [x] CI verification과 release-only Pages deployment 분리
- [x] `0.0.4` changelog와 release notes 작성
- [x] Exact tarball, hash, provenance input과 fresh consumer 검증
- [ ] Gate D 코드/docs/artifact 승인

일반 `main` push는 docs를 build/test할 수 있지만 public site를 배포하지 않는다. Pages는 approved release tag의
exact artifact만 배포한다.

## Gate D 후보 근거

### 공개 identity와 문서

- Package, lockfile, README와 docs version은 `0.0.4`로 일치한다.
- Canonical repository는 `https://github.com/ggaction/ggaction`이고 public docs URL은
  `https://ggaction.github.io/ggaction/`이다.
- `release.yml`은 protected npm publish가 성공한 exact tag checkout에서만 Pages artifact를 만들고 배포한다.
- Pages source는 GitHub Actions workflow로 전환했다. Public metadata commit
  `4322de0350e5b542e5643c6f9da4fef9b69341f9`의 ordinary `main` push에는 Pages deployment가 생성되지 않았다.

### 검증

- Normal: `1545/1545` passed.
- Coverage: `94.89%` lines, `90.22%` branches, `98.54%` functions와 critical floor `55/55` passed.
- Browser: `29/29` passed.
- Render: `113/113` passed; Roadmap 2와 Roadmap 3 gallery browser verification passed.
- Docs: source `27/27`, built page `83`개, desktop search와 `320px`, `390px`, `768px` viewport passed.
- Package: bounded artifact audit, Node `20/22/24`, JavaScript, extension, PNG, TypeScript, tutorial consumer와
  private-export rejection passed.
- Remote CI run `29676513801` passed all `test`, `coverage`, `documentation`, and Node `20/22/24` package jobs.

### Exact package artifact

- File: `.artifacts/release/ggaction-0.0.4.tgz`
- Entries: `320`
- Packed: `279448` bytes
- Unpacked: `1298418` bytes
- SHA-1: `4d23c4a201f7eec51e5f0a332d0c1c958fb4114a`
- SHA-256: `ba5df62a69d657764e4bea55d07dc13d6e03e2ee2ccfaf20dfc1b67368a745c0`
- Exact tarball을 새 임시 consumer에 설치해 Node, extension, PNG, numeric font weight, legend offset,
  sequential palette count, strict TypeScript, tutorial consumer와 private export rejection을 다시 검증했다.
- Release notes는 `CHANGELOG.md`의 `0.0.4` section에서 생성했으며 artifact는
  `.artifacts/release/ggaction-0.0.4-release-notes.md`에 있다.

Gate D에 제시하는 exact tag commit은 이 근거 기록을 포함한 최종 clean `HEAD`이다. 이 문서만 추가한 뒤
tarball hash가 동일한지 다시 확인하고 remote CI가 통과하면 후보를 고정한다. 승인 전에는 tag, npm publish,
GitHub Release와 public Pages deployment를 생성하지 않는다.
