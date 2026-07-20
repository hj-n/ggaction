# Gate P5-B — `createWindowData` vertical slice

## 상태

- Gate: `P5-B`
- 상태: `ready-for-review`
- 검토 대상 remote checkpoint: `68f7456` (`origin/main`)
- 승인 전 차단: `createBin2DData`, binned `createHeatmap`와 Phase 5 후속 Step

## 승인 대상 public API

```typescript
createWindowData({
  id,
  source?,
  partitionBy?,
  sortBy?,
  operations
}): ChartProgram;
```

정확한 대표 실행 chain은 다음과 같다.

```javascript
const program = chart()
  .createData({
    id: "events",
    values: [
      { group: "A", order: 2, value: 3 },
      { group: "A", order: 1, value: 2 },
      { group: "B", order: 1, value: 4 }
    ]
  })
  .createWindowData({
    id: "windowedEvents",
    partitionBy: "group",
    sortBy: [{ field: "order" }],
    operations: [
      { op: "rowNumber", as: "rowNumber" },
      { op: "cumulativeSum", field: "value", as: "runningValue" }
    ]
  });
```

Materialized `[rowNumber, runningValue]`는 source row order에서
`[[2, 5], [1, 2], [1, 4]]`다. 계산은 partition 내부 stable sort order를 사용하지만 output은 source row
order를 유지한다.

## state와 trace 결과

- `semanticSpec.datasets[windowedEvents]`는 source ID, normalized `window` transform과 immutable values를 함께 저장한다.
- `partitionBy` default는 `[]`, `sortBy` default는 `[]`, sort order default는 `"ascending"`이다.
- `lag`/`lead` offset default는 `1`, boundary default는 `null`이다.
- `rowNumber`, `rank`, `denseRank`, `cumulativeSum`, `lag`, `lead`를 지원한다.
- Operation은 선언 순서대로 실행되어 뒤 operation이 앞 output field를 읽을 수 있다.
- Source/output field collision, duplicate output, missing field, incompatible sort type와 invalid operation을
  state 생성 전에 명확하게 거부한다.
- Lifecycle은 immutable create-only다. Duplicate ID는 기존 dataset과 consumer를 바꾸지 않고 오류를 낸다.
- Top-level trace hierarchy는 `createWindowData → createDerivedData + materializeWindowData → editSemantic`이다.
- Window는 row 수를 보존해도 주변 row에 의존하므로 facet은 source partition 뒤 각 child에서 canonical
  materializer를 replay한다. 이미 계산된 전체 dataset을 단순 필터하지 않는다.
- Renderer와 `graphicSpec`에는 window 전용 branch를 추가하지 않았다. 일반 mark가 materialized rows를 소비한다.

## 검증 증거

- Window grammar/action/direct-derived/oracle focused tests: `16/16` pass.
- Unit suite: `1103/1103` pass.
- Contract suite: `121/121` pass.
- Active Gate suite: `8/8` pass.
- Documentation source/generator suite: `32/32` pass.
- Full cumulative suite: `1628/1628` pass.
- Installed-package Node/TypeScript consumer: pass.
- Package artifact: `ggaction@0.0.4`, SHA-256
  `86ccf718b56717902145ddd013f225d01306de4958f3f8c3c7a868b9209fb303`.
- Generated signature, capability, action, reference, metadata와 search freshness checks: pass.
- Full Jekyll verification은 repository failure가 아니라 현재 machine의 Ruby `2.6.10` 때문에 preflight에서
  실행되지 않았다. Locked Pages bundle은 Ruby `3.2+`를 요구한다.

## API와 문서 영향

- Existing API를 바꾸지 않는 additive advanced data action이다.
- Runtime registrar, exact TypeScript types, package consumer, transform registry, Current contract/action catalog와
  generated action reference를 동기화했다.
- Public [Window Data Transforms](../../../../docs/api/data/window.md) 페이지가 defaults, operation vocabulary,
  ordering, collision과 immutable lifecycle을 소유한다.
- `SECOND_ARCHITECTURE.md`에는 facet replay가 필요한 dependent-row transform으로 기록했다.

## 승인 후 작업

사용자가 P5-B를 승인하면 상태를 `approved`로 바꾸고 Step 4 `createBin2DData` lifecycle 구현을 시작한다.
P5-C 전에는 binned `createHeatmap` facade를 구현하지 않는다.
