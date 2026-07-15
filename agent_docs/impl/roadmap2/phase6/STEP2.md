# Roadmap 2 — Phase 6 Step 2: Rule Geometry Primitives

## 목표

Public rule actions 전에 raw semantic/graphic primitives로 final rule endpoint geometry를 고정한다.

## 진행 상태

- [ ] Synthetic/cars-backed rule fixture and independent coordinates
- [ ] Full-span vertical rule primitive
- [ ] Full-span horizontal rule primitive
- [ ] Bounded vertical/horizontal rule primitives
- [ ] Diagonal field/datum endpoint primitive
- [ ] Concrete line completeness, order and renderer calls
- [ ] `rule-geometry` metadata and 2× `primitive.png`
- [ ] Gate A user visual confirmation
- [ ] STEP status, conceptual commit and push

## Gate A

One Canvas shows the representative full-span and bounded/diagonal rule classes with distinguishable constant
stroke styles. Future `createRuleMark`, `encodeX2`, `encodeStroke` or `encodeStrokeWidth` must not appear in the
primitive trace.

## 완료 조건

Every accepted endpoint class resolves to finite concrete `line` children and the visual target is approved.
