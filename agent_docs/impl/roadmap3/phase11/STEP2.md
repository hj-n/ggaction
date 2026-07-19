# STEP 2 — F-012 Numeric Font Weight

## 진행 상태

- [x] Exact `0.0.3` reproduction과 600/700/string control 확인
- [x] Browser와 Node가 공유하는 renderer policy 확정
- [x] Text, title, facet, categorical legend, Cartesian/Polar label 회귀 추가
- [x] Runtime, type와 typography 문서 동기화
- [x] Focused Node PNG, browser, package 검증

공통 Canvas text renderer에서 numeric weight를 backend-safe CSS font string으로 변환한다. 같은 public input이
Browser와 Node에서 다른 font size로 해석되지 않아야 하며, glyph 높이를 `fontSize`의 합리적 배수로 검사한다.

## 구현 결과

- Public `string | number` 계약은 유지한다.
- Finite numeric weight는 render 직전에 가장 가까운 100단위로 반올림하고 `100`–`900`으로 clamp한다.
- `650`은 모든 Canvas backend에 `700`으로 전달하지만 program state의 authored `650`은 유지한다.
- Node native Canvas에서 text mark, title, facet header, categorical legend, Cartesian/Polar label을 대표하는
  650/700 glyph 높이가 font size의 2배를 넘지 않는지 검사한다.
- Installed tarball consumer가 실제 `renderToPNG` 결과의 non-background pixel bounds를 검사한다.

## 검증

- `npm test`: 1,524 passed
- `npm run test:package`: Node, extension, PNG, numeric-font-weight, TypeScript와 private-export rejection passed
- `npm run test:browser`: 29 passed
- `npm run test:render`: 113 passed; Roadmap 2/3 gallery verified
- `npm run test:docs -- documentation`: 13 passed

기존 문서 이미지의 source hash는 renderer 변경을 반영해 재생성했다. 기존 chart가 사용하는 100단위 weight의
concrete output은 바뀌지 않는다.
