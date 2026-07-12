import { chart, render } from "../../src/index.js";

import { createCarsLineChartValues } from "./carsLineChartValues.js";

export function createCarsLineChartActions(cars) {
  const width = 720;
  const height = 460;
  const margin = { top: 80, right: 170, bottom: 60, left: 80 };
  const values = createCarsLineChartValues(cars, { width, height, margin });

  return chart()
    .createCanvas({ width, height, margin, background: "white" })
    .createData({ id: "cars", values: values.validCars })
    .createLineMark({ id: "trends" })
    .encodeX({
      field: "Year",
      fieldType: "temporal",
      scale: { nice: true }
    })
    .encodeY({
      field: "Acceleration",
      fieldType: "quantitative",
      aggregate: "mean",
      scale: { nice: true, zero: false }
    })
    .encodeColor({
      field: "Origin",
      fieldType: "nominal",
      scale: { palette: "tableau10" }
    })
    .encodeStrokeDash({
      field: "Origin",
      fieldType: "nominal"
    })
    .createAxes({ y: { ticksAndLabels: { count: 6 } } })
    .createLegend()
    .editSemantic({ property: "title.text", value: values.title.text })
    .editSemantic({ property: "title.subtitle", value: values.title.subtitle })
    .createGraphics({ id: "chartTitle", type: "text" })
    .editGraphics({ target: "chartTitle", property: "x", value: values.title.x })
    .editGraphics({ target: "chartTitle", property: "y", value: values.title.titleY })
    .editGraphics({ target: "chartTitle", property: "text", value: values.title.text })
    .editGraphics({ target: "chartTitle", property: "fill", value: "#0f172a" })
    .editGraphics({ target: "chartTitle", property: "fontSize", value: 20 })
    .editGraphics({ target: "chartTitle", property: "fontFamily", value: "sans-serif" })
    .editGraphics({ target: "chartTitle", property: "fontWeight", value: 700 })
    .editGraphics({ target: "chartTitle", property: "textAlign", value: "left" })
    .editGraphics({ target: "chartTitle", property: "textBaseline", value: "middle" })
    .createGraphics({ id: "chartSubtitle", type: "text" })
    .editGraphics({ target: "chartSubtitle", property: "x", value: values.title.x })
    .editGraphics({ target: "chartSubtitle", property: "y", value: values.title.subtitleY })
    .editGraphics({ target: "chartSubtitle", property: "text", value: values.title.subtitle })
    .editGraphics({ target: "chartSubtitle", property: "fill", value: "#64748b" })
    .editGraphics({ target: "chartSubtitle", property: "fontSize", value: 13 })
    .editGraphics({ target: "chartSubtitle", property: "fontFamily", value: "sans-serif" })
    .editGraphics({ target: "chartSubtitle", property: "fontWeight", value: "normal" })
    .editGraphics({ target: "chartSubtitle", property: "textAlign", value: "left" })
    .editGraphics({ target: "chartSubtitle", property: "textBaseline", value: "middle" });
}

export function renderCarsLineChartActions(program, canvasContext) {
  render(program, canvasContext);
}
