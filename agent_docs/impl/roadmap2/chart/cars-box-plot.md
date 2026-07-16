# Cars Box Plot

## 목적

Cars dataset의 `Origin`별 `Miles_per_Gallon` 분포를 Tukey box plot으로 표현하는 첫 ranged-bar composite
vertical slice를 정의한다. 이 차트는 immutable quartile/outlier derivation, ranged bar body, explicit
error-bar whisker, median rule, outlier point와 `createBoxPlot` hierarchy의 canonical oracle이다.

## Canonical target

- Data: non-empty `Origin`과 finite `Miles_per_Gallon`을 가진 Cars rows
- Category: x = nominal `Origin`
- Measure: y = quantitative `Miles_per_Gallon`
- Category order: valid source first appearance, `USA → Japan → Europe`
- Summary: linear `(n - 1) × p` quartiles, median, q1/q3 and Tukey `1.5 × IQR` whiskers
- Whisker: fence 안의 실제 observed minimum/maximum; interpolated fence 자체를 endpoint로 쓰지 않는다.
- Outliers: whisker 밖의 source rows, source order 유지; canonical counts는 USA 3, Japan 1, Europe 6이다.
- Box width: category bandwidth의 `0.7`
- Box appearance: opacity `1`, stroke width `1.5`; categorical color maps `Origin` through the default palette
- Median: stroke `#1f2937`, stroke width `2`, concrete box body의 폭과 동일한 span
- Whisker/caps: black `#111111`, stroke width `2`; caps는 8 logical pixels
- Outlier: black diamond, radius-equivalent area from `3`, opacity `0.75`
- Scales: ordinal x; linear y with `nice: true`, `zero: false`
- Guides: x/y axes와 horizontal grid; x가 이미 Origin을 식별하므로 redundant color legend는 명시적으로 끈다.
- Canvas: `360×460`, margin `{ top: 140, right: 40, bottom: 70, left: 80 }`; title wraps within the 240px plot width
- Title: `Fuel Economy Distribution by Origin`; subtitle: `Tukey box plot with 1.5× IQR whiskers`

Renderer는 final rect, line, closed path와 text만 읽는다. Quartile, whisker policy, outlier role, band fraction,
semantic scale 또는 composite ownership을 해석하지 않는다.

## Final user-facing API

```javascript
const program = chart()
  .createCanvas({
    width: 360,
    height: 460,
    margin: { top: 140, right: 40, bottom: 70, left: 80 }
  })
  .createData({ values: cars })
  .createBoxPlot({
    x: { field: "Origin", fieldType: "nominal" },
    y: { field: "Miles_per_Gallon" }
  })
  .encodeColor({
    target: "boxPlot",
    field: "Origin",
    fieldType: "nominal",
    scale: { palette: "tableau10" }
  })
  .createGuides({ legend: false })
  .createTitle({
    text: "Fuel Economy Distribution by Origin",
    subtitle: "Tukey box plot with 1.5× IQR whiskers",
    maxWidth: 240
  });
```

`id`, `data`, `coordinate`, scales, whisker policy, width와 appearance는 생략한다. 각각 unique
`"boxPlot"`, current data, main Cartesian coordinate와 documented defaults로 resolve된다. 같은 program의
두 번째 box plot은 explicit `id`가 필요하다.

## Public parameter contract

```typescript
type BoxPositionChannel = {
  field?: FieldName;
  fieldType?: "nominal" | "ordinal" | "temporal" | "quantitative";
  scale?: PositionScale;
};

type BoxWhisker =
  | { type?: "tukey"; factor?: PositiveFinite }
  | { type: "minmax"; factor?: never };

createBoxPlot({
  id?: UserId;
  target?: UserId;
  data?: UserId;
  x?: BoxPositionChannel;
  y?: BoxPositionChannel;
  coordinate?: UserId;
  whisker?: BoxWhisker;
  width?: { band: UnitIntervalExclusive };
  outliers?: boolean;
  box?: {
    fill?: NonEmptyString;
    opacity?: UnitInterval;
    stroke?: NonEmptyString;
    strokeWidth?: NonNegativeFinite;
  };
  median?: {
    stroke?: NonEmptyString;
    strokeWidth?: NonNegativeFinite;
  };
  outlier?: {
    shape?: PointShape;
    radius?: PositiveFinite;
    opacity?: UnitInterval;
  };
} = {}): ChartProgram;
```

Exactly one channel is nominal, ordinal or temporal category and the other is quantitative measure. This pair
determines vertical or horizontal orientation; no orientation flag is exposed. Explicit channels override inferred
roles only when the final pair remains compatible.

When x or y is omitted, `target` selects a compatible encoded layer. Without `target`, the current eligible layer,
then one unique eligible layer is used. The source contributes data, coordinate, position fields and compatible
scale IDs. Multiple candidates, two quantitative axes or two categorical axes are errors. Resolved decisions are
persisted in ordinary semantic resources.

Authoring order does not change the completed result. `createBoxPlot()` may consume compatible x/y encodings that
already exist, or it may establish its owner and wait for later `encodeX`/`encodeY` calls. In the latter order the
action stores immutable box-plot materialization intent, creates no fabricated summary or placeholder component,
and rematerializes the summary, whiskers, body, median and optional outliers as soon as data and both channel roles
become complete. An incomplete program may remain intentionally unrendered; ambiguous consumers still require an
explicit `target`.

Phase 8 intentionally has no `groupBy`. The categorical position is the only statistical partition. Automatic
subgroup offset, subgroup color and subgroup legend are outside this initial contract.

