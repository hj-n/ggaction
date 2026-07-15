import { chart } from "../../src/index.js";

const canvas = Object.freeze({
  width: 720,
  height: 460,
  margin: Object.freeze({ top: 90, right: 40, bottom: 70, left: 80 })
});

export function createCarsErrorBar(cars) {
  return chart()
    .createCanvas(canvas)
    .createData({ values: cars })
    .createErrorBar({
      x: { field: "Origin", fieldType: "nominal" },
      y: { field: "Acceleration" }
    })
    .createGuides()
    .createTitle({
      text: "Mean Acceleration by Origin",
      subtitle: "95% confidence intervals"
    });
}

export function createCarsErrorBarOverlay(cars) {
  return chart()
    .createCanvas(canvas)
    .createData({ values: cars })
    .createPointMark()
    .encodeX({ field: "Origin", fieldType: "ordinal" })
    .encodeY({ field: "Acceleration" })
    .encodeColor({ field: "Origin" })
    .encodeRadius({ value: 3 })
    .encodeOpacity({ value: 0.18 })
    .createErrorBar()
    .createGuides()
    .createTitle({
      text: "Acceleration by Origin",
      subtitle: "Observations and 95% mean confidence intervals"
    });
}
