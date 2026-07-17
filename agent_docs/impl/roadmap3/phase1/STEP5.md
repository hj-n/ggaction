# STEP 5 — Domain Removal Primitive Variants

## 진행 상태

- [x] Axis/grid/legend/title complete cleanup target
- [x] One independent layered mark cleanup target
- [x] Owned semantic properties/config/graphic dependency absence assertions
- [x] Recreate-safe deterministic identity contract 확정

## 구현

Guide removal target은 Cars histogram bars를 유지하면서 axes, grid, legend와 title을 제거한다. Mark removal
target은 Gapminder layered bar+point chart에서 point만 제거해 shared dataset, scales, coordinate, axes와 bar를
보존한다. Primitive는 canonical structural config cleanup helper만 사용한다.

현재 `editSemantic({ remove: true })`는 property branch를 제거할 수 있지만 complete layer resource를 직접
제거할 수는 없다. 따라서 Gate target은 point layer의 owned properties와 graphic을 제거하되 `{ id: "point" }`
container가 남는 현재 한계를 test로 드러낸다. Gate 승인 뒤 `removeMark` 구현은 resource-level semantic removal을
정식 primitive contract로 추가해 empty shell도 제거해야 한다.
