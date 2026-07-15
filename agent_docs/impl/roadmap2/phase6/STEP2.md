# Roadmap 2 — Phase 6 Step 2: Rule Geometry Primitives

## 목표

Public rule actions 전에 raw semantic/graphic primitives로 final rule endpoint geometry를 고정한다.

## 진행 상태

- [x] Synthetic/cars-backed rule fixture and independent coordinates
- [x] Full-span vertical rule primitive
- [x] Full-span horizontal rule primitive
- [x] Bounded vertical/horizontal rule primitives
- [x] Diagonal field/datum endpoint primitive
- [x] Concrete line completeness, order and renderer calls
- [x] `rule-geometry` metadata and 2× `primitive.png`
- [ ] Gate A user visual confirmation
- [x] STEP status, conceptual commit and push

## Gate A

One Canvas shows the representative full-span and bounded/diagonal rule classes with distinguishable constant
stroke styles. Future `createRuleMark`, `encodeX2`, `encodeStroke` or `encodeStrokeWidth` must not appear in the
primitive trace.

### Gate A result

- Artifact: `.artifacts/test/png/roadmap2/cars-error-bar/rule-geometry/primitive.png`
- Full spans: `x = 15`, `y = 82`
- Bounded intervals: `(x, y, y2) = (38, 18, 66)`, `(y, x, x2) = (38, 52, 88)`
- Diagonal field endpoints: `(xStart, yStart) = (60, 92)`, `(xEnd, yEnd) = (92, 58)`
- All five objects are complete backend-neutral `line` graphics with explicit style properties.
- The primitive trace contains none of the future rule-facing actions.

## 완료 조건

Every accepted endpoint class resolves to finite concrete `line` children and the visual target is approved.
