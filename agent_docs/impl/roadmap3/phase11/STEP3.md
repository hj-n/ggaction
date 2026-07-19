# STEP 3 — F-013 Right Categorical Legend Offset

## 진행 상태

- [x] Exact `0.0.3` create/edit reproduction 실행
- [x] Right categorical layout의 hardcoded displacement 제거
- [x] Symbol, title, labels와 background가 같은 offset origin 사용
- [x] Four-direction categorical와 right continuous control 회귀 추가
- [x] Focused guide, browser와 render 검증

Right categorical legend도 다른 방향과 같은 plot-boundary + explicit offset 계약을 사용한다. Create와
`editLegendLayout`은 동일 resolver 결과를 내며 8→80 변경에서 모든 legend component가 72px 이동해야 한다.

## 결과

- `0.0.3` 평가 재현에서 right categorical legend의 `offset: 8`, `offset: 80`,
  그리고 8→80 edit 결과가 모두 같은 x 좌표를 갖는 것을 확인했다.
- 원인은 right categorical layout만 `30`을 고정 사용한 것이었다. 이제 네 방향 모두 plot
  boundary와 명시적 `offset`을 같은 방식으로 계산한다.
- Symbol, label, title, border/background와 margin validation이 하나의 resolved layout을
  사용하며, create와 focused edit의 최종 `graphicSpec`도 같게 수렴한다.
- Package 소비자 회귀에 실제 설치 tarball의 8→80 이동과 create/edit 동등성 검사를 추가했다.
- 단위·차트 1,529개, Browser 29개, PNG 113개와 package consumer가 통과했다.
