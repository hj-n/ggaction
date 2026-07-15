# Roadmap 2 — Phase 5 Step 3: Axis Positions and Formats

## 목표

Gate A target을 complete/leaf axis actions의 shared position과 format contract로 구현한다.

## 진행 상태

- [x] Shared axis-edge vocabulary와 outward geometry
- [x] Complete/leaf create/edit position forwarding
- [x] Quantitative/time format-token parser와 shared formatter
- [x] Wrong-scale, invalid token과 insufficient-margin failures
- [x] Canvas/scale/position/format rematerialization plans
- [x] Primitive/public exact equivalence와 user-facing PNG
- [x] Types, docs와 contracts
- [x] Conceptual commit와 push

## 구현 결과

- x `bottom/top`, y `left/right` position과 line/tick/label/title geometry를 하나의 shared policy가 소유한다.
- Complete axis는 선택 position을 모든 child에 전달하고 leaf create/edit도 같은 vocabulary를 사용한다.
- Numeric `.0f/.1f/.2f/.0%/.1%/.2e`와 UTC `%Y/%Y-%m/%Y-%m-%d`를 shared formatter가 concrete text로
  materialize한다. Wrong-scale token과 ordinal explicit format은 오류다.
- Top/right component가 Canvas margin을 벗어나면 earlier program을 바꾸지 않고 실패한다.
- Approved primitive와 public `createGuides` program은 semantic/graphic state, order와 renderer calls가
  정확히 일치한다.

## 완료 조건

Axis edge와 format이 모든 sibling action에서 같은 contract를 사용하고 renderer에는 concrete text/geometry만
도달한다.
