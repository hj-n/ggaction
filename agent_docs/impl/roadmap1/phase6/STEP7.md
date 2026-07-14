# Phase 6 — Step 7: Top Multi-column Categorical Legend

## 목표

기존 categorical legend를 area swatch와 top grid layout으로 확장하고 `direction`,
`columns`, `offset`, `titlePosition`을 chart-independent public options로 만든다.

## 진행 상태

- [x] `position: "top"` validation과 layout
- [x] `direction: "horizontal" | "vertical"`
- [x] Positive integer `columns`
- [x] Non-negative finite `offset`
- [x] `titlePosition: "top" | "left"`와 `"top"` default
- [x] Row-major/column-major item placement
- [x] Area default swatch symbol recipe
- [x] Align, itemGap, styles, optional border compatibility
- [x] Top-margin insufficiency errors
- [x] Canvas/domain rematerialization
- [x] Legend API/reference/docs, tests, full regression, commit, push

## Layout 계약

`n` items와 `c = min(columns, n)` columns에 대해:

```text
horizontal: column = i % c, row = floor(i / c)
vertical:   rows = ceil(n / c), column = floor(i / rows), row = i % rows
```

- Legend block bottom은 `plotTop - offset`이다.
- Title, symbols와 labels의 measured approximation을 포함해 block top을 계산한다.
- `align`은 complete legend block을 plot left/center/right에 맞춘다.
- `titlePosition: "left"`는 title과 item grid를 한 행에 두고 title width와 gap을 complete
  legend block width에 포함한다.
- Existing `right`와 `bottom` defaults/geometry는 변하지 않는다.
- Initial scope의 text width는 기존 deterministic approximation을 재사용한다.

## Semantic/graphic 경계

- Guide scale, title과 channels는 semantic이다.
- Position, direction, columns, offset, fonts, gaps, border와 concrete x/y는 graphical
  configuration/result다.
- Area swatch는 mark-specific fork가 아니라 generic categorical symbol recipe다.

## 대표 검증

- Origin 3개 + columns 3 + vertical은 한 행의 세 items를 만든다.
- Density chart의 Origin title은 `titlePosition: "left"`로 같은 행 왼쪽에 놓인다.
- 5개 synthetic items로 horizontal과 vertical fill order 차이를 고정한다.
- Top/bottom/right layout, border on/off와 Canvas resize를 함께 회귀 검증한다.

## 구현 결과

- Existing right/bottom branch를 유지하고 top 전용 grid resolver를 추가했다.
- Horizontal은 row-major, vertical은 column-major로 배치하며 complete block 단위로 align한다.
- Area는 `guide.legend.color`와 generic swatch recipe를 사용한다.
- Density chart의 3개 item, left title 좌표가 primitive fixture와 정확히 일치한다.
- Top margin, vocabulary, border와 Canvas rematerialization 오류/회귀 검증을 추가했다.
- 전체 395개 테스트와 coverage gate를 통과했다 (`lines 94.40%`, `branches 89.54%`, `functions 98.55%`).
