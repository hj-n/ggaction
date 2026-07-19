# STEP 5 — F-008 Documentation Route and Fragment Integrity

## 진행 상태

- [x] Published `llms.txt` route와 stale fragment 재현
- [x] HTML과 LLM index가 공유하는 canonical route/slug owner 확정
- [x] 모든 targeted route를 deployed artifact로 제공
- [x] Built HTTP status와 fragment DOM 전수 회귀 추가
- [x] Clean built-site desktop/mobile 검증

짧은 `llms.txt`는 selective retrieval index로 유지한다. 모든 target은 실제 배포 artifact에서 200을 반환하고,
fragment가 있으면 HTML DOM의 실제 heading ID와 일치해야 한다.

## 결과

- Published `0.0.3`에서 `llms.txt` 40개 target 중 Markdown route 39개가 404였고,
  Polar fragment 1개와 일반 HTML action fragment 4개가 실제 heading ID와 달랐다.
- `llms.txt`는 page registry의 pretty HTML route만 허용한다. Generator가 registry에 없는 route와 source에
  없는 fragment를 거부하며 concise/full bundle을 함께 갱신한다.
- Polar link는 `#polar-positions`를 사용한다. 긴 action signature에 의존하던 네 heading은
  `create-interval-data`, `create-derived-data`, `filter-marks`, `edit-bar-mark` 명시 ID를 갖는다.
- Built filesystem 검사는 모든 HTML link와 40개 LLM target의 file/fragment를 확인한다. Browser 검사는
  임시 HTTP server에서 같은 40개 target의 status와 DOM ID를 전수 확인한다.
- 현재 공개 사이트의 새 route 집합은 40/40 HTTP 200이며, 전체 1,534개 source/docs test가 통과했다.
  Ruby 3.2 GitHub documentation job과 Pages deployment도 `c1f949d`에서 통과했다.
