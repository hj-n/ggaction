# Roadmap 2 — Phase 11 Step 5: Guide Ownership and Draw Order

## 목표

Grid, axis, legend와 title action이 graphical role에 맞는 owner와 deterministic sibling position을 명시하게 한다.

## 진행 상태

- [x] Horizontal and vertical grid attachment below every plot mark
- [x] X/Y axis component attachment above every plot mark
- [x] Regression band placement below points and regression line placement above points
- [x] Legend direct Canvas ownership and stable multi-block order
- [x] Title direct Canvas ownership and stable edge placement
- [x] Guide create/edit/rematerialize attachment preservation
- [x] Order independence from guide action call timing
- [x] Canvas resize and scale-edit draw-order regression
- [x] STEP status, conceptual commit and push

## 구현 결과

- Grid lookup은 flat root scan 대신 production tree traversal로 related mark를 찾고 같은 plot owner 안에서 mark 앞에
  배치한다.
- Axis는 plot의 마지막 guide block, legend는 Canvas의 plot 뒤이자 title 앞, title/subtitle은 Canvas의 마지막
  layout block으로 저장된다.
- 나중에 추가한 ordinary mark는 existing axis 앞에 삽입되고, title 뒤에 추가한 legend도 title 앞으로 배치된다.
- Guide 및 title의 remove/recreate reconciliation은 기존 parent와 sibling 위치를 보존한다.

## 완료 조건

The stored tree—not incidental action timing—determines grid, band, mark, highlight, axis, legend and title order.
