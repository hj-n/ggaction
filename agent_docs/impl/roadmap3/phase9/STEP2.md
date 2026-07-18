# STEP 2 — Horizontal Grouped Bar Primitive and Gate J-A

## 진행 상태

- [x] Independent numeric oracle for horizontal grouped cells
- [x] Explicit primitive program with bars, guides, title and legend
- [x] Normal geometry and drawing-order tests
- [x] High-DPI PNG and Roadmap 3 gallery artifact
- [ ] Gate J-A user approval

Jobs rows를 `year × sex` grain에서 `mean(perc)`로 집계한다. `year`는 y category, `sex`는 yOffset category,
`mean(perc)`는 zero-based x measure다. 같은 year의 두 bar는 하나의 y slot 안에서 겹치지 않으며 first-appearance
domain order를 보존한다.

Primitive는 `createGraphics`와 `editGraphics`만으로 final rect, vertical grid, axes, legend와 plot-centered title을
작성한다. Target public chain은 `encodeColor({ layout: "group" })`가 wrapped `encodeYOffset`을 호출하는 가장
짧은 ordinary-authoring flow를 보여준다.

Gate J-A 승인 전에는 `yOffset` vocabulary, scale policy, bar materializer 또는 public action을 구현하지 않는다.
