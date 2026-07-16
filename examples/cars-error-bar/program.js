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

export function createRuleGeometryExample() {
  return chart()
    .createCanvas({
      width: 720,
      height: 460,
      margin: { top: 90, right: 40, bottom: 50, left: 80 }
    })
    .createData({
      values: [{ xStart: 60, yStart: 92, xEnd: 92, yEnd: 58 }]
    })
    .createRuleMark({ id: "verticalSpan" })
    .encodeX({
      target: "verticalSpan",
      datum: 15,
      fieldType: "quantitative",
      scale: { domain: [0, 100] }
    })
    .encodeStroke({ target: "verticalSpan", value: "#4c78a8" })
    .encodeStrokeWidth({ target: "verticalSpan", value: 3 })
    .createRuleMark({ id: "horizontalSpan" })
    .encodeY({
      target: "horizontalSpan",
      datum: 82,
      fieldType: "quantitative",
      scale: { domain: [0, 100] }
    })
    .encodeStroke({ target: "horizontalSpan", value: "#f58518" })
    .encodeStrokeWidth({ target: "horizontalSpan", value: 3 })
    .createRuleMark({ id: "verticalInterval" })
    .encodeX({ target: "verticalInterval", datum: 38, fieldType: "quantitative" })
    .encodeY({ target: "verticalInterval", datum: 18, fieldType: "quantitative" })
    .encodeY2({ target: "verticalInterval", datum: 66, fieldType: "quantitative" })
    .encodeStroke({ target: "verticalInterval", value: "#54a24b" })
    .encodeStrokeWidth({ target: "verticalInterval", value: 3 })
    .createRuleMark({ id: "horizontalInterval" })
    .encodeY({ target: "horizontalInterval", datum: 38, fieldType: "quantitative" })
    .encodeX({ target: "horizontalInterval", datum: 52, fieldType: "quantitative" })
    .encodeX2({ target: "horizontalInterval", datum: 88, fieldType: "quantitative" })
    .encodeStroke({ target: "horizontalInterval", value: "#e45756" })
    .encodeStrokeWidth({ target: "horizontalInterval", value: 3 })
    .createRuleMark({ id: "diagonalInterval" })
    .encodeX({
      target: "diagonalInterval",
      field: "xStart",
      fieldType: "quantitative"
    })
    .encodeY({
      target: "diagonalInterval",
      field: "yStart",
      fieldType: "quantitative"
    })
    .encodeX2({
      target: "diagonalInterval",
      field: "xEnd",
      fieldType: "quantitative"
    })
    .encodeY2({
      target: "diagonalInterval",
      field: "yEnd",
      fieldType: "quantitative"
    })
    .encodeStroke({ target: "diagonalInterval", value: "#b279a2" })
    .encodeStrokeWidth({ target: "diagonalInterval", value: 3 })
    .createTitle({
      text: "Rule geometry primitives",
      subtitle: "Full-span, bounded, and diagonal endpoints"
    });
}

export function createCarsHorizontalErrorBar(cars) {
  return chart()
    .createCanvas(canvas)
    .createData({ values: cars })
    .createErrorBar({
      x: { field: "Horsepower" },
      y: { field: "Origin", fieldType: "nominal" }
    })
    .createGuides()
    .createTitle({
      text: "Mean Horsepower by Origin",
      subtitle: "95% confidence intervals"
    });
}

export function createExplicitIntervalErrorBar(intervalRows) {
  return chart()
    .createCanvas(canvas)
    .createData({ values: intervalRows })
    .createErrorBar({
      x: { field: "Origin", fieldType: "nominal" },
      y: {
        center: "meanAcceleration",
        lower: "lowerAcceleration",
        upper: "upperAcceleration"
      },
      caps: false
    })
    .createGuides()
    .createTitle({
      text: "Explicit Acceleration Intervals",
      subtitle: "Existing lower and upper fields; caps disabled"
    });
}

export function createStyledCarsErrorBar(cars) {
  return chart()
    .createCanvas(canvas)
    .createData({ values: cars })
    .createErrorBar({
      x: { field: "Origin", fieldType: "nominal" },
      y: { field: "Acceleration" },
      capSize: 16,
      stroke: "#d9485f",
      strokeWidth: 3,
      strokeDash: [8, 4],
      opacity: 0.8
    })
    .createGuides()
    .createTitle({
      text: "Styled Acceleration Intervals",
      subtitle: "16px caps with custom rule appearance"
    });
}
