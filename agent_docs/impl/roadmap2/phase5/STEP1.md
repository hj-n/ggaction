# Roadmap 2 — Phase 5 Step 1: Baseline and Contract Audit

## 목표

Existing six-chart primitive/public pairs와 guide ownership을 재감사하고 Phase 5 variants가 재사용할
stable baseline을 고정한다.

## 진행 상태

- [x] Six canonical primitive/public state와 Canvas-call equivalence
- [x] Axis/grid/legend/title semantic resource와 graphical config ownership
- [x] Existing guide drawing order와 occupied-margin inventory
- [x] Phase 5 variant manifest ownership과 artifact paths
- [x] Current/planned contract, types와 public docs gap audit
- [x] Full baseline render와 desktop/mobile gallery verification
- [x] STEP status, conceptual commit와 push

## Audit 결과

- Cars scatterplot, line chart, histogram, grouped bar, regression scatterplot와 density area의 canonical
  primitive/public pairs가 semantic state, concrete graphics, explicit order와 Canvas calls에서 일치한다.
- Axis/grid/legend는 `semanticSpec.guides`가 binding과 title을, `guideConfigs`가 appearance/layout을 소유한다.
  Chart title은 `semanticSpec.title`과 `titleConfig`로 같은 경계를 유지한다.
- Concrete guide nodes는 `graphicSpec`만 소유하며 renderer는 edge, format, wrapping 또는 collision을 다시
  추론하지 않는다.
- Grid는 mark 아래, axes/legend/title은 mark 위의 explicit top-level order를 유지한다. Existing guide
  materializers가 Canvas margin의 occupied bounds를 검증하며 Canvas를 자동 확장하지 않는다.
- 각 variant의 manifest, dimensions, target chain과 artifact path는 해당
  `test/charts/<chart>/variants/manifest.js`가 canonical owner다. Phase 5도 같은 owner에 variant를 추가한다.
- Planned inventory는 네 direct edit actions와 여섯 guide/layout capabilities로 Roadmap 2 Phase 5에 정확히
  매핑되어 있다. Current declarations/docs는 아직 이 동작을 public API로 광고하지 않는다.
- `npm run test:charts` 137개와 `npm run test:render` 230개가 통과했고 46개 variant gallery의
  desktop/mobile browser 검증이 통과했다.

## 완료 조건

기존 baseline을 바꾸지 않고 Phase 5 변경 대상과 rematerialization owner가 모호하지 않게 고정된다.
