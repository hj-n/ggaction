# STEP 6 — Proposed Inventory, Phase Assignment Audit and Gate A

## 진행 상태

- [x] Step 1~5 observation을 하나의 Proposed inventory로 통합
- [x] Proposed action, package operation, parameter extension과 capability를 분리
- [x] 모든 active candidate에 owning Phase와 evidence 지정
- [x] Phase가 빠졌던 inference, scale resolution, exact type와 rect edit 배정
- [x] Lifecycle 감사의 7개 unresolved decision에 추천안 작성
- [x] Non-candidate와 explicitly deferred capability 분리
- [x] Machine-readable inventory와 contract audit 추가
- [x] Full test suite와 contract suite 통과
- [x] Existing `ACTION_INDEX`의 Current/Planned 상태를 변경하지 않음
- [x] Gate A 승인 패키지 준비
- [ ] 사용자 Gate A 승인

## 목적

Phase 0의 마지막 STEP은 capability lab에서 관찰된 문제를 구현 목록으로 과장하지 않고, 승인 가능한
Proposed contract로 정리한다. Canonical proposal은
[`GATE_A_INVENTORY.json`](./GATE_A_INVENTORY.json)이며 이 문서는 그 목록의 의미와 추천 결정을 설명한다.

Gate A 승인 전 상태는 다음과 같다.

```text
Current runtime/API     변경 없음
ACTION_INDEX Planned    비어 있음
Gate A inventory        Proposed, awaiting-approval
src/                    변경 없음
public docs/types       변경 없음
```

승인 뒤에만 accepted item을 `ACTION_INDEX` Planned와 owning contract로 승격한다. 일부만 승인되면 승인된
subset만 승격하고 나머지는 Proposed 유지, Maybe Future 또는 removed로 명시한다.

## Capability gap matrix

| Capability | 현재 상태 | Evidence | Proposed owner |
| --- | --- | --- | --- |
| Lollipop layering | 어색함 | Rule-first에서 incompatible constant encoding 상속 | Phase 1 `compatible-layer-inference` |
| Layered bar + line | 어색함 | Band/time policy가 scale ID와 결합 | Phase 10 `shared-position-scale-resolution` |
| Legend leaf edit | 어색함 | Deep aggregate option 필요 | Phase 1 focused legend actions |
| Palette edit | 어색함 | `range.palette` stored shape 노출 | Phase 1 `editScale({ palette })` |
| Composite edit | 어색함 | Generated child ID 노출 | Phase 1 aggregate edit actions |
| Domain removal | 미지원 | Raw graphic removal 뒤 stale state/rematerialization 실패 | Phase 1 removal actions |
| Horizontal grouped bar | 미지원 | `yOffset` 부재를 명확히 거부 | Phase 9 `encodeYOffset` |
| Polar point | 미지원 | Polar resource만 저장되고 position/materialization 없음 | Phase 2 |
| Polar guides | 미지원 | Polar axis/grid action 없음 | Phase 3 |
| Polar line/radar | 미지원 | Polar line geometry와 closed contract 없음 | Phase 4 |
| Arc/donut/radial bar | 미지원 | Arc mark/endpoints 없음 | Phase 5 |
| Concat | 미지원 | Package operation, child state와 nested Canvas 없음 | Phase 6 |
| Facet | 미지원 | Chainable action과 cell derivation 없음 | Phase 7~8 |
| Text annotation | 미지원 | Domain text mark 없음 | Phase 9 |
| Rect heatmap | 미지원 | Semantic rect mark 없음 | Phase 9 |

## Proposed inventory summary

Machine-readable inventory는 다음 네 active category를 구분한다.

| Category | 개수 | 의미 |
| --- | ---: | --- |
| `proposedActions` | 50 | 새 `ChartProgram` direct action |
| `proposedOperations` | 2 | Main package named operation |
| `parameterExtensions` | 6 | Existing action의 accepted option 확장 |
| `proposedCapabilities` | 20 | 여러 action/internal slice를 묶는 결과 capability |

별도로 15개 non-candidate와 11개 deferred capability를 고정한다. 이들은 active implementation queue에
들어가지 않는다.

Active capability IDs:

```text
compatible-layer-inference
focused-component-editing
domain-removal
exact-public-option-types
api-layer-classification-alignment
polar-point
polar-guides
polar-line-radar
arc-donut-radial-bar
arc-selection-highlight
program-composition-state
nested-canvas-rendering
direct-source-facet
derived-facet-replay
parent-guide-composition
horizontal-grouped-bar
text-annotation
rect-heatmap
shared-position-scale-resolution
cross-feature-integration
```

## Phase assignment

### Phase 1 — Focused editing and lifecycle

