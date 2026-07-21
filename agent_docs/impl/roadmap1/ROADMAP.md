# Roadmap 1 — Initial Chart Foundations

> **문서 상태 — 완료된 실행 기록.** 당시 계획과 결정을 보존한다. 현재 동작은
> [`ACTION_INDEX.json`](../../contract/ACTION_INDEX.json)과 current contract를 기준으로 판단한다.

## 목적

Roadmap 1은 primitive action부터 reusable chart-authoring API까지 구축한 최초 여섯 Phase의
완료 기록이다. Scatterplot을 시작으로 line, histogram, grouped bar, regression, density area를
차례로 구현하며 immutable program, action trace, explicit materialization, Canvas/PNG renderer,
guides와 statistical transforms의 현재 기반을 만들었다.

## 진행 상태

- [x] Phase 1 — Canvas scatterplot과 action/primitive 기반
- [x] Phase 2 — Grouped aggregate line chart
- [x] Phase 3 — Stacked histogram
- [x] Phase 4 — Grouped bar chart
- [x] Phase 5 — Layered regression scatterplot
- [x] Phase 6 — Grouped density area chart
- [x] Public/primitive equivalence, browser, PNG와 documentation 정리

## Phase 기록

1. [`phase1/`](phase1/) — cars scatterplot, Canvas renderer, primitive/action hierarchy와 guides 기반
2. [`phase2/GOAL.md`](phase2/GOAL.md) — temporal aggregate line, series grouping, dash와 combined legend
3. [`phase3/GOAL.md`](phase3/GOAL.md) — bin/count/stack histogram, grid와 categorical legend
4. [`phase4/GOAL.md`](phase4/GOAL.md) — ordinal grouped bar, xOffset와 band geometry
5. [`phase5/GOAL.md`](phase5/GOAL.md) — filtered points, regression data, confidence band와 fitted line
6. [`phase6/GOAL.md`](phase6/GOAL.md) — grouped KDE, baseline area, top legend와 title layout

## Chart 계약

- [`chart/regression-scatterplot.md`](chart/regression-scatterplot.md)
- [`chart/density-area.md`](chart/density-area.md)

Roadmap 1 문서는 완료 당시의 실행 계획과 결과를 보존한다. 현재 API와 architecture의 canonical
계약은 `agent_docs/contract/current/`, `ACTION_INDEX.json`, `SECOND_ARCHITECTURE.md`가 소유한다.
