# Planned Authoring Lifecycle contracts

Roadmap 4.1 Gate R41-P0-A에서 승인된 additive lifecycle 계약이다. 이 문서의 action과 option은 구현 전까지
public runtime/type에 존재하지 않으며, 구현된 항목은 owning current domain contract로 이동한다.

## `editFacetScales`

```typescript
editFacetScales(options: FacetScaleResolutions): ChartProgram;
```

- Existing facet composition과 최소 한 channel policy change를 요구한다.
- Omitted channel은 current shared/independent policy를 보존한다.
- Parent에 retained된 pre-facet unit state에서 모든 child를 immutable하게 rederive/replay하고 parent snapshot을
  교체한다. Facet field/data/value order, layout, headers, title와 guide policy는 보존한다.
- Status: Planned, accepted.

## `editFacetGuides`

```typescript
editFacetGuides(options: FacetGuideOptions): ChartProgram;
```

- `axes?: "each" | "outer"`, `legend?: false | "shared"`를 partial edit한다.
- Child guide compatibility를 preflight하고 retained children/parent snapshot을 atomic하게 교체한다.
- Facet field/data/value order, scale policy, layout, headers와 title은 보존한다.
- Status: Planned, accepted.

## Capability: distribution-owner-role-revisions

- `editBoxPlot`과 `editGradientPlot`은 `data?`, `x?`, `y?`를 create-time position channel vocabulary로 받는다.
- Complete candidate는 exactly one categorical and one quantitative role을 가져야 하며 orientation change를
  포함한 source fields/scales/components를 첫 state change 전에 검증한다.
- Stable owner/component IDs를 유지하고 summary/outlier 또는 profile sibling revisions, bindings, scales,
  guides와 selection/highlight를 한 plan으로 갱신한다.
- Status: Planned, accepted.

## Capability: facet-policy-editing

- `editCompositionLayout`은 facet에서만 `columns?: PositiveInteger`를 받고 concat에서는 거부한다.
- `editFacetScales`/`editFacetGuides`는 field/data/value replacement 없이 parent-retained unit state와 current
  derivation/replay registry를 사용한다.
- Persisted schema와 renderer boundary는 바꾸지 않는다.
- Status: Planned, accepted.
