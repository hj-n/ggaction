# STEP 7 — F-011 Composition Asset and Closeout

## 진행 상태

- [x] Composition representative asset 기준선 확인
- [x] 두 child와 replacement slot을 식별할 수 있는 fixture 구현
- [x] Docs image와 thumbnail semantic/visual 회귀 추가
- [ ] 전체 normal, coverage, package, browser, render와 docs 검증
- [ ] Finding별 결과표, semver 영향과 재평가 우선순위 기록
- [ ] Roadmap 3 Phase 11 closeout

Composition runtime을 변경하지 않고 대표 program과 asset이 parent/child 구조를 전달하도록 개선한다. 마지막에는
8개 finding을 fixed, partial 또는 blocked로 분류하고 exact 검증 명령과 다음 배포의 재평가 범위를 기록한다.

## F-011 결과

- 기존 asset이 runtime output과 byte-identical하지만 흰 parent/child 위에 sparse point 두 세트만 남기는 것을
  확인했다. Composition materialization이나 renderer 손실이 아니라 최종 representative fixture 문제였다.
- `main` stable slot은 파란 배경의 `Observed points` point chart를 유지한다. `detail` stable slot의 placeholder는
  `replaceCompositionChild`로 주황 배경의 `Replacement bars` bar chart로 교체된다. 두 titled panel과 24px parent
  gap이 full image와 thumbnail에서 모두 구분된다.
- Primitive baseline도 같은 nested Canvas, point/rect grammar, title과 background를 low-level action chain으로
  명시한다. Public/primitive `graphicSpec` exact equivalence와 composition runtime 계약은 유지된다.
- Docs regression은 두 child background/title, circle/rect presence, full-image panel color와 흰 gap pixel,
  gallery alt/caption을 함께 검사한다. 수동 원본 확인에서도 두 panel과 replacement 결과가 식별됐다.

## F-011 focused 검증

- `npm run test:charts -- chart:program-composition`: 2개 통과
- `node scripts/run-tests.js render chart:program-composition`: 1개 통과
- `npm run test:docs -- generated-images`: 3개 통과
