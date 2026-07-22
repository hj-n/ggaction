# Gate R41-P4-A — Cartesian Axis Component Lifecycle

## Gate state

`planned`

## Review target

Phase 4의 `editXAxis`/`editYAxis` nested component removal과 aggregate atomicity vertical slice 전체다.

## Exact public calls

```javascript
program.editXAxis({ line: false });
program.editXAxis({ ticks: false });
program.editXAxis({ labels: false });
program.editXAxis({ ticksAndLabels: false });
program.editXAxis({ title: false });

program.editYAxis({
  line: false,
  ticksAndLabels: false,
  title: false
});
```

Nested component omission은 preserve, object는 existing edit/create semantics, `false`는 existing component removal이다.
`ticksAndLabels` group은 `ticks`/`labels` leaf와 같은 call에서 함께 지정할 수 없다. Aggregate는 complete proposed
operation을 preflight하고 failure에서 partial state나 partial trace를 남기지 않는다.

## Required evidence

- X/Y axis별 line, ticks, labels, ticks-and-labels와 title removal
- Retained semantic/config/graphic components and exact last-component cleanup
- Mixed edit/removal, direct missing removal, group/leaf conflict and ambiguity behavior
- Ordinary create/edit path recreation and no stale resurrection after Canvas/scale revision
- Scale, coordinate, mark encoding, source data, previous program and caller option preservation
- Focused/cumulative/Browser/PNG/package verification and remote checkpoint

## Approval effect

Approval은 Phase 4 component ownership/removal/reconciliation/atomicity/compatibility 결과를 고정하고 Phase 5
`editBin2DData` partial revision facade 구현을 허용한다. PR creation, npm publishing과 docs deployment 권한은
포함하지 않는다.

## Work blocked before approval

Phase 5 `editBin2DData` partial revision facade implementation.
