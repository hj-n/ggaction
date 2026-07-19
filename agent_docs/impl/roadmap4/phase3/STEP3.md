# Step 3 — Field-driven stroke width

## 진행 상태

- [x] exact option과 quantitative scale 계약
- [x] line series / rule item grain validation
- [x] semantic storage, scale/legend dependency와 rematerialization
- [x] primitive/public visual pair와 P3-B Gate

P3-A 사용자 승인 전에는 시작하지 않는다.

## 확정한 계약

- `encodeStrokeWidth({ value })`는 기존 rule constant action을 그대로 유지한다.
- `encodeStrokeWidth({ field, fieldType?, scale? })`는 quantitative field encoding이며 line과 rule만 받는다.
- Rule은 final item마다 field 값을 mapping한다.
- Line은 final series마다 정확히 하나의 field 값만 허용한다. 한 series 안에 값이 여러 개면 임의 집계하지 않고
  명시 오류를 낸다.
- `strokeWidth`는 `size`와 분리된 scale owner이며 기본 concrete range는 `[1, 8]`이다.
- Field 값과 explicit domain은 non-negative finite number여야 한다.
- `createLegend({ channels: ["strokeWidth"] })`는 sampled line symbol을 만들고 기본 5개 값을 표시한다.
- `editScale({ scale: "strokeWidth", ... })`는 mark와 범례를 함께 다시 materialize한다.
- Field encoding을 constant로 교체하거나 `removeLegend()`를 호출하면 stale stroke-width legend가 남지 않는다.

## 검증 대상

- Unit: rule item grain, line series grain, invalid/mixed values, scale edit와 legend lifecycle
- Exact visual parity: `test/gates/field-stroke-width/`
- Browser Canvas와 2x Node PNG: Roadmap 4 `field-stroke-width` artifact
- Strict declaration과 installed package consumer: field option type과 runtime chain
- Public docs와 generated action/capability/LLM references
