# Cars Origin Scatterplot Facet

## 목적

Cars의 `Horsepower`와 `Miles_per_Gallon` 관계를 `Origin`별 small multiple로 나눈다. Shortest facet call,
first-appearance order, default one-row layout, shared quantitative domains, per-cell axes와 parent-owned title/header를
검증한다.

## 최종 user-facing API

```javascript
const rows = cars.filter(row =>
  Number.isFinite(row.Horsepower) &&
  Number.isFinite(row.Miles_per_Gallon) &&
  Number.isFinite(row.Cylinders) &&
  typeof row.Origin === "string"
);

chart()
  .createCanvas({
    width: 250,
    height: 230,
    margin: { top: 34, right: 16, bottom: 48, left: 52 }
  })
  .createData({ values: rows })
  .createPointMark()
  .encodeX({
    field: "Horsepower",
    scale: { nice: true, zero: false }
  })
  .encodeY({
    field: "Miles_per_Gallon",
    scale: { nice: true, zero: false }
  })
  .encodeRadius({ value: 2.5 })
  .encodeColor({
    field: "Cylinders",
    fieldType: "ordinal",
    scale: { palette: "reds" }
  })
  .createGuides({
    axes: {
      x: { title: { text: "Horsepower" } },
      y: { title: { text: "Miles per Gallon" } }
    },
    legend: false
  })
  .createTitle({
    text: "Horsepower and Fuel Economy",
    subtitle: "Faceted by Origin",
    align: "center"
  })
  .facet({ field: "Origin", guides: { legend: "shared" } })
  .editFacetHeaders({ fontSize: 13, fontWeight: 700, offset: 10 });
```

## Action hierarchy

```text
facet
├─ resolveFacetSource
├─ resolveFacetValues
├─ deriveFacetCell(value) × 3
│  ├─ filterData revision
│  ├─ rebindFacetLayers
│  └─ rematerialize cell consumers
├─ promoteChartTitle
├─ createFacetHeaders
└─ materializeFacetComposition
```

## Stored-result contract

- Facet values are `USA`, `Europe`, `Japan` in source first-appearance order.
- Omitted columns resolves to `3`; all cells appear in one row.
- Every child keeps an independent scale resource but resolves the same full-source x/y domain.
- Cylinders uses shared ordinal domain `[8, 4, 6, 3, 5]` and one parent `reds` legend.
- Title exists only on the composition parent; header text is parent-owned concrete graphics.
- Raw Origin values never appear in generated child, dataset or graphic IDs.
