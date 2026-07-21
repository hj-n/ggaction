# Roadmap 4 Phase 12 — Collision-aware Label Layout

## 진행 상태

- [x] Phase 11과 deterministic text/bounds 기준선 확인
- [x] P-005 candidate API, state ownership과 failure policy 설계
- [x] Independent oracle과 Gapminder primitive visual
- [ ] P12-A 사용자 승인
- [ ] Production grammar, action과 rematerialization lifecycle
- [ ] P12-B public visual/lifecycle 승인
- [ ] Current contract, declarations, docs와 cumulative closeout
- [ ] P12-Exit 사용자 승인

## 목표

P-005를 `layoutLabels()`와 `removeLabelLayout()`의 graphical assignment lifecycle로 구현한다. Existing text
mark의 materialized item bounds를 deterministic하게 배치해 overlap을 줄이고, optional leader line으로 original
anchor와 displaced label의 관계를 보존한다. Renderer는 layout 의미를 해석하지 않고 final text/line graphics만
소비한다.

대표 계약은 [Gapminder 2005 Country Labels](../chart/gapminder-country-labels.md)다.

## Candidate API

```typescript
type LabelLayoutAxis = "x" | "y" | "both";
type LabelLayoutBounds = "plot" | "canvas";
type LabelLeader = false | {
  stroke?: string;
  strokeWidth?: number;
  strokeDash?: readonly number[];
  opacity?: number;
};

layoutLabels({
  target?: string;
  axis?: LabelLayoutAxis;
  padding?: number;
  maxDisplacement?: number;
  bounds?: LabelLayoutBounds;
  leader?: LabelLeader;
}): ChartProgram;

removeLabelLayout({ target?: string }): ChartProgram;
```

Defaults are `axis: "both"`, `padding: 3`, `maxDisplacement: 48`, `bounds: "plot"`, and `leader: false`.
`target` is inferred only from the current or unique complete text mark. Ambiguity is an error.

## Canonical ownership

- Text content, field positions and source relation remain in the existing semantic text layer.
- Requested graphical policy and the latest deterministic resolution summary live only at
  `materializationConfigs.labelLayouts[target]`.
- Final displaced `x`/`y` values remain concrete text item properties in `graphicSpec`.
- Leader lines are one target-owned line collection in the same plot subtree and are absent when disabled or unused.
- Original anchors are recomputed from the target text materializer. A stored `layer.source` may provide source-mark anchor
  geometry; the action never searches for an arbitrary nearby point or mark.
- `layoutLabels()` replaces the complete policy. `removeLabelLayout()` removes policy and leader graphics, then restores
  the text materializer's semantic base positions.

## Deterministic layout policy

1. Rematerialize base text items from their semantic source and current typography.
2. Measure final rotated bounds with the shared deterministic text metrics.
3. Visit items in canonical attached item order.
4. Enumerate bounded displacement candidates by distance with a documented stable tie order and the requested axis.
5. Choose the first in-bounds, zero-overlap candidate; otherwise choose the stable minimum-penalty best effort.
6. Record overlap/bounds warnings and affected item IDs in the resolution summary instead of silently claiming success.
7. Create a leader only for an item whose layout displacement is nonzero and whose source anchor is outside its final label.

Padding applies between label bounds. `maxDisplacement` is Euclidean distance from each materialized base label anchor.
Existing labels that already satisfy collision and bounds constraints remain unchanged.

## 승인 Gate

| Gate | 상태 | 승인 대상 | 승인 전 차단되는 작업 |
| --- | --- | --- | --- |
| P12-A | ready-for-review | exact API/default/error/state, independent oracle, Gapminder primitive source와 PNG | production layout/action 구현 |
| P12-B | planned | public action hierarchy, primitive/public parity, replay/removal/warning lifecycle | public closeout |
| P12-Exit | planned | Current inventory, architecture, docs/types/package와 cumulative verification | Phase 13 |

모든 Gate는 hard pause다.

## 실행 순서

1. [STEP1](./STEP1.md) — exact candidate contract와 failure policy
2. [STEP2](./STEP2.md) — independent oracle, Gapminder primitive target와 P12-A
3. [STEP3](./STEP3.md) — production label-layout grammar와 concrete leader geometry
4. [STEP4](./STEP4.md) — public actions, state/trace와 rematerialization lifecycle
5. [STEP5](./STEP5.md) — public visual parity, replay/removal/error matrix와 P12-B
6. [STEP6](./STEP6.md) — declarations/contracts/docs/package/cumulative closeout와 P12-Exit

## Non-goals

- Force simulation, global graph-label optimization, animation 또는 interaction
- Axis tick, legend, facet header와 title의 automatic collision layout
- Arbitrary source-mark proximity search 또는 implicit point matching
- Canvas backend `measureText()`에 따른 topology
- Automatic Canvas/margin expansion, clipping 또는 font-size reduction
