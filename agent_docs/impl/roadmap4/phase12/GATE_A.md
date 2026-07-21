# P12-A — Collision-aware Label Layout contract와 primitive visual 검토

## 상태

- Gate: `P12-A`
- 상태: `approved`
- 승인일: `2026-07-21`
- 승인 근거: 사용자가 후보 API, lifecycle, state ownership, best-effort warning policy와 primitive visual을 명시적으로 승인
- Primitive source checkpoint: `47a1a45` (`prepare label layout primitive gate`)
- Remote: `origin/main`
- 승인으로 해제: production label-layout grammar, action, state와 rematerialization 구현

현재 runtime, exact declarations, Current action catalog와 public docs에는 후보 API를 추가하지 않았다.

## 후보 public API

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
  target?, axis?, padding?, maxDisplacement?, bounds?, leader?
}): ChartProgram;

removeLabelLayout({ target? }): ChartProgram;
```

### Defaults와 inference

- `target`은 current complete text mark, unique complete text mark 순서로만 추론한다. Ambiguity는 오류다.
- `axis` default는 `"both"`; `"x" | "y" | "both"`만 허용한다.
- `padding` default는 `3`, `maxDisplacement` default는 `48` logical pixel이다.
- `bounds` default는 `"plot"`; explicit `"canvas"`도 현재 Canvas bounds를 사용한다.
- `leader` default는 `false`. Object는 existing line `stroke`, `strokeWidth`, `strokeDash`, `opacity` vocabulary를
  재사용한다.
- Repeated `layoutLabels()`는 complete policy를 교체하고 semantic base text에서 다시 계산한다.
- `removeLabelLayout()`은 policy와 leader를 제거하고 semantic base text positions를 복원한다.

## Target executable chain

```javascript
chart()
  .createCanvas({
    width: 760,
    height: 520,
    margin: { top: 88, right: 38, bottom: 72, left: 76 }
  })
  .createData({ id: "countries2005", values: rows })
  .createPointMark({
    id: "countries",
    data: "countries2005",
    fill: "#2563eb",
    stroke: "#ffffff",
    strokeWidth: 0.8
  })
  .encodeX({
    target: "countries",
    field: "fertility",
    fieldType: "quantitative",
    scale: { domain: [1.2, 2.15], zero: false }
  })
  .encodeY({
    target: "countries",
    field: "life_expect",
    fieldType: "quantitative",
    scale: { domain: [77.2, 83], zero: false }
  })
  .createTextMark({
    id: "countryLabels",
    fontSize: 11,
    align: "left",
    baseline: "middle",
    dx: 7
  })
  .encodeText({ target: "countryLabels", field: "country" })
  .layoutLabels({
    target: "countryLabels",
    axis: "both",
    padding: 3,
    maxDisplacement: 64,
    bounds: "plot",
    leader: { stroke: "#94a3b8", strokeWidth: 0.8, opacity: 0.9 }
  })
  .createGuides({
    axes: {
      x: { title: { text: "Fertility" } },
      y: { title: { text: "Life expectancy" } }
    },
    grid: { horizontal: true, vertical: true },
    legend: false
  })
  .createTitle({
    text: "Fertility and Life Expectancy",
    subtitle: "Selected countries in 2005"
  });
```

Exact displayed chain은 `test/gates/gapminder-country-labels/manifest.js`가 소유한다.

## Action hierarchy와 ownership

```text
layoutLabels
└─ materializeLabelLayout              internal wrapped action
   ├─ rematerializeTextMark            semantic base text 먼저 복원
   ├─ editGraphics(countryLabels x/y)
   └─ create/editGraphics(leaders)      enabled and non-empty only

removeLabelLayout
├─ remove private label-layout config
├─ editGraphics(leaders, remove: true)  when present
└─ rematerializeTextMark
```

- Semantic text content, x/y encoding과 stored source relation은 바뀌지 않는다.
- Requested policy와 latest deterministic warning summary는
  `materializationConfigs.labelLayouts[target]` 하나가 소유한다.
- Final text positions와 ordinary leader lines만 `graphicSpec`에 존재한다.
- Source point anchor는 text layer의 explicit `source`가 있을 때만 사용한다. Arbitrary nearby mark를 탐색하지 않는다.
- Text/font/encoding/data/scale/Canvas edit는 base text를 먼저 rematerialize한 뒤 label layout을 한 번 replay한다.

## Independent oracle 결과

- Oracle은 production source를 import하지 않고 deterministic glyph-width table, rotated bounds, candidate order,
  padded intersection, bounded best-effort score와 leader/rectangle intersection을 계산한다.
- Literal `"Wi"`, font size 10의 width는 floating tolerance 내 `10.9`; centered-middle bounds는
  `{ left: 44.55, right: 55.45, top: 15, bottom: 25 }`다.
- `padding: 3`의 첫 five both-axis offsets는 `(0,0)`, `(0,-3)`, `(0,3)`, `(3,0)`, `(-3,0)`이다.
- Impossible zero-displacement fixture는 stable `overlap`, `bounds` warning을 모두 반환한다.
- Gapminder target은 base overlap 4쌍을 0쌍으로 줄인다. 4개 label이 이동하고 3개 leader가 생기며 최대
  displacement는 약 `15.2971px`로 requested `64px` 이하다.

## Primitive visual

- Source: `test/gates/gapminder-country-labels/primitive.program.js`
- Artifact: `.artifacts/test/png/review/gapminder-country-labels/collision-aware/primitive.png`
- Logical/physical: `760×520` / `1520×1040`
- SHA-256: `c0741e4e44cf3ea95c29e568b01e08d04e78c185ff09969d410ad847ca77d1e5`
- 18 points/labels, zero remaining label overlap, three concrete leaders
- Drawing order: grid → leaders → points → labels → axes → title
- Future `layoutLabels`/`removeLabelLayout` trace, state, runtime 또는 renderer branch 없음

## 검증 증거

| 검증 | 결과 |
| --- | --- |
| Focused Gate suite | `3/3` pass |
| Full normal suite | `1,811/1,811` pass |
| Full Node PNG suite | `124/124` pass |
| Approved artifact gallery | `122` variants verified |
| Active-review gallery | `1` variant verified, desktop/mobile |
| Boundary | production source/types/Current catalog/public docs unchanged |

Playwright gallery 검사는 macOS Mach IPC sandbox 제한 때문에 권한 확장 환경에서 동일 생성물에 대해 통과했다.

## 승인 요청 범위

1. `layoutLabels`와 symmetric `removeLabelLayout` lifecycle
2. target/axis/padding/maxDisplacement/bounds/leader defaults와 inference
3. graphical policy/warning, semantic source relation과 concrete text/leader ownership
4. deterministic best-effort 및 impossible-layout warning policy
5. Gapminder primitive source, 0-overlap result와 rendered visual

P12-A 승인으로 production grammar, actions와 rematerialization lifecycle 구현이 해제되었다. Current/public
contracts와 docs closeout은 P12-B 승인 전까지 차단한다.