## Statistical contract

- Missing measure values are omitted. A non-missing non-finite/non-numeric measure is an error.
- Q1, median and Q3 reuse the current linear quantile convention: sorted values at `(n - 1) × p` with interpolation.
- Tukey fences are `q1 - factor × IQR` and `q3 + factor × IQR`; stored whiskers are the most extreme observed
  finite values inside the fences.
- Tukey outliers are owned copies of original valid rows strictly outside the resolved whiskers.
- `minmax` stores observed finite minimum/maximum as whiskers and creates no outlier dataset or point layer.
- Category order follows first valid source appearance. Singleton categories produce q1 = median = q3 = both
  whiskers; empty categories are not synthesized.
- Source rows, derived rows and earlier programs remain immutable.

## Important action hierarchy

### Vertical Tukey box plot

```text
createBoxPlot
├─ createBoxSummaryData
│  ├─ createDerivedData
│  └─ materializeBoxSummaryData
├─ createBoxOutlierData
│  ├─ createDerivedData
│  └─ materializeBoxOutlierData
├─ createErrorBar(boxPlotWhisker, explicit)
├─ createBarMark(boxPlot)
├─ encodeX(category)
├─ encodeYRange(q1, q3)
│  ├─ encodeY(q1)
│  └─ encodeY2(q3)
├─ encodeBarWidth({ band: 0.7 })
├─ createBoxMedian
│  ├─ createRuleMark(boxPlotMedian)
│  ├─ encodeX(category)
│  ├─ encodeY(median)
│  └─ rematerializeBoxMedian
└─ createBoxOutliers
   ├─ createPointMark(boxPlotOutliers)
   ├─ encodeX(category)
   ├─ encodeY(source measure)
   ├─ editPointMark(shape)
   ├─ encodeRadius
   └─ encodeOpacity
```

Horizontal mode uses `encodeY(category)` and `encodeXRange(q1, q3)`. `minmax` omits both outlier data and
`createBoxOutliers`. Aggregate/component actions call the real wrapped children; they do not duplicate range,
error-bar, point-shape or appearance validation.

## Stored-result contract

### Semantic state

- Summary derived data records source, category, measure, quantile convention, resolved whisker policy, output
  fields, owner ID and concrete rows.
- Tukey with enabled outliers stores a second immutable dataset of original outlier row copies. Disabled/minmax
  modes create no placeholder dataset.
- The representative owner ID is the box body bar layer. Whisker, median and outlier components are ordinary
  rule/point layers on the same coordinate and compatible scales.
- Vertical body stores x/y/y2; horizontal body stores y/x/x2.
- No `semanticSpec.composites` registry and no automatic semantic-to-graphic compiler are introduced.

### Graphical state

- Box body is a concrete `rect` collection, whisker/caps/median are `line` collections, and diamond outliers are
  concrete closed `path` primitives.
- Every child has final finite coordinates and concrete appearance values.
- Median endpoints are recomputed from the actual box rectangle extent after range, scale or Canvas changes.
- Drawing order is grid → whisker/caps → box body → median → outliers → axes/title.
- Missing categories and disabled optional components create no placeholder graphics.

### Internal identity

```text
boxPlot                     representative ranged bar body
boxPlotSummaryData          quartile/whisker rows
boxPlotOutlierData          Tukey outlier rows, only when enabled and present
boxPlotWhisker              explicit error-bar main rule
boxPlotWhiskerLowerCap      lower cap
boxPlotWhiskerUpperCap      upper cap
boxPlotMedian               median rule
boxPlotOutliers             outlier point layer, only when enabled and present
```

Explicit owner IDs use the same deterministic suffix roles.

## Visual variants

| Variant | Target capability | Distinct result |
| --- | --- | --- |
| `cars-vertical-tukey` | canonical computation/composition | Origin × MPG, default boxes and visible outliers |
| `cars-horizontal-minmax` | horizontal orientation + minmax | y category, x Horsepower range, no outliers |
| `cars-styled-factor` | option/style coverage | factor 1.0, narrower orange boxes, thick median, diamond outliers |
| `cars-outliers-off` | optional component removal | Tukey summary without outlier dataset/points |

Each visual variant starts as an approved primitive. Corresponding public programs are created only after its
Gate approval and must match semantic state, concrete graphics, drawing order, Canvas calls and decoded pixels.

## Errors and excluded scope

- Reject unknown options, invalid field/type pairs, missing/ambiguous source, invalid factor/width/style values,
  duplicate owner IDs and a measure without finite observations.
- Reject `factor` with `minmax`; `outliers` never creates points for `minmax`.
- Phase 8 does not add `editBoxPlot`, subgroup `groupBy`, automatic offset/color/legend, notched boxes, violin
  shapes, variable-width boxes or arbitrary quantile definitions.
- Ordinary child resource edits remain possible only through supported mark/encoding actions; the aggregate
  stays create-only.

## 완료 조건

- Independent numeric fixtures prove quartiles, fences, observed whiskers, minmax and outlier ownership.
- Four approved primitive/public pairs converge exactly.
- Both orientations, style/width/factor/outlier options, sparse/singleton input, inference, ambiguity,
  rematerialization and immutability are executable contracts.
- Encoding-before-composite and composite-before-encoding programs converge on the same persisted semantics,
  concrete graphics and drawing order.
- Public example, types, tutorial/API/reference/LLM docs, action catalog and Roadmap gallery describe the same API.
- Phase 8 closeout contract removes `createBoxPlot` and box-summary/outlier capability from Planned inventory.
