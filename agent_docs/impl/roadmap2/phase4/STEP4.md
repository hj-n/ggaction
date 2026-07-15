# Roadmap 2 — Phase 4 Step 4: Density Variation Primitives

## 목표

Epanechnikov kernel, count normalization과 density revision의 numeric/graphic targets를 independent primitives로
고정한다.

## 진행 상태

- [x] Independent kernel formula fixtures
- [x] `epanechnikov-kernel` primitive
- [x] `count-normalization` primitive
- [x] `density-revision` primitive와 revision provenance target
- [x] Scale/path/axes/grid rematerialization target
- [x] Expanded target call-chain metadata
- [x] Browser와 2× primitive PNG 생성
- [x] Gate B 사용자 visual confirmation
- [x] Feedback 반영과 gate closeout commit/push

## 완료 조건

세 visual target과 exact density rows, domains, paths 및 revision ownership이 승인된다.

## Gate B targets

- Epanechnikov은 compact support formula와 unit normalization을 확정한다.
- Count normalization은 group-local sample count를 y magnitude에 반영한다.
- Density revision은 `densitiesDensityDataRevision1`에 triangular/count 결과를 저장하고 consumer가 그
  revision만 가리키는 최종 상태를 고정한다.
- 세 primitive는 production density computation을 import하지 않으며 새 public density action을 trace에
  포함하지 않는다.

검증은 `npm test` 664개와 `npm run test:render` 196개를 통과했다. Roadmap 2 gallery는 세 target을
포함한 41개 variant를 desktop/mobile browser에서 확인했다.

Gate B는 세 target 모두 수정 없이 승인되었다.
