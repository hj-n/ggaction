# P8-Exit — Categorical density placement closeout

## 상태

- Gate: `P8-Exit`
- 상태: `ready-for-review`
- 승인: 대기 중
- Functional checkpoint: `27a24d5` (`promote violin plot public slice`)
- Documentation checkpoint: `4fd9a7c` (`document violin plot workflow`)
- Review checkpoint: `0f5872c` (`prepare phase 8 exit review`)
- Remote: `origin/main`
- 승인 전 차단: Roadmap 4 Phase 9 production source

## 종료된 public surface

- `encodeDensity({ placement })`와 `editDensity({ placement })`는 기존 baseline을 유지하면서 category
  full/half/split placement를 지원한다.
- `createViolinPlot({ x, y })`는 exactly one categorical + one quantitative role에서 orientation, data,
  coordinate와 compatible scales를 추론한다.
- Public runtime, strict TypeScript, root type export, Current action inventory, package consumer와 public action
  reference가 같은 option vocabulary를 가진다.
- Stable chart slice는 `test/charts/cars-acceleration-violins/`, runnable example은
  `examples/cars-acceleration-violins/`가 소유한다. Active Gate test dependency와 review artifact는 남지 않는다.
- Public wiki, recipe, gallery metadata, full-size PNG/thumbnail, search metadata와 LLM reference를 canonical
  generators로 갱신했다. Docs deploy와 package publish는 수행하지 않았다.

## 최종 executable chain

```javascript
chart()
  .createCanvas({
    width: 720,
    height: 520,
    margin: { top: 90, right: 45, bottom: 80, left: 80 }
  })
  .createData({ values: cars })
  .createViolinPlot({
    id: "violins",
    x: { field: "Origin", fieldType: "nominal" },
    y: { field: "Acceleration", fieldType: "quantitative" },
    color: {
      field: "Origin",
      fieldType: "nominal",
      scale: {
        domain: ["USA", "Europe", "Japan"],
        range: ["#4c78a8", "#f58518", "#54a24b"]
      }
    },
    density: {
      bandwidth: 0.65,
      extent: [8, 25],
      steps: 80,
      width: { band: 0.8, resolve: "shared" }
    },
    area: { opacity: 0.8, strokeWidth: 1.2 },
    guides: { axes: {}, legend: false }
  })
  .createTitle({
    text: "Acceleration Distribution by Origin",
    subtitle: "Kernel-density profiles for the Cars dataset"
  });
```

Exact full/split chains are stored in the stable visual manifest and use the approved guide/title appearance.

## State와 compatibility 결과

- Requested automatic density policy와 resolved bandwidth/extent/split domain은 분리된 immutable provenance다.
- Category field와 position channel, side, width resolution과 optional split intent는 semantic transform에 남는다.
  Band center, concrete half-width와 closed path commands는 `graphicSpec`에만 남는다.
- Baseline↔category revision은 stale encoding/scale cleanup과 connected consumer rematerialization을 atomic하게
  수행한다.
- Canvas/scale/data/filter/selection/highlight/facet/overlay lifecycle와 previous-program/caller-data immutability를
  검증했다.
- Existing omitted-placement baseline output은 exact compatible하며 unsupported combinations는 silent empty chart가
  아니라 validation error다.

## Rendered evidence

Approved artifacts:

- Full: `.artifacts/test/png/charts/chart-variants/cars-acceleration-violins/full/`
  - logical/physical: `720×520` / `1440×1040`
  - primitive/public PNG SHA-256: `faa8fc38543a408c47ce636cce79ed17d398b29f5a2adf6ec10a1933e1a97b60`
- Split era: `.artifacts/test/png/charts/chart-variants/cars-acceleration-violins/split-era/`
  - logical/physical: `760×520` / `1520×1040`
  - primitive/public PNG SHA-256: `4884cd58e8727e4209f8acdd8a87c68a4a7c8109fb3a9ca74a84a3ba592fcc8b`

Approved gallery는 `120` variants, active-review gallery는 `0` variants다.

## 누적 검증 증거

| 검증 | 결과 |
| --- | --- |
| Full normal suite | `1,733/1,733` pass |
| Stable chart suite | `406/406` pass |
| Contract/package-boundary suite | `122/122` pass |
| Node PNG render suite | `121/121` pass |
| Browser example/package suite | `36/36` pass |
| Coverage | `94.56%` lines, `89.9%` branches, `98.65%` functions; `56` critical floors pass |
| Package artifact | `356` entries; `320,657` packed / `1,504,859` unpacked bytes |
| Packed consumer | Node, extension, PNG, violin runtime, strict TypeScript, tutorial, browser와 private-export rejection pass |
| Docs source suite | `32/32` pass |
| Built docs | `100` pages, links/assets/search/LLM targets pass |
| Docs browser | desktop search + every page at `320px`, `390px`, `768px` pass |

Chromium 기반 검증은 macOS sandbox의 loopback/Mach IPC 제한 때문에 권한 확장 환경에서 동일 command를
재실행했다. Ruby 검증은 repository lock과 일치하는 `mise ruby@3.2.6`에서 수행했다.

## 승인 요청 범위

1. NCP-001 category density placement의 final lifecycle와 compatibility
2. `createViolinPlot({ x, y })` public runtime/type/package contract
3. Approved full/split visual과 stable example/chart-test ownership
4. Current inventory, architecture와 public/generated docs 동기화
5. 위 누적 검증을 Phase 8 종료 증거로 채택하는 것

P8-Exit 승인 전에는 Phase 9 production source를 시작하지 않는다.
