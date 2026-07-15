# Roadmap 2 — Phase 7 Step 6: Curve and Boundary Primitives

## 목표

Gapminder data로 curved area와 lower/upper boundary 조합을 raw primitives로 만들고 Gate C에서 style와 drawing order를
승인받는다.

## 진행 상태

- [x] Representative non-linear area curve target
- [x] Inherited boundary curve target
- [x] Boundary curve override target
- [x] Custom stroke/width/dash/opacity targets
- [x] Band-before-lower-before-upper drawing order
- [x] Variant manifest and exact future call chain
- [x] `gapminder-curved-boundaries/primitive.png`, override primitive and Canvas checks
- [x] Gate C user confirmation
- [x] STEP status, conceptual commit and push

## Gate C

Band curve는 `cardinal`이다. 첫 target의 boundaries는 이를 상속하고, 둘째 target은 `step`으로 override한다.
두 target 모두 stroke `#25364d`, width `1.4`, dash `[6, 3]`, opacity `0.8`을 사용한다. Curve는 discrete
interval points를 지나며 lower/upper paths가 band와 같은 grouping/order를 유지해야 한다. Boundary는 fill을
가리지 않되 겹치는 series에서도 읽을 수 있어야 한다. 승인 전에는 area curve와 boundary aggregate
implementation을 완료하지 않는다.

## 완료 조건

Chosen curve/default inheritance/override와 boundary visual order가 승인된다.
