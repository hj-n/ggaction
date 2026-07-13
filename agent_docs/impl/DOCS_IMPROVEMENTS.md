# Documentation Improvements

## 목표

사용자와 LLM이 현재 구현 범위를 정확하게 이해하고, chart workflow에서 세부 API로
빠르게 이동하며, 문서와 public example 사이의 drift를 자동으로 발견할 수 있도록
문서 정보 구조와 검증 체계를 개선한다.

## 진행 상태

- [x] Getting Started의 point legend 설명 수정
- [x] README와 Getting Started에 Histogram 경로 추가
- [x] Repository import와 intended package import 구분
- [x] Sidebar를 Chart Building과 Customization으로 재구성
- [x] Grids navigation 추가
- [x] 긴 페이지의 section navigation
- [x] 전체 문서의 이전/다음 navigation
- [x] Tutorial 실행/source/후속 API 링크 통일
- [x] Heading/anchor 단위 검색과 키보드 이동
- [x] Local link, navigation, example, action-flow drift test
- [x] Desktop/mobile GitHub Pages 검증

## 검증 결과

- 전체 unit/acceptance/docs test 271개 통과
- PNG render test 9개 통과
- GitHub Pages에서 section TOC와 이전/다음 링크 확인
- `optional border` 검색이 `Legends › Optional border`로 연결되는 것 확인
- Mobile sidebar drawer와 Grids navigation 확인
- Browser console/page error 없음