Focused legend actions:

```text
editLegendLayout
editLegendLabels
editLegendTitle
editLegendSymbols
editLegendBorder
```

추천 option ownership:

```typescript
editLegendLayout({
  target?, position?, align?, direction?, columns?, offset?,
  titlePosition?, itemGap?
});

editLegendLabels({ target?, color?, fontSize?, fontFamily?, fontWeight? });

editLegendTitle({
  target?, title?: string | "auto" | false,
  color?, fontSize?, fontFamily?, fontWeight?
});

editLegendSymbols({ target?, symbol?, count?, gradient? });
editLegendBorder({ target?, border: false | true | LegendBorderOptions });
```

- 각 focused edit는 `target` 외 최소 한 변경값을 요구한다.
- Kind-incompatible option은 기존 program을 바꾸기 전에 실패한다.
- Existing `editLegend`는 여러 component를 함께 바꾸는 aggregate convenience로 유지한다.
- Internal no-option `editLegend*` rematerializer는 public name을 구현하기 전에 `rematerializeLegend*`로
  rename하고 internal inventory를 갱신한다.

Complete guide facades:

```text
editXAxis
editYAxis
editGrid
```

`editXAxis`/`editYAxis`는 position과 선택된 line/ticks/labels/title child patch를 하나의 preflight 뒤 실제
wrapped leaf edit로 실행한다. Leaf 하나만 바꾸려면 기존 `editXAxisLine`, `editYAxisLabels` 같은 direct
action이 더 짧다. `editGrid`는 horizontal/vertical child patch를 aggregate한다. `editAxes`와
`editGuides`는 추가하지 않는다.

Composite owner facades:

```text
editErrorBar
editErrorBand
editErrorBandBoundary
editBoxPlot
editRegression
```

- Appearance-only patch는 current derived revision을 유지한다.
- Statistical patch는 새 immutable revision을 한 번 만들고 every owned consumer를 rebind한다.
- Appearance와 statistical option을 함께 주는 것은 허용하되 전체 input을 먼저 검증하고 materialization
  plan은 한 번만 실행한다.
- `editErrorBandBoundary`는 `boundary: "both" | "lower" | "upper"`를 받고 default는 `"both"`다.
- Box body/median/whisker/outlier처럼 실제로 독립적으로 보이는 component는 `editBoxPlot`의 named nested
  option으로 두되 generated layer ID를 target으로 요구하지 않는다.

Domain removal:

```typescript
removeXAxis({ coordinate?, scale? } = {});
removeYAxis({ coordinate?, scale? } = {});
removeGrid({ horizontal?: boolean, vertical?: boolean } = {});
removeLegend({ target? } = {});
removeTitle();
removeMark({ target? } = {});
```

- `removeGrid()`는 존재하는 horizontal/vertical grid를 모두 제거한다. Explicit `false/false`는 오류다.
- Missing 또는 ambiguous resource는 typo를 숨기지 않고 오류다.
- Complete removal 뒤 같은 deterministic role로 recreate하는 것은 허용한다.
- `removeMark`는 owner semantic/config/graphic/selection-highlight와 unreferenced generated data를 제거한다.
  User-created source dataset, coordinate와 scale은 보존한다. Guide는 remaining compatible consumer가 있으면
  rematerialize하고 consumer가 없으면 제거한다.

Existing action extensions:

```text
point-create-appearance   createPointMark: fill, opacity, stroke, strokeWidth
bar-create-appearance     createBarMark: fill, opacity, stroke, strokeWidth
line-constant-appearance createLineMark/editLineMark: stroke, opacity
scale-palette-edit        editScale: palette, mutually exclusive with range
```

Phase 1 capability work에는 `compatible-layer-inference`, `focused-component-editing`, `domain-removal`,
`exact-public-option-types`, `api-layer-classification-alignment`가 포함된다. Exact TypeScript 대상은 current
runtime이 이미 소유한 `createGuides`, `createCoordinate`, `createScale`, regression component options와 main
entry에서 빠진 named option exports다. API layer 정렬은 export를 줄이지 않고 catalog/docs audience
classification만 canonical vocabulary로 맞춘다.

### Phase 2 — Polar point foundation

Actions:

```text
encodeTheta
encodeR
encodePointRadius
```

Exact first target:

```javascript
chart()
  .createCanvas({ width: 520, height: 520, margin: 48 })
  .createData({ values: cars })
  .createPointMark()
  .encodeTheta({ field: "Acceleration" })
  .encodeR({ field: "Horsepower" })
  .encodeColor({ field: "Origin" })
  .encodePointRadius({ value: 3 });
```

Angle contract:

