# Planned Guides And Layout contracts

These contracts are accepted or pending future API work; they are not current public behavior.

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
  shared numeric tick/format contract and temporal labels use the shared UTC-only `time` scale behavior.
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
