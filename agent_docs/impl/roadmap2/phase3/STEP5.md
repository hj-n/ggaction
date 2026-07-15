# Roadmap 2 — Phase 3 Step 5: Normalized Stack and Color Layout Vocabulary

## 목표

Gate B를 재현하는 low-level normalized stack과 accepted bar/area color layout vocabulary를 구현한다.

## 진행 상태

- [x] `encodeY({ stack: "normalize" })`
- [x] `encodeColor({ layout: "fill" })` wrapped hierarchy
- [x] Bar `overlay`와 `diverging` materialization
- [x] Area `stack | fill | overlay | diverging` compatibility
- [x] Point/line/incompatible mark rejection
- [x] Positive/negative/zero/missing partition fixtures
- [x] Domain, render order와 legend order preservation
- [x] Y scale/bar-or-area/axes/grid/legend rematerialization
- [x] Unsupported layout transition atomic rejection
- [x] Action-order convergence와 Canvas resize
- [x] Three approved primitive/public pairs와 PNG
- [x] Types/docs/current contract/catalog, commits와 push

## 구현 원칙

- Color layout은 semantic encoding에 저장하고 concrete geometry는 mark materializer가 만든다.
- `fill`은 wrapped y normalize assignment를 호출하고 중복 normalization 로직을 가지지 않는다.
- Overlay는 opacity를 자동 변경하지 않으며 explicit series order를 graphical order로 사용한다.
- Diverging는 positive/negative accumulator를 분리하고 automatic domain에 zero를 포함한다.

## 완료 조건

Accepted layout matrix, 세 approved pair와 complete failure/rematerialization coverage가 통과한다.

## 구현 결과

- `encodeColor.layout`의 다섯 layout과 bar/area compatibility matrix를 구현했다.
- Normalized histogram, overlay bar와 diverging bar의 primitive/public 결과가 semantic, graphic,
  order와 Canvas call까지 일치한다.
- 독립 reference fixture, action-order convergence, resize, atomic rejection, full test와 render suite가
  통과한다.
