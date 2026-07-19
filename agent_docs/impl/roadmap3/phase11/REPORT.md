# Roadmap 3 Phase 11 — External Evaluation Closeout Report

## 결론

외부 평가의 F-008~F-015 8건을 모두 재현했고, 관찰과 source가 일치하는 항목만 채택해 공통 owner를
수정했다. 8건은 모두 `fixed`다. 평가 작업공간
`/Users/hj/Desktop/ggaction_test/0.0.3`은 원문, 재현과 증거를 읽는 용도로만 사용했으며 어떤 파일도
수정하지 않았다.

이번 수정은 공개 action을 제거하거나 이름을 바꾸지 않는다. Runtime이 문서·타입보다 좁았던 입력은 기존
계약대로 동작하게 했고, backend별 silent corruption은 같은 의미로 normalize했다. 따라서 다음 배포는
breaking release가 아닌 patch release 후보로 판단한다.

## Finding 결과표

| Finding | 재현 | 원인과 수정 owner | 회귀 테스트 | 호환성·문서 | 상태 |
|---|---|---|---|---|---|
| F-012 numeric `fontWeight` | Node PNG에서 `650` 호출은 성공하지만 glyph가 수백 px로 커지는 silent corruption 재현 | `src/renderers/canvas/text.js`가 numeric weight를 Canvas font 문자열에 그대로 삽입했다. Renderer boundary에서 finite number를 100단위로 반올림하고 100–900으로 clamp한다. Authored state는 유지한다. | Canvas text unit, title/facet/legend/Cartesian·Polar label glyph bounds, installed tarball PNG | 기존 `string \| number` API 유지. Typography 문서와 LLM 문서에 backend 공통 정책 명시 | fixed |
| F-013 right categorical legend `offset` | create 8/80과 edit 8→80이 같은 x 좌표를 만드는 현상 재현 | Right categorical layout만 `30`을 hardcode했다. `src/actions/guides/legends/categorical/layout.js`에서 plot boundary + explicit offset을 사용하도록 통일했다. | 네 방향 categorical control, right continuous control, create/edit 수렴, package consumer 72px 이동 | 기존 option 의미를 복구. API 변경 없음 | fixed |
| F-015 sequential `palette.count` | 타입과 문서는 허용하지만 runtime이 `Continuous palette does not accept count.`로 거부 | Top-level/nested descriptor policy가 내부 palette sampler보다 좁았다. Palette와 continuous-color grammar가 같은 count validator와 sampler를 사용한다. | top-level/nested 동등성, create/edit scale, encodeColor, mark/legend rematerialization, ordinal control, caller/prior immutability, installed tarball | 허용 범위의 additive 복구. `count >= 2`를 scale·color·LLM 문서에 명시 | fixed |
| F-014 strict TypeScript extension | 문서의 prototype 패턴을 strict NodeNext에서 compile하면 `TS2339` 재현 | Declaration이 wrapped action의 concrete subclass `this`를 보존하지 않았고 공식 interface-merging 패턴이 없었다. `types/extension.d.ts`의 `action()`을 subclass-preserving generic으로 만들고 공식 예제를 추가했다. | Fresh tarball, `strict`, NodeNext, `skipLibCheck: false` compile과 대응 JS runtime chain/trace | 기존 JS와 declaration 호출에 additive. Cast 없는 공식 extension 문서 추가 | fixed |
| F-008 docs route/fragment | 공개 `llms.txt` target 40개 중 Markdown route 39개가 404, fragment 5개가 실제 heading과 불일치 | LLM generator와 site route/slug가 별도 수동 source였다. Page registry의 pretty HTML route와 explicit heading ID를 canonical owner로 사용한다. | Source link/anchor, built filesystem, 실제 HTTP 40개 status와 DOM fragment 전수 검사 | Public route를 실제 배포 artifact에 맞춤. API 변경 없음 | fixed |
| F-009 tutorial portability | Complete example 12개 중 11개가 checkout 밖에서 상대 import 또는 누락 JSON으로 실패 | Tutorial이 repository source와 local data layout에 의존했다. Public `ggaction` import, 코드 직전 data acquisition, `response.ok` 검사를 사용한다. | 문서 코드 원문 추출 → exact tarball 설치 → 11개 Vite production build → Browser data 2xx/error-free/Canvas ink | Tutorial만 수정. Package API 변경 없음 | fixed |
| F-010 capability drift | 중앙 문서 여섯 곳이 runtime/focused docs의 rect, arc, highlight, legend, axis 지원을 누락하거나 반대로 설명 | 여러 overview가 capability 목록을 수동 복제했다. `docs/_data/action_capabilities.json`과 generated table을 canonical owner로 만들었다. | Generated-clean check, runtime position/highlight exact 비교, rect/arc/bar/legend/complete-axis public smoke | 문서 정확성 수정. Public runtime 변화 없음 | fixed |
| F-011 composition asset | 대표 PNG가 99.484% 흰색이고 두 child와 replacement 결과를 식별할 수 없는 현상 재현 | Composition runtime이 아니라 sparse·동색 representative fixture 문제였다. `main` point panel과 교체된 `detail` bar panel에 서로 다른 배경, title과 24px gap을 부여했다. | Primitive/public exact equivalence, hierarchy count, child title/background/mark type, full PNG panel/gap pixel과 thumbnail | Runtime/API 변경 없음. 예제와 gallery 설명·자산 개선 | fixed |