```text
Public unit        degree only
0°                 12시
positive direction clockwise
auto range         [0, 360]
allowed span       absolute span <= 360
graphicSpec        final Cartesian x/y only
```

`encodePointRadius`는 current `encodeRadius`의 additive alias이고 semantic radial position은 오직
`encodeR`이 소유한다. `encodeTheta`와 `encodeR` 호출 순서는 final state에 영향을 주지 않는다.

### Phase 3 — Polar guides

Create actions:

```text
createThetaAxis
createRadialAxis
createThetaGrid
createRadialGrid
```

Focused edit actions:

```text
editThetaAxisLine       editRadialAxisLine
editThetaAxisTicks      editRadialAxisTicks
editThetaAxisLabels     editRadialAxisLabels
editThetaAxisTitle      editRadialAxisTitle
editThetaGrid           editRadialGrid
```

`createAxes`/`createGuides`는 stored coordinate에 따라 Cartesian/Polar child action을 dispatch한다. Concrete
graphics는 existing path/line/text뿐이며 renderer에 semantic Polar branch를 추가하지 않는다.

### Phase 4 — Polar line and radar

Capabilities:

```text
polar-line-radar
polar-line-closed
```

`createLineMark`/`editLineMark`에 `closed?: boolean`을 추가한다. First slice는 linear curve만 지원하고
theta order, full-circle seam, duplicate angle과 reverse를 독립 fixture로 고정한다.

### Phase 5 — Arc, donut and radial bar

Actions:

```text
createArcMark
editArcMark
encodeTheta2
encodeR2
```

`createArcMark`/`editArcMark`는 inner radius, pad angle과 constant appearance를 소유한다. Endpoint actions는
primary scale/coordinate를 공유하는 assignment이며 existing `x2`/`y2` 원칙을 Polar에 적용한다.
`arc-donut-radial-bar`와 `arc-selection-highlight`를 같은 Phase에서 닫는다.

### Phase 6 — Program composition

Package operations:

```text
hconcat
vconcat
```

Parent actions:

```text
editCompositionLayout
replaceCompositionChild
```

Target:

```javascript
const dashboard = hconcat({
  programs: [leftProgram, { id: "right", program: rightProgram }],
  gap: 16,
  align: "center",
  padding: 8
});
```

Canonical state boundary:

```javascript
{
  children: { left: leftProgram, right: rightProgram },
  compositionSpec: {
    id: "composition",
    type: "hconcat",
    children: ["left", "right"],
    gap: 16,
    align: "center",
    padding: { top: 8, right: 8, bottom: 8, left: 8 }
  },
  graphicSpec: {
    // fully namespaced child Canvas snapshots and concrete placement
  }
}
```

`program-composition-state`와 `nested-canvas-rendering`을 함께 구현한다. Renderer는 child program을 읽지
않고 parent `graphicSpec`만 읽는다.

### Phase 7 — Direct-source facet

Actions:

```text
facet
editFacetHeaders
```

Shortest call:

```javascript
const faceted = baseProgram.facet({ field: "Origin" });
```

First slice는 unique direct source의 scatterplot, bar와 histogram을 지원한다. Facet value는 source의 첫
등장 순서, default scale policy는 shared, guide policy는 each cell이다. Existing title은 parent로 승격한다.

### Phase 8 — Facet resolution and derived replay

`facet-scale-resolution` parameter extension:

```javascript
.facet({
  field: "Origin",
  scales: { x: "shared", y: "independent", color: "shared" }
});
```

`derived-facet-replay`는 regression, density, interval/error band와 box dependency DAG를 cell data에서 다시
실행한다. `parent-guide-composition`은 scale sharing과 별도 policy이며 shared legend/outer axes를 explicit
parent graphics로 만든다.

### Phase 9 — Directional parity, text and rect

Actions:

```text
encodeYOffset
createTextMark
encodeText
editTextMark
createRectMark
editRectMark
```

`horizontal-grouped-bar`, `text-annotation`, `rect-heatmap`을 각각 independent primitive/public Gate로
검증한다. Text는 field/value content와 inherited/explicit position을 지원한다. Rect는 discrete x/y cell 또는
x/x2+y/y2 range를 지원하며 existing bar rect를 semantic rect로 가장하지 않는다.

### Phase 10 — Cross-feature integration

`shared-position-scale-resolution`은 layered bar+line처럼 동일 semantic channel을 공유하지만 mark-specific
layout policy가 다른 소비자를 다룬다. Scale identity와 consumer layout policy를 분리한 뒤 실제 pixel
alignment를 검증한다. `cross-feature-integration`은 Polar child concat, facet/Polar support-or-error,
rematerialization, package/type/docs와 release readiness를 닫는다.

