# Step 4 — `createBin2DData` vertical slice

## 진행 상태

- [ ] schema/validation과 pure 2D bin grammar
- [ ] deterministic edge/member/count materialization
- [ ] auto/explicit extent와 empty cell contract
- [ ] replacement, revision, source edit/filter rematerialization
- [ ] facet replay와 generated resource release
- [ ] declarations, package smoke와 P5-C 사용자 승인

Production 구현은 P5-B 승인 뒤 시작한다. Floating edge 계산은 한 pure helper가 소유하며 materializer와
tests가 서로 다른 구현을 공유하지 않는다.
