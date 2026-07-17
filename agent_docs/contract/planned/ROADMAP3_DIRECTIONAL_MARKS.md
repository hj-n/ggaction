# Roadmap 3 Planned Directional, Text and Rect contracts

Gate A에서 승인된 Phase 9 계약이다.

## Directional offset

```typescript
encodeYOffset({ target?, field, fieldType?: "nominal" | "ordinal", scale? }): ChartProgram;
```

- `encodeYOffset` is the y-direction counterpart of current `encodeXOffset` and owns the same domain order,
  padding, explicit/reversed range and Canvas rematerialization rules.
- Horizontal grouped color layout delegates to `encodeYOffset`; vertical grouping continues to use xOffset.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 9.

## Text annotation

```typescript
createTextMark({ id?, data?, text?, fill?, opacity?, fontSize?, fontFamily?, fontWeight?, align?, baseline?, rotation?, dx?, dy? }): ChartProgram;
encodeText({ target?, field?, value?, format? }): ChartProgram;
editTextMark({ target?, fill?, opacity?, fontSize?, fontFamily?, fontWeight?, align?, baseline?, rotation?, dx?, dy? }): ChartProgram;
```

- Text accepts exactly one field/value content source, inherited or explicit position, deterministic formatting and
  graphical offsets.
- Scatter labels, bar values and rule annotations use the same semantic mark; tooltip/interaction is excluded.
- Concrete text stores final content, x/y, typography, alignment and rotation.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 9.

## Rect heatmap

```typescript
createRectMark({ id?, data?, fill?, opacity?, stroke?, strokeWidth? }): ChartProgram;
editRectMark({ target?, fill?, opacity?, stroke?, strokeWidth? }): ChartProgram;
```

- Rect uses two discrete positions or x/x2 plus y/y2 ranged positions and existing color encodings.
- It is a distinct semantic mark; existing bar materialization is not presented as rect ownership.
- Selection/highlight operates at final cell grain and optional text is a separate text layer.
- Status: Planned, NOT IMPLEMENTED. Roadmap 3 Phase 9.
