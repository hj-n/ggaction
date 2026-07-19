# STEP 4 — Mark and Encoding Orchestration

## 진행 상태

- [x] Common mark lifecycle의 실제 중복 범위 확정
- [x] Point/line/area/arc/rect/rule/text/bar orchestration 책임 정리
- [x] Color encoding resolver/policy와 wrapped action facade 분리
- [x] Position과 Polar axis registration 이름 충돌 제거
- [x] Action trace와 primitive/public exact equivalence 유지

Generic factory가 action hierarchy나 mark-specific policy를 숨기면 도입하지 않는다.

## 결과

- Mark family별 create/edit/materialize 흐름은 서로 다른 option, completeness와 trace를 가지므로 기존 family owner에 유지했다.
- 실제 공통 lifecycle인 highlight baseline reconciliation은 기존 `marks/lifecycle.js` 하나가 계속 소유하며 generic mark factory는 추가하지 않았다.
- Color encoding은 categorical facade, continuous resolver, layout companion과 validation policy로 분리했다.
- Position과 Polar axis registration의 유일한 진입점은 각각 owning directory의 `index.js`다.
- 관련 encoding/guide tests 85개와 normal suite 1,543개가 통과했다.
