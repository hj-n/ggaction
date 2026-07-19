# P3-Exit — Small cross-chart encoding closeout

## 진행 상태

- [x] P-004 weighted theta implementation과 P3-A 승인
- [x] P-008 field-driven stroke width implementation과 P3-B 승인
- [x] runtime, strict declarations와 package root type exports 동기화
- [x] Current contract owner와 Planned cleanup
- [x] primitive/public exact visual evidence
- [x] Browser Canvas와 2x Node PNG
- [x] public docs와 generated references
- [x] full tests, coverage와 installed-package consumer
- [ ] 사용자 승인

Gate 상태: `ready-for-review`

Closeout checkpoint: `73b3118` (`origin/main`)

## 확정 public surface

```typescript
interface ThetaEncodingOptions {
  field: string;
  target?: string;
  fieldType?: FieldType;
  scale?: ThetaScaleOptions;
  coordinate?: string;
  aggregate?: "count" | "sum";
  weight?: string;
}

type StrokeWidthEncodingOptions =
  | { target?: string; value: number }
  | {
      target?: string;
      field: string;
      fieldType?: "quantitative";
      scale?: StrokeWidthScaleOptions;
    };

encodeTheta(options: ThetaEncodingOptions): ChartProgram;
encodeStrokeWidth(options: StrokeWidthEncodingOptions): ChartProgram;
```

`ThetaEncodingOptions`, `ThetaScaleOptions`, `StrokeWidthEncodingOptions`와
`StrokeWidthScaleOptions`는 package root에서 export된다.

대표 호출은 다음과 같다.

```javascript
weightedDonut.encodeTheta({
  field: "cluster",
  fieldType: "nominal",
  aggregate: "sum",
  weight: "pop",
  scale: { domain: [0, 1, 2, 3, 4, 5] }
});

weightedRules
  .encodeStrokeWidth({
    field: "Weight_in_lbs",
    scale: { domain: [1500, 5200], range: [1, 8] }
  })
  .createLegend({ channels: ["strokeWidth"], count: 5 });
```

## 통합 계약

- Weighted theta는 source row를 확장하지 않고 category별 non-negative finite weight 합으로 sector sweep을
  결정한다. Existing count mode와 selection member grain은 유지된다.
- Field-driven stroke width는 rule item 또는 complete line series grain을 사용한다. Line series 내부 값이
  여러 개면 임의 집계하지 않는다.
- Stroke-width scale은 point size와 독립적이며 mark, scale, Canvas와 standalone sampled legend lifecycle에
  연결된다.
- 두 기능 모두 semantic intent와 wrapped trace를 저장하고 기존 arc/path/line renderer primitive를 재사용한다.
- 기존 `encodeTheta({ aggregate: "count" })`와 `encodeStrokeWidth({ value })` API는 호환된다.
- P-004/P-008은 `ACTION_INDEX` Current에만 존재하고 Planned action/capability에는 남지 않는다.

## 실행 증거

- Phase closeout audit: 4/4 pass
- Phase Gate/closeout focused suite: 9/9 pass
- Full suite: 1624/1624 pass
- Coverage: 94.90% lines, 90.31% branches, 98.53% functions; critical floors 55/55
- Browser Canvas: 30/30 pass
- Node render/gallery: 115/115 pass; Roadmap 2/3/4 galleries verified
- Weighted-theta and stroke-width primitive/public pairs: exact graphic equality and pixel equality
- Package artifact: 328 entries, 286,801 packed bytes, 1,339,259 unpacked bytes
- Installed tarball SHA-256:
  `80ca0f4ed57abd8e4fa6f9bbf4358d0f82cb19a6dd1f82e5397b3a381d05de16`
- Installed tarball: Node runtime, Browser, PNG, strict TypeScript, tutorials와 private-export rejection pass
- Docs source/generation: 27/27 pass. Local built-doc verification은 installed Jekyll executable 부재로
  실행하지 못했으며 links, images, signatures, capabilities와 LLM references는 통과했다.

## 검토 이미지

- Weighted theta:
  `.artifacts/test/png/roadmap4/weighted-theta/gapminder-population-donut/weighted-theta/user-facing.png`
- Field stroke width:
  `.artifacts/test/png/roadmap4/field-stroke-width/cars-weighted-rules/field-stroke-width/user-facing.png`

## 승인 후

P3-Exit 승인 후 Phase 3를 `completed`로 전환하고 Phase 4 deterministic jitter 진입 조건을 연다.
승인 전에는 Phase 4를 시작하지 않는다.
