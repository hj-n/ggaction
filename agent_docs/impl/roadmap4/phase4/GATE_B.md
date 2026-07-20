# Gate P4-B — Public deterministic point jitter

## 상태

- Gate: `P4-B`
- 상태: `approved` (2026-07-20)
- 검토 대상 remote checkpoint: `c4d26d3`
- P4-B 승인 전 차단: Phase 4 closeout, executable closeout audit와 `P4-Exit`

## 승인 대상 public API

```typescript
type JitterMaxOffset =
  | { pixels: number; band?: never }
  | { pixels?: never; band: number };

jitterPoints({
  target?,
  channel,
  maxOffset,
  seed?,
  key?
}: JitterPointsOptions): ChartProgram;

removeJitter({ target? } = {}): ChartProgram;
```

Canonical executable source는 `examples/point-jitter/program.js`다. 검토할 핵심 call은 다음 두 개다.

```javascript
.jitterPoints({
  target: "observations",
  channel: "x",
  maxOffset: { band: 0.168 },
  seed: "cars-origin-strip",
  key: "Name"
})
```

```javascript
.jitterPoints({
  target: "observations",
  channel: "y",
  maxOffset: { band: 0.16 },
  seed: "gapminder-cluster-strip",
  key: "country"
})
```

## 의미와 state 결과

- `semanticSpec`의 x/y field, field type, scale, coordinate와 source values는 바뀌지 않는다.
- Requested policy와 resolved per-item offsets는 `materializationConfigs.jitters[target]`에 immutable하게 저장된다.
- `graphicSpec`에는 clamp가 끝난 final concrete point center만 저장된다. Renderer branch는 추가하지 않았다.
- 같은 target 재호출은 semantic base position에서 policy를 교체하고 offset을 누적하지 않는다.
- `removeJitter`는 config를 structural remove하고 base scale position을 복구한다.
- `channel` selector는 semantic value를, `property` selector는 jitter 이후 concrete geometry를 읽는다.
- Explicit `key`는 source reorder 뒤에도 item offset을 유지한다. Key 생략 시 stable source index를 사용한다.
- Shape/radius/stroke extent 전체를 plot bounds에 clamp하고 categorical scale에서는 category slot에도 clamp한다.
- Canvas, scale, filter/data, size, shape, stroke, selection/highlight와 facet replay가 같은 assignment를 재적용한다.
- Polar, collision-free beeswarm/packing과 density-aware placement는 명시적 non-goal이다.

## primitive/public visual parity

- Cars x-jitter primitive: `.artifacts/test/png/roadmap4/point-jitter/cars-origin-jitter/vertical-band/primitive.png`
- Cars x-jitter public: `.artifacts/test/png/roadmap4/point-jitter/cars-origin-jitter/vertical-band/user-facing.png`
- Gapminder y-jitter primitive: `.artifacts/test/png/roadmap4/point-jitter/gapminder-cluster-jitter/horizontal-band/primitive.png`
- Gapminder y-jitter public: `.artifacts/test/png/roadmap4/point-jitter/gapminder-cluster-jitter/horizontal-band/user-facing.png`
- 두 pair 모두 same-run decoded pixel hash와 complete `semanticSpec`, `graphicSpec`, Canvas calls가 exact match한다.
- 2x Node PNG physical size: Cars `1280 × 880`, Gapminder `1360 × 920`.

## 검증 증거

- Focused grammar/action/contract/visual tests: `28/28` pass.
- Full suite: `1646/1646` pass.
- Coverage: `94.86%` lines, `90.23%` branches, `98.55%` functions; critical floors `55/55` pass.
- Full Node PNG render: `117/117` pass.
- Roadmap 2/3/4 gallery Chromium verification: pass.
- Package artifact: `330` entries, `290084` packed bytes, `1352842` unpacked bytes.
- Installed-package runtime/TypeScript consumer: pass.
- Public docs source/link/action classification: `27/27` pass.
- P4-Exit follow-up에서 `.ruby-version`과 일치하는 `mise` Ruby `3.2.6`으로 Jekyll build, built-link 검증과
  전체 85 pages의 desktop/mobile browser 검증을 완료했다.

## API와 문서 영향

- Backward compatible additive API다. Existing point, renderer와 selector behavior는 변경하지 않는다.
- `types/program.d.ts`, package runtime prototype, Current mark contract, action index/catalog,
  point API page, complete action reference, supported-features와 generated LLM docs를 동기화했다.
- Canonical public examples 두 개를 registry와 complete vertical-slice tests에 연결했다.

## 승인 결과

2026-07-20 사용자 승인으로 `c4d26d3`의 public `jitterPoints` / `removeJitter` API,
graphical-only state ownership, replacement/removal lifecycle, rematerialization integration과 두 exact visual
결과를 확정했다. Phase 4 closeout과 P4-Exit 검증이 열렸다.
