# Planned Editing contracts

These contracts are accepted or pending future API work; they are not current public behavior.

## editTitle

```typescript
editTitle({
  text?: NonEmptyString;
  subtitle?: NonEmptyString | false;
  position?: "top" | "bottom" | "left" | "right";
  align?: "left" | "center" | "right";
  offset?: Finite;
  gap?: NonNegativeFinite;
  maxWidth?: PositiveFinite;
  wrap?: "word" | "character";
  lineHeight?: PositiveFinite;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}): ChartProgram;
```

- 기존 chart title이 필수이며 최소 한 option을 요구한다. unknown option과 invalid value는
  program을 변경하기 전에 거부한다.
- 생략한 property는 기존 값을 유지한다. `text`와 string `subtitle`은 semantic text를
  교체하며 `subtitle: false`는 semantic subtitle과 concrete subtitle graphic을 제거한다.
- `titleStyle`과 `subtitleStyle`은 전달한 style leaf만 기존 stored style에 merge한다.
  생략한 style leaf는 유지한다.
- `position`, `align`, `offset`, `gap`과 style은 graphical materialization config를 갱신한다.
  position 변경은 같은 title resource를 새 edge에서 rematerialize하며 semantic text는 유지한다.
- `maxWidth`는 wrapping을 활성화하고 `wrap`과 `lineHeight`는 accepted title-wrapping contract를
  따른다. 세 값 중 일부만 수정해도 기존 stored wrapping config와 합친 뒤 complete combination을
  검증하며, line break는 renderer가 아니라 shared text measurement가 다시 계산한다.
- action은 내부 wrapped `rematerializeTitle`을 호출해 최신 Canvas, margin, title config로
  concrete text를 다시 만든다. title/legend overlap이나 margin 부족은 layout error다.
- 기존 `ChartProgram`은 변경하지 않고 새로운 program을 반환하며 `editTitle` 아래에 semantic,
  graphic, rematerialization child action이 trace로 남는다.
- Status: Planned, NOT IMPLEMENTED. 실행 가능한 coverage는 구현 단계에서 추가한다.
