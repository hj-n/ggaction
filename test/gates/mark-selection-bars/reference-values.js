import { createCarsHistogramValues } from "../../charts/cars-histogram/reference-values.js";

export const BAR_HIGHLIGHT_LAYOUT = Object.freeze({
  width: 432,
  height: 460,
  margin: Object.freeze({ top: 80, right: 60, bottom: 130, left: 80 })
});

export const BAR_HIGHLIGHT_TARGET = Object.freeze({
  fill: "#facc15",
  stroke: "#713f12",
  strokeWidth: 2.5,
  opacity: 1
});

export function selectLongestHistogramBar(
  cars,
  {
    width = BAR_HIGHLIGHT_LAYOUT.width,
    height = BAR_HIGHLIGHT_LAYOUT.height,
    margin = BAR_HIGHLIGHT_LAYOUT.margin
  } = {}
) {
  const values = createCarsHistogramValues(cars, {
    width,
    height,
    margin,
    field: "Displacement",
    maxBins: 10,
    stack: "zero"
  });
  const maximumCount = Math.max(...values.rects.map(rect => rect.count));
  const selected = values.rects
    .map((rect, index) => ({ rect, index }))
    .filter(({ rect }) => rect.count === maximumCount);
  if (selected.length !== 1) {
    throw new Error("Gate B requires one unique maximum-count histogram item.");
  }
  const [{ rect, index }] = selected;
  const bin = values.bins[rect.bin];
  return Object.freeze({
    rows: values.validCars,
    target: Object.freeze({
      key: `bars/histogram/${index}`,
      index,
      bin: rect.bin,
      interval: Object.freeze([bin.start, bin.end]),
      origin: rect.origin,
      count: rect.count,
      concrete: Object.freeze({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      })
    })
  });
}
