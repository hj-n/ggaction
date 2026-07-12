# STEP 15 — Encoding-Driven Coordinates

## 목표

Coordinate 생성과 연결 책임을 guide action이 아니라 positional encoding에
둔다. `encodeX`와 `encodeY`는 coordinate가 생략되면 `main` Cartesian을
semantic에 저장하고, `createAxes`는 이미 저장된 coordinate를 조회해 guide
graphics만 만든다.

향후 `encodeTheta`와 `encodeR`도 같은 공통 규칙을 사용해 `polar` coordinate를
추론한다. `encodeR`은 semantic `radius` channel을 의미하며, 고정된 circle
크기를 설정하는 기존 `encodeRadius({ value })`와 구분한다.

## 진행 상태

- [ ] Positional channel family와 기본 coordinate 규칙
- [ ] `encodeX`/`encodeY`의 선택적 `coordinate` option
- [ ] Encoding 단계의 coordinate 생성·검증·layer 연결
- [ ] Cartesian/Polar coordinate 충돌 검증
- [ ] `createAxes`의 coordinate 생성과 type 추론 제거
- [ ] Encoding 및 axis trace 수정
- [ ] Unit, acceptance, immutability test
- [ ] 영어 사용자 문서
- [ ] PNG 및 브라우저 렌더 확인

## 규칙

```text
x, y                  -> main / cartesian
theta, semantic radius -> polar / polar
```

Coordinate 선택 우선순위는 다음과 같다.

```text
layer에 연결된 coordinate
> encoding action에 명시된 coordinate
> channel family의 기본 coordinate
```

명시된 coordinate가 layer의 기존 coordinate와 다르거나, 선택된 coordinate의
type이 channel family와 호환되지 않으면 오류다. Coordinate가 없으면 positional
encoding이 `createCoordinate`를 wrapped child action으로 호출해 생성하고 layer에
연결한다.

```text
encodeX
├─ createCoordinate(main, cartesian, points)
├─ editSemantic(encoding.x...)
├─ createScale
└─ rematerializeScale
```

`createAxes`는 coordinate를 생성하거나 기본 type을 추론하지 않는다.

```text
createAxes
├─ createXAxis (when selected)
└─ createYAxis (when selected)
```

## 완료 조건

- `encodeX` 또는 `encodeY` 직후 Cartesian coordinate와 layer reference가 있다.
- `createAxes` 전후 coordinate semantic state가 동일하다.
- 명시적 coordinate와 기본 coordinate가 일관되게 검증된다.
- Polar channel 확장이 공통 coordinate resolver를 재사용할 수 있다.
- 대표 scatterplot의 결과와 고해상도 PNG가 유지된다.
