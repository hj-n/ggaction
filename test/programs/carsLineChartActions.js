import { chart, render } from "../../src/index.js";

import { createCarsLineChartValues } from "./carsLineChartValues.js";

export function createCarsLineChartActions(cars) {
  const width = 720;
  const height = 460;
  const margin = { top: 80, right: 170, bottom: 60, left: 80 };
  const values = createCarsLineChartValues(cars, { width, height, margin });
  const legendY = values.legend.items.map(item => item.y);
  const seriesStrokeDashes = [[], [8, 4], [3, 3]];

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
    .editSemantic({
      property: "guide.legend.series.channels",
      value: ["color", "strokeDash"]
    })
    .editSemantic({
      property: "guide.legend.series.scales",
      value: ["color", "strokeDash"]
    })
    .editSemantic({ property: "guide.legend.series.title", value: "Origin" })
    .editSemantic({ property: "title.text", value: values.title.text })
    .editSemantic({ property: "title.subtitle", value: values.title.subtitle })
    .createGraphics({
      id: "seriesLegendSymbols",
      type: "line",
      length: values.legend.items.length
    })
    .editGraphics({
      target: "seriesLegendSymbols",
      property: "x1",
      value: values.legend.items.map(item => item.x1)
    })
    .editGraphics({ target: "seriesLegendSymbols", property: "y1", value: legendY })
    .editGraphics({
      target: "seriesLegendSymbols",
      property: "x2",
      value: values.legend.items.map(item => item.x2)
    })
    .editGraphics({ target: "seriesLegendSymbols", property: "y2", value: legendY })
    .editGraphics({
      target: "seriesLegendSymbols",
      property: "stroke",
      value: values.legend.items.map(item => item.color)
    })
    .editGraphics({ target: "seriesLegendSymbols", property: "strokeWidth", value: 2 })
    .editGraphics({
      target: "seriesLegendSymbols",
      property: "strokeDash",
      value: seriesStrokeDashes
    })
    .createGraphics({
      id: "seriesLegendLabels",
      type: "text",
      length: values.legend.items.length
    })
    .editGraphics({
      target: "seriesLegendLabels",
      property: "x",
      value: values.legend.items.map(item => item.labelX)
    })
    .editGraphics({ target: "seriesLegendLabels", property: "y", value: legendY })
    .editGraphics({
      target: "seriesLegendLabels",
      property: "text",
      value: values.legend.items.map(item => item.origin)
    })
    .editGraphics({ target: "seriesLegendLabels", property: "fill", value: "#334155" })
    .editGraphics({ target: "seriesLegendLabels", property: "fontSize", value: 12 })
    .editGraphics({ target: "seriesLegendLabels", property: "fontFamily", value: "sans-serif" })
    .editGraphics({ target: "seriesLegendLabels", property: "fontWeight", value: "normal" })
    .editGraphics({ target: "seriesLegendLabels", property: "textAlign", value: "left" })
    .editGraphics({ target: "seriesLegendLabels", property: "textBaseline", value: "middle" })
    .createGraphics({ id: "seriesLegendTitle", type: "text" })
    .editGraphics({ target: "seriesLegendTitle", property: "x", value: values.legend.title.x })
    .editGraphics({ target: "seriesLegendTitle", property: "y", value: values.legend.title.y })
    .editGraphics({ target: "seriesLegendTitle", property: "text", value: values.legend.title.text })
    .editGraphics({ target: "seriesLegendTitle", property: "fill", value: "#334155" })
    .editGraphics({ target: "seriesLegendTitle", property: "fontSize", value: 13 })
    .editGraphics({ target: "seriesLegendTitle", property: "fontFamily", value: "sans-serif" })
    .editGraphics({ target: "seriesLegendTitle", property: "fontWeight", value: 600 })
    .editGraphics({ target: "seriesLegendTitle", property: "textAlign", value: "left" })
    .editGraphics({ target: "seriesLegendTitle", property: "textBaseline", value: "middle" })
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
