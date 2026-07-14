# Planned Guides And Layout contracts

These contracts are accepted or pending future API work; they are not current public behavior.

## mirrored Cartesian axis positions

- x-axis position은 existing `"bottom"`과 Planned `"top"`, y-axis position은 existing `"left"`와
  Planned `"right"`를 사용한다. 생략 default는 bottom/left를 유지한다.
- `createXAxis`/`createYAxis`와 parent `createAxes`는 선택한 position을 line, ticks/labels와 title
  child에 전달한다. 모든 대응 leaf create/edit action도 같은 channel vocabulary를 공유한다.
- top tick은 plot에서 위쪽, right tick은 오른쪽을 향한다. label/title offset은 해당 edge에서
  바깥쪽으로 적용한다. top x title 기본 rotation은 `0`, right y title 기본 rotation은
  `Math.PI / 2`이며 explicit rotation은 항상 우선한다.
- 현재 channel당 semantic axis 하나라는 제한은 유지한다. position은 기존 axis resource의 edge를
  정하며 한 channel에 top+bottom 또는 left+right axis를 동시에 생성하지 않는다.
- leaf action을 직접 사용하면 component별 edge를 명시할 수 있지만 complete-axis action은 모든 child에
  한 position을 적용한다. component occupied bounds는 해당 Canvas margin 안에 들어가야 한다.
- Canvas 또는 scale 변경과 position edit은 line, ticks, labels와 title의 concrete geometry를
  deterministic plan으로 rematerialize한다. coordinate와 scale binding은 바뀌지 않는다.
- Status: Planned, NOT IMPLEMENTED. complete/leaf create/edit, outward geometry, default rotations,
  insufficient top/right margins와 Canvas/scale rematerialization coverage가 필요하다.

## axis label format strings

```typescript
type AxisFormatString =
  | ".0f" | ".1f" | ".2f"
  | ".0%" | ".1%"
  | ".2e"
  | "%Y" | "%Y-%m" | "%Y-%m-%d";
```

- existing `"auto"`와 `{ decimals: NonNegativeInteger }`를 유지하고 shared axis-label formatter가
  Planned strings를 추가한다. create/edit label leaf와 ticks-and-labels aggregate가 같은 grammar를 쓴다.
- `.nf`는 locale-independent fixed decimals, `.n%`는 value에 100을 곱한 fixed decimals와 `%`,
  `.2e`는 두 자리 exponential notation을 만든다. quantitative scale에서만 허용한다.
- `%Y`, `%Y-%m`, `%Y-%m-%d`는 UTC calendar fields를 zero-pad해 조합하며 time scale에서만 허용한다.
  ordinal scale은 계속 `"auto"`만 허용한다.
- arbitrary format string과 formatter callback은 허용하지 않는다. stored format token은 graphical guide
  config에 남고 browser/Node renderer가 아니라 shared formatter가 concrete text를 생성한다.
- format edit은 tick values와 semantic guide를 바꾸지 않고 label text와 occupied bounds만
  rematerialize한다. 새 text가 margin에 맞지 않으면 layout error다.
- Status: Planned, NOT IMPLEMENTED. 각 token, negative/zero/large number, UTC boundary, wrong-scale,
  edit switching과 browser/PNG text parity coverage가 필요하다.

## left legend position

- `createLegend.position`과 Planned `editLegend.position`은 existing `"right" | "bottom" | "top"`에
  `"left"`를 추가한다. chart-independent default는 계속 `"right"`다.
- left는 right-side block geometry를 mirror하고 plot left edge에서 `offset`만큼 바깥에 둔다.
  item 내부 symbol→label order와 domain order는 유지하며 multiple legend block은 deterministic
  top-to-bottom order를 사용한다.
- categorical, point composite와 quantitative size block을 지원한다. 첫 left contract는 side-layout
  parity를 위해 `align: "center"`, vertical flow만 허용하며 point composite top/bottom은 여전히 지원하지 않는다.
- titlePosition, symbol recipes, labels/titleStyle, itemGap, border와 count는 기존 계약을 그대로 사용한다.
  left margin의 actual occupied bounds를 검증하고 title/chart/다른 legend와 겹치면 오류다.
- Canvas resize, scale/domain, symbol recipe 또는 position edit은 legend와 size block을 rematerialize한다.
  semantic channels, scale binding과 item order는 유지한다.
- Status: Planned, NOT IMPLEMENTED. categorical/composite/size parity, position edits, border/title variants,
  multiple blocks, insufficient margin와 Canvas rematerialization coverage가 필요하다.

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
- wrapping, maxWidth와 lineHeight는 이 position contract에 포함하지 않고 Proposed로 유지한다.
- Status: Planned, NOT IMPLEMENTED. four positions, align/offset/rotation, subtitle blocks, edit transitions,
  collision/margin errors와 Canvas rematerialization coverage가 필요하다.
