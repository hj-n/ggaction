# STEP 12 — Publish and Roadmap 3 Closeout

## 진행 상태

- [x] Annotated `v0.0.4` tag 생성
- [x] Approved tarball을 npm `latest`로 publish
- [x] Matching GitHub Release 생성
- [x] Exact release docs를 Pages에 deploy
- [x] npm metadata, provenance, install, URLs와 redirects 검증
- [x] Phase 12/Roadmap 3 final report와 clean worktree 확인

npm version, tag, GitHub Release, Pages와 recorded artifact hash는 같은 commit을 가리켜야 한다.

## 최종 릴리스 결과

- Release tag: annotated `v0.0.4`
- Tag object: `2e5f1c40556803c1e1e3ade95a37852ddfe952d0`
- Package source commit: `05af0d594b3c603447b4c0138d543221ebfd0a9a`
- Successful release workflow: `29678438743`
- npm: `ggaction@0.0.4`, `latest = 0.0.4`
- GitHub Release: `https://github.com/ggaction/ggaction/releases/tag/v0.0.4`
- Public docs: `https://ggaction.github.io/ggaction/`
- Previous repository URL redirects from `https://github.com/hj-n/ggaction` to the organization repository.

### Published registry artifact

- Entries: `320`
- Packed: `279954` bytes
- Unpacked: `1298418` bytes
- SHA-1: `b5d01d899ac4c2c1181183a0057afe8a959c17a1`
- SHA-256: `1238852857e2163ac9577deb6fdff505fdf89e9aadaa8d81d8a239582600f97f`
- The retained workflow artifact and downloaded npm registry tarball are byte-for-byte identical.
- A fresh registry install passed Node, extension, PNG, strict TypeScript, tutorial consumer and private-export checks.

### Gate artifact 차이와 provenance 예외

Gate D에서 로컬로 만든 tarball의 SHA-256은
`ba5df62a69d657764e4bea55d07dc13d6e03e2ee2ccfaf20dfc1b67368a745c0`이었다. Canonical Linux release
runtime이 만든 archive와 압축 바이트는 달랐지만 두 archive의 `320`개 추출 파일은 모두 동일했다. Published
artifact는 release workflow가 한 번 만들고 qualification과 publish가 그대로 재사용한 artifact이다.

npm은 GitHub Actions OIDC publisher, npm publish attestation과 SLSA provenance를 제공한다. 다만 `0.0.4`는
workflow를 `main` ref에서 dispatch했기 때문에 SLSA builder ref와 resolved workflow dependency가
`refs/heads/main@85e7385d6dcbc90d6498ced45d8a1d5030183936`으로 기록됐다. Package candidate, annotated tag,
GitHub Release와 Pages source는 승인된 `05af0d5` commit으로 검증됐지만, provenance의 workflow source ref까지
같은 commit이라는 원래 완료 조건은 엄밀히 충족하지 않는다.

후속 workflow commit `9bedc61`은 실제 `GITHUB_REF`가 exact annotated tag ref가 아니면 release를 거부하고
합성 ref 사용을 금지한다. 앞으로 Gate evidence는 publish job이 재사용할 canonical-runtime artifact를 기준으로
제시한다.

첫 release run `29678327218`은 Chromium 설치보다 package consumer가 먼저 실행된 ordering defect로 publish 전에
중단됐다. Commit `85e7385`가 순서를 고쳤고 contract test로 고정했으며, 성공 run에서 모든 qualification을 다시
수행했다.
