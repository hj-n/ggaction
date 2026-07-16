# Roadmap 2 — Phase 12 Step 3: Minimal Deterministic Package Artifact

## 목표

Registry consumer에게 필요한 파일만 포함하는 deterministic npm tarball을 만들고 현재 과도한 package contents를
기계적으로 차단한다.

## 진행 상태

- [x] Explicit package `files` allowlist designed and applied
- [x] Runtime source, declarations, README, license and required package metadata included
- [x] Tests, examples, internal agent records, workflows, scripts, data and generated artifacts excluded
- [x] Forbidden secret, environment, editor and OS files rejected
- [x] `npm pack --dry-run --json` inventory contract added
- [x] Packed and unpacked size recorded with a regression budget
- [x] Tarball produced in an isolated artifact directory
- [x] Tarball checksum and manifest made available to release verification
- [x] STEP status, conceptual commit and push

## Artifact boundary

Allowlist는 source directory 전체를 무조건 포함하는 대신 public runtime import graph에 필요한 파일을 포함해야 한다.
Package test는 required file 누락과 forbidden file 추가를 모두 실패시킨다. `.npmignore`의 broad exception chain보다
`package.json.files`의 positive allowlist를 우선한다.

## 완료 조건

The exact publish artifact is small, deterministic, free of internal material and fully described by executable inventory
checks.

## 구현 결과

- `package.json.files`는 `src/`, `types/`, `README.md`, `LICENSE`만 allowlist한다.
- `npm run package:check`가 required/forbidden file과 300 entries, 400 KB packed, 1.5 MB unpacked budget을 검사한다.
- Current artifact는 221 files, 210,008 packed bytes, 948,194 unpacked bytes다.
- `npm run package:pack`은 `.artifacts/release/ggaction-0.0.1.tgz`와 SHA-256을 만든다.