## Gate A recommended lifecycle decisions

| Decision | 추천안 | 이유 |
| --- | --- | --- |
| `mark-removal-cascade` | Owned state 제거, user resource 보존 | Raw removal의 stale state를 막되 source/scale authoring intent를 지키기 위해 |
| `grid-removal-syntax` | Direction booleans, omission은 all | Existing directional grid vocabulary와 가장 짧은 전체 제거를 함께 제공 |
| `composite-edit-atomicity` | One preflight + one final plan | Appearance/statistics 동시 편집도 partial revision을 만들지 않기 위해 |
| `error-band-boundary-selection` | Default both, optional lower/upper | Common edit은 짧게, 독립 styling은 generated ID 없이 지원 |
| `focused-legend-subsets` | Stable component가 option subset 소유 | Deep aggregate object와 leaf-action 폭증을 모두 피하기 위해 |
| `recreate-after-removal` | Complete cleanup 뒤 허용 | Deterministic role ID를 재사용하는 ordinary workflow 지원 |
| `missing-removal-errors` | Missing/ambiguous는 오류 | Typo와 잘못된 target을 idempotence로 숨기지 않기 위해 |

## Explicit non-candidates

```text
editData
editDerivedData
editDensityData
editRegressionData
editIntervalData
editCoordinate
editRuleMark
editAxes
editGuides
removeCanvas
removeScale
removeGuide
editSelection
removeSelection
removeHighlight
```

Immutable revision, structural replacement, existing assignment, independent resource ownership 또는 concrete
use-case 부재 때문에 추가하지 않는다.

## Explicitly deferred

```text
animation-transitions
tooltip-pointer-interaction
interactive-legend
svg-renderer
external-spec-ingestion
semantic-auto-compiler
streaming-async-columnar-data
responsive-auto-canvas
multiple-axes-per-channel
identity-bin-ordinal-scale
callback-calculated-fields
```

이 항목은 Roadmap 3 구현 편의를 위해 암묵적으로 끌어오지 않는다. 실제 target chart가 요구하면 새
Proposed contract와 별도 Gate를 만든다.

## Artifact and visual Gate contract

모든 Roadmap 3 visual Gate는 Step 5 기반을 사용한다.

```text
.artifacts/test/png/roadmap3/<capability>/<chart>/<variant>/
├─ variant.json       Phase, capability, title, exact target call chain
├─ primitive.png
└─ user-facing.png
```

Primitive 승인 전에는 user-facing flow를 구현하지 않는다. 승인 뒤 같은 manifest에서 public program을
실행하고 semantic/graphic/trace, Canvas calls와 decoded pixel hash를 비교한다.

## Machine-readable audit

`test/contracts/roadmap3-gate-a.test.js`는 다음을 강제한다.

- 모든 active candidate의 unique identity, owning Phase와 evidence
- Phase 1~10에 빠진 assignment가 없음
- Proposed direct action이 Current/Planned inventory에 섞이지 않음
- Gate A 전 `ACTION_INDEX.plannedActions`와 `plannedCapabilities`가 비어 있음
- Required focused/Polar/composition/facet/directional action name 존재
- Non-candidate와 deferred item이 active proposal과 분리됨
- 7개 unresolved decision이 명시적으로 승인 대기 중임

`test/contracts/roadmap3-capability-baseline.test.js`는 다음 current behavior를 실행해 고정한다.

- Missing Polar/composition/facet/text/rect public surface
- Polar coordinate resource와 incomplete concrete point geometry의 경계
- Rule-first lollipop의 incompatible encoding inheritance
- Layered temporal bar/line의 shared scale-policy conflict
- Horizontal grouped bar의 `yOffset` limitation
- `editScale`의 top-level palette gap과 current `range.palette` workaround
- Raw title graphic removal 뒤 stale semantic/config와 Canvas rematerialization failure

검증 결과:

```text
npm run test:contracts  76 passed, 0 failed
npm test                1,137 passed, 0 failed
```

## Gate A approval request

승인 대상은 다음이다.

1. 50개 proposed direct action name과 owning Phase
2. Package operation `hconcat`/`vconcat`
3. 6개 existing-action parameter extension
4. 20개 capability assignment
5. Polar degree contract와 `encodeR`/`encodePointRadius` 구분
6. `children` + `compositionSpec` + fully materialized parent `graphicSpec` 경계
7. Package concat과 chainable `.facet({ field })` 구분
8. 위 7개 lifecycle 추천 결정
9. 15개 non-candidate와 11개 explicit deferral
10. Roadmap 3 artifact/gallery Gate 방식

승인 전에는 Planned 승격, Phase 1 source 구현, public type 또는 docs 변경을 시작하지 않는다.
