# Phase 6 — Step 6: Area Color Encoding

## 목표

Nominal `encodeColor`가 density area의 group paths를 같은 field/domain order로 채우고
scale 또는 Canvas 변경 뒤에도 모든 fill을 다시 materialize하도록 확장한다.

## 진행 상태

- [ ] Area applicability와 target validation
- [ ] Nominal color scale creation/reuse
- [ ] Density group field compatibility
- [ ] Area path fill materialization
- [ ] Explicit domain/range/palette support
- [ ] First-appearance domain order
- [ ] Shared scale consumer rematerialization
- [ ] Canvas edit rematerialization
- [ ] Regression area fixed-fill 회귀 보호
- [ ] Series/area docs, tests, full regression, commit, push

## 의미 규칙

- Color는 semantic field encoding과 ordinal scale을 만든다.
- Density group과 color가 함께 존재하면 같은 field여야 한다.
- Color는 새로운 density grouping을 암묵적으로 만들지 않는다. Group ownership은
  `encodeDensity`/`encodeGroup`에 있다.
- Fixed fill은 graphical config이고 field color가 존재하면 resolved field color가 path
  fill을 결정한다.

## Materialization 규칙

- Group path order, color domain, color range와 legend item order는 하나의 ordered domain을
  사용한다.
- Observed group만 path로 만들고 missing category를 합성하지 않는다.
- `tableau10`은 semantic scale range request로 저장하고 concrete hex fill을 graphicSpec에
  기록한다.
- Shared color scale에 consumer가 추가되면 모든 existing consumer와 guide를 명시적으로
  rematerialize한다.
