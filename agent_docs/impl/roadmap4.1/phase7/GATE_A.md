# Gate R41-P7-A — Distribution Owner Role Revisions

## Gate state

`planned`

## Review target

Phase 7의 box plot과 gradient plot data/x/y partial revision, immutable derived sibling replacement, orientation 및
scale/guide/selection handoff vertical slice 전체다.

## Exact public calls

```javascript
program.editBoxPlot({ data: "observations", y: { field: "group", fieldType: "nominal" },
  x: { field: "value", fieldType: "quantitative" } });

program.editGradientPlot({ data: "observations", x: { field: "group", fieldType: "nominal" },
  y: { field: "value", fieldType: "quantitative" } });
```

`data`, `x`, `y`는 각각 optional이고 supplied channel은 create-time position channel vocabulary의 complete
replacement다. Omitted option은 current owner provenance를 보존한다. Exact normalization, no-op behavior, trace와
resulting state는 implementation mapping과 executable evidence로 이 Gate를 `ready-for-review`로 전환할 때 고정한다.

## Required evidence

- Owner/source resolution, complete categorical/quantitative role candidate와 ambiguity errors
- Every data/x/y partial edit, omission preservation and vertical/horizontal orientation handoff
- Immutable box summary/outlier or gradient profile revision and exact consumer rebind/release trace
- Stable owner/component/coordinate IDs and retained statistics/appearance
- Scale/axis/grid/legend transition plus selection/highlight final-item replay
- Downstream failure atomicity and previous program/source/caller/unrelated resource preservation
- Existing valid edit compatibility and focused/cumulative/Browser/PNG/package evidence

## Approval effect

Approval은 Phase 7 distribution owner role revision 결과를 고정하고 Phase 8 facet columns, scale policy and guide
policy editing을 허용한다. PR creation, npm publishing과 docs deployment 권한은 포함하지 않는다.

## Work blocked before approval

Phase 8 facet columns, scale policy and guide policy editing.
