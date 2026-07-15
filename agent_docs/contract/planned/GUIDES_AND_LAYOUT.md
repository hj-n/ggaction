# Planned Guides And Layout contracts

These contracts are accepted or pending future API work; they are not current public behavior.

## left legend position

- `createLegend.position`과 Planned `editLegend.position`은 existing `"right" | "bottom" | "top"`에
  `"left"`를 추가한다. chart-independent default는 계속 `"right"`다.
- left는 right-side block geometry를 mirror하고 plot left edge에서 `offset`만큼 바깥에 둔다.
  item 내부 symbol→label order와 domain order는 유지하며 multiple legend block은 deterministic
  top-to-bottom order를 사용한다.
- categorical, point composite와 quantitative size block을 지원한다. 첫 left contract는 side-layout
  parity를 위해 `align: "center"`, vertical flow만 허용한다. Top/bottom composite layout은 아래의
  별도 accepted contract가 소유한다.
- titlePosition, symbol recipes, labels/titleStyle, itemGap, border와 count는 기존 계약을 그대로 사용한다.
  left margin의 actual occupied bounds를 검증하고 title/chart/다른 legend와 겹치면 오류다.
- Canvas resize, scale/domain, symbol recipe 또는 position edit은 legend와 size block을 rematerialize한다.
  semantic channels, scale binding과 item order는 유지한다.
- Status: Planned, NOT IMPLEMENTED. categorical/composite/size parity, position edits, border/title variants,
  multiple blocks, insufficient margin와 Canvas rematerialization coverage가 필요하다.

## continuous color gradient legend

```typescript
type GradientLegendOptions = {
  length?: PositiveFinite;
  thickness?: PositiveFinite;
};
```

- A legend whose selected color channel uses a sequential scale materializes one continuous gradient block
  rather than categorical items. `length` defaults to `120`, `thickness` to `12`; right/left positions orient
  the block vertically and top/bottom positions orient it horizontally.
- `count` is the requested tick-label count with default `5` and minimum `2`. Quantitative labels use the
  shared numeric tick/format contract and temporal labels use shared UTC/local time scale behavior.
  The resolved endpoints always correspond to the displayed scale direction after palette extent and reverse.
- Title, titlePosition, labels/titleStyle, offset, border and position retain their existing contracts.
  `symbol`, `columns`, `direction` and `itemGap` are categorical-only and are rejected for a gradient legend.
- Materialization creates a deterministic internal collection of adjacent rect strips with already-resolved
  CSS fill strings plus concrete tick lines and text. The fixed strip resolution is an internal rendering
  detail, not a user parameter; browser and Node renderers perform no semantic color interpolation.
- The legend stores scale/channel/title semantics and graphical layout config separately. Scale domain,
  palette/range/interpolation/policy, Canvas or legend edit invokes wrapped `rematerializeLegend`; actual
  occupied bounds must fit the requested margin without resizing the Canvas.
- Status: Implemented for point sequential color. Four positions, orientations, quantitative/temporal labels,
  reverse/extent, styles, border, categorical-option conflicts, margin errors, rematerialization and PNG parity
  are Current in [`../current/LEGEND_AND_TITLE.md`](../current/LEGEND_AND_TITLE.md#createlegend).

## chart title positions

- `createTitle.position`과 Planned `editTitle.position`은 `"top" | "bottom" | "left" | "right"`를
  사용하며 default는 existing `"top"`이다.
- top/bottom은 rotation 0, left는 `-Math.PI / 2`, right는 `Math.PI / 2`를 사용한다. title과 subtitle은
  하나의 rotated block으로 배치하고 gap/style contract는 유지한다.
- top/bottom에서 align left/center/right는 plot x start/center/end다. left/right에서는 같은 vocabulary를
  edge 진행 방향의 start(top)/center/end(bottom)로 해석한다.
- offset은 existing top behavior를 보존하는 signed Canvas-axis translation이다. top/bottom에서는 y,
  left/right에서는 x에 더한다. position edit은 semantic text를 유지하고 graphical config와 concrete
  title/subtitle coordinates만 갱신한다.
- actual rotated occupied bounds가 해당 margin 안에 들어가야 하며 같은 edge의 legend 또는 다른 reserved
  block과 겹치면 오류다. library가 Canvas나 margin을 자동 확장하거나 다른 edge로 이동하지 않는다.
- Wrapping, maxWidth와 lineHeight는 별도 accepted title-wrapping contract가 소유한다.
- Status: Planned, NOT IMPLEMENTED. four positions, align/offset/rotation, subtitle blocks, edit transitions,
  collision/margin errors와 Canvas rematerialization coverage가 필요하다.

## title wrapping and measurement

```typescript
type PlannedTitleWrapping = {
  maxWidth?: PositiveFinite;
  wrap?: "word" | "character";
  lineHeight?: PositiveFinite;
};
```

- `maxWidth`를 주고 wrap을 생략하면 `"word"`를 사용한다. wrap 또는 lineHeight를 maxWidth 없이
  주면 오류다. 첫 contract는 input text의 explicit newline을 허용하지 않는다.
- Word mode는 whitespace boundary를 우선하고 한 token이 maxWidth보다 넓으면 character mode로
  해당 token만 나눈다. Character mode는 Unicode code point boundary에서 나누며 빈 line을 만들지 않는다.
- lineHeight 생략 시 각 title/subtitle style의 resolved fontSize × `1.2`를 사용한다. Explicit
  lineHeight는 두 block에 적용되며 각 resolved fontSize 이상이어야 한다.
- Shared text measurement service가 materialization 단계에서 line breaks와 concrete line positions를
  만든다. Renderer는 text를 다시 wrap하지 않으며 graphicSpec의 text children만 그린다.
- Left/right title은 horizontal text를 먼저 wrap한 뒤 complete block을 existing position rotation으로
  회전한다. maxWidth는 rotation 전 reading-axis width다.
- Text/style/position/Canvas edit는 occupied bounds와 title, plot, same-edge guides를 rematerialize한다.
  Bounds가 margin에 맞지 않으면 Canvas나 margin을 자동 확장하지 않고 layout error다.
- Status: Planned, NOT IMPLEMENTED. word/character fallback, Unicode, inferred/explicit line height,
  title+subtitle, four positions, font metrics, margin collision와 browser/PNG parity coverage가 필요하다.
