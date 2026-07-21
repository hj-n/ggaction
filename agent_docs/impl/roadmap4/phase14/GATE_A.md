# P14-A — Basic Chart facade parity contract

## 상태

- Gate: `P14-A`
- 상태: `approved`
- 승인: 2026-07-21 사용자 승인
- Audit checkpoint: `b92d25d` (`audit basic chart facades`)
- Remote: `origin/main`
- 승인 전 차단: P14-R1~R4 production changes와 representative visual

## 감사 결론

현재 여덟 facade 모두 public runtime, strict type, Current contract와 canonical example을 가진다. 다만 lifecycle은
두 family로 나뉜다.

| Family | Actions | Edit lifecycle |
| --- | --- | --- |
| Aggregate create-only | Scatter, Line, Bar, Histogram, Heatmap, Parallel Coordinates | existing mark/encoding/scale/guide actions |
| Mutable composite | Gradient Plot, Box Plot | owner edit action + ordinary scale/guide actions |

따라서 모든 signature나 edit API를 똑같게 만들지 않는다. Shared parity는 stable role ID, safe data/resource
inference, coordinate ownership, guide opt-out, immutable preflight, meaningful wrapped trace와 documented edit handoff다.

## 확인된 repair 후보

### P14-R1 — Box data inference

`createBoxPlot`만 explicit/source/current 뒤 unique dataset fallback이 없다. Existing precedence를 바꾸지 않고 마지막
fallback과 multi-dataset ambiguity error를 추가한다.

### P14-R2 — Box guide control

`createBoxPlot`은 guide를 자동 생성하지 않고 canonical example이 뒤에서 `createGuides`를 별도로 호출한다.
`guides?: false | CreateGuidesOptions`를 additive하게 추가하되 omission과 `false`는 현재처럼 guide를 만들지 않는다.
명시적인 `{}` 또는 option object만 applicable guide를 owner action 안에서 생성한다.

### P14-R3 — Box source ambiguity

여러 compatible source layer가 있는데 target/x/y를 생략하면 generic incomplete-orientation error로 늦게 실패할 수
있다. Candidate source가 여러 개면 명확한 target/position ambiguity error를 child authoring 전에 낸다.

### P14-R4 — Box options type export

`BoxPlotOptions`는 public `ChartProgram.createBoxPlot` signature에 쓰이지만 package root type export에는 빠져 있다.
다른 facade option type처럼 root에서 export해 TypeScript 사용자가 직접 import할 수 있게 한다.

## 유지할 차이

- Box position은 category/measure role을 알아야 하므로 string shorthand를 새로 추론하지 않는다.
- Gradient/Box의 `target` inference와 owner edit action은 layered statistical use case를 위해 유지한다.
- Histogram `field`, Parallel `dimensions`, Heatmap mode별 required meaning처럼 chart-specific 최소 입력은 통일하지 않는다.
- Ordinary facade용 aggregate edit action은 추가하지 않는다.
- Existing canonical chart visuals와 default guides는 변경하지 않는다.

## P14-B까지의 검증 계획

1. 8개 shortest/explicit data-ID-coordinate-guide paths와 ambiguity/unknown-option errors
2. Facade trace가 documented child hierarchy를 실제로 호출하고 primitive/equivalent chain과 수렴
3. 생성 후 mark/encoding/scale/guide 또는 composite owner edit의 deterministic rematerialization
4. Multiple facade layer/composition에서 resource identity와 earlier-program immutability
5. Representative primitive/public exact graphic, Canvas-call, Browser와 Node PNG parity

## 승인 요청 범위

1. 8개 facade를 두 lifecycle family로 감사하는 parity model
2. P14-R1 unique data inference, P14-R2 Box guides, P14-R3 source ambiguity, P14-R4 root type export repair
3. Signature 강제 통일과 새 aggregate edit action을 만들지 않는 non-goals
4. 위 matrix를 Phase 14 production/visual closeout의 기준으로 채택하는 것

승인 후 source inspection에서 P14-R2의 기존 동작 기록 오류를 발견했다. 사용자는 호환성을 보존하는
`omission = no guides`, explicit object = create guides 계약을 추가 승인했다.

## 검증 증거

- `node --test test/contracts/basic-chart-facades.test.js` — 4/4 pass
- `node --test test/contracts/agent-docs-navigation.test.js` — 7/7 pass
- `npm run test:contracts` — 136/136 pass
- `git diff --check` — pass
