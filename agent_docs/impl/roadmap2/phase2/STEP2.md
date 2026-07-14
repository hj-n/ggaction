# Roadmap 2 — Phase 2 Step 2: Concrete Path-Command Foundation

## 목표

모든 path-based mark가 renderer-ready `M | L | C | Z` command만 canonical geometry로 저장하도록 공통
schema, materializer와 Canvas renderer를 이관한다.

## 진행 상태

- [x] `ConcretePathCommand` shared schema와 validation
- [x] `path.commands` graphical property와 edit/render parity
- [x] Canvas command execution과 state isolation
- [x] Line path의 point-array → linear commands migration
- [x] Area/density/regression path migration
- [x] Closed point-shape path migration
- [x] Old/new duplicate canonical geometry 제거
- [x] Invalid/incomplete command와 atomic edit coverage
- [x] Existing chart semantic/graphic/render regression
- [x] TypeScript와 extension primitive docs
- [x] `SECOND_ARCHITECTURE.md` path representation 갱신
- [x] Conceptual commit와 push

## 구조 결정

Pure command builder는 program과 trace를 모르고 deterministic command array를 반환한다. Mark materializer가
그 결과를 wrapped `editGraphics`로 저장한다. Renderer는 command를 실행할 뿐 interpolation이나 closure를
추론하지 않는다.

## 구현 결과

`src/grammar/pathCommands.js`가 exact `M | L | C | Z` schema와 linear command builder를 소유한다.
하나의 path는 initial `M` 하나, 최소 하나의 `L` 또는 `C`, optional final `Z`만 허용한다. Command별 key와
finite coordinate/control point를 엄격히 검증하며 builder output은 owned immutable state다.

```javascript
[
  { op: "M", x: 80, y: 320 },
  { op: "L", x: 130, y: 280 },
  { op: "C", x1: 150, y1: 260, x2: 170, y2: 240, x: 190, y: 230 }
]
```

Line은 open `M/L` commands, area·density·regression band와 polygon point shape는 final `Z`를 가진 commands를
저장한다. `path.points`와 `path.closed`는 graphical property vocabulary에서 제거했다. Canvas renderer는
`moveTo`, `lineTo`, `bezierCurveTo`, `closePath`를 command 그대로 실행하고 fill closure를 추론하지 않는다.

Primitive reference program은 production mark materializer를 재사용하지 않고 test-owned point→command
conversion으로 expected state를 만든다. Contract test는 기존 여섯 chart의 primitive/public path node를
모두 순회해 `commands`만 존재하고 `points`/`closed`가 없음을 검증한다. 기존 docs PNG binary는 재생성 뒤에도
변경되지 않아 linear migration의 pixel parity를 확인했다.

Public TypeScript는 `ConcretePathCommand` union을 제공하고 extension primitive 문서는 command schema,
filled-path final `Z` 조건과 concrete example을 설명한다.

## 완료 조건

기존 여섯 public chart와 primitive chart의 visual output이 유지되고 `graphicSpec` path에는 canonical
`commands`만 남는다.