## 공유 근본 원인

### 1. Public contract가 실행 경계까지 이어지지 않음

F-009와 F-014는 문서 코드가 그럴듯해도 fresh package consumer에서 실행되지 않았다. 이후 complete tutorial과
extension 예제는 문서 문자열 검사만으로 완료하지 않고, 생성한 exact tarball을 checkout 밖에 설치해 compile,
build와 runtime까지 검증한다.

### 2. 같은 capability를 여러 owner가 따로 해석함

F-013, F-015와 F-010은 방향별 layout, scale descriptor, overview 표가 shared policy와 분리되어 생겼다. Layout,
palette와 capability inventory는 각각 한 canonical owner를 가지며 create/edit, runtime/type/docs가 이를 소비한다.

### 3. 성공 exit code가 semantic·visual 성공을 보장하지 않음

F-012와 F-011은 실행 자체는 성공했다. Text는 logical glyph bounds, composition은 panel identity와 representative
pixel을 검사해야 발견된다. 회귀는 state, geometry, pixel과 consumer 실행 중 finding의 실패면에 맞는 층을
고른다.

### 4. 문서 route와 자산도 배포 artifact 계약임

F-008과 F-011은 source Markdown 존재 여부만으로 잡히지 않았다. Built HTTP route/DOM fragment와 generated
PNG semantic fitness를 배포 전 검증 대상으로 유지한다.

## 전체 검증

| 검증 | 결과 |
|---|---:|
| `npm test` | 1,541 passed |
| `npm run test:coverage` | lines 94.88%, branches 90.16%, functions 98.53%; 52 critical floors passed |
| `npm run test:package` | 9 installed-package consumer tracks passed |
| `npm run test:browser` | 29 passed |
| `npm run test:render` | 113 passed; Roadmap 2/3 galleries verified |
| `npm run test:docs` | 27 passed |
| Generated contract checks | signatures, capabilities, action catalog, package shape passed |
| GitHub CI `29670231627` | Node 20/22/24 package, test/browser/render, coverage, documentation jobs passed |

문서 build는 Ruby 3.2.6을 고정한 GitHub documentation job이 소유한다. 로컬 시스템 Ruby 2.6에서는 현재
lockfile runtime을 충족하지 않으므로 source/docs test로 대체해 성공을 주장하지 않고, 원격 job의 Jekyll build,
built-link와 browser 결과를 최종 배포 gate로 사용한다. CI run `29670231627`에서 이 gate가 통과했다.

## Semver와 재평가 우선순위

- Public action 제거, rename, argument shape 변경은 없다.
- F-015는 타입·문서에 이미 공개된 sequential count를 runtime이 받아들이게 하는 additive bug fix다.
- F-014 generic은 concrete subclass return type을 더 정확하게 보존한다.
- F-012는 authored state를 바꾸지 않고 backend rendering만 정상화한다.
- 나머지는 layout bug, 문서 pipeline과 대표 fixture 수정이다.

다음 배포 재평가는 Node PNG numeric typography, right categorical legend create/edit, sequential count의
top-level/nested parity, strict TypeScript extension, 40개 LLM target, checkout 밖 tutorial build/render와 composition
asset을 먼저 실행한다. 그 뒤 기존 0.0.2 F001–F007과 113개 PNG scenario를 전수 회귀한다.
