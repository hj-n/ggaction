import { chart } from "../../../src/index.js";

import { createHeatmapReference } from "./reference-values.js";

const AXIS = "#334155";
const MUTED = "#64748b";
const GRID = "#e2e8f0";
const FONT = "sans-serif";

function editProperties(program, target, properties) {
  let next = program;
  for (const [property, value] of Object.entries(properties)) {
    next = next.editGraphics({ target, property, value });
  }
  return next;
}

function editText(program, target, properties, style = {}) {
  return editProperties(program, target, {
    ...properties,
    fill: style.fill ?? AXIS,
    opacity: style.opacity ?? 1,
    fontSize: style.fontSize ?? 11,
    fontFamily: style.fontFamily ?? FONT,
    fontWeight: style.fontWeight ?? "normal",
    textAlign: style.textAlign ?? "center",
    textBaseline: style.textBaseline ?? "middle",
    rotation: style.rotation ?? 0
  });
}

export function createGapminderHeatmapPrimitives(gapminder) {
  const values = createHeatmapReference(gapminder);
  const { bounds, axes, legend, title } = values;
  const x = axes.x.positions;
  const y = axes.y.positions;

  let program = chart()
    .editSemantic({ property: "dataset[gapminder].values", value: values.rows })
    .editSemantic({ property: "scale[x].type", value: "band" })
    .editSemantic({ property: "scale[x].domain", value: values.domains.x })
    .editSemantic({ property: "scale[x].range", value: "auto" })
    .editSemantic({ property: "scale[x].paddingInner", value: 0 })
    .editSemantic({ property: "scale[x].paddingOuter", value: 0 })
    .editSemantic({ property: "scale[x].align", value: 0.5 })
    .editSemantic({ property: "scale[y].type", value: "band" })
    .editSemantic({ property: "scale[y].domain", value: values.domains.y })
    .editSemantic({ property: "scale[y].range", value: "auto" })
    .editSemantic({ property: "scale[y].paddingInner", value: 0 })
    .editSemantic({ property: "scale[y].paddingOuter", value: 0 })
    .editSemantic({ property: "scale[y].align", value: 0.5 })
    .editSemantic({ property: "scale[color].type", value: "sequential" })
    .editSemantic({ property: "scale[color].domain", value: values.domains.color })
    .editSemantic({
      property: "scale[color].range",
      value: { palette: { name: "viridis" } }
    })
    .editSemantic({ property: "scale[color].interpolate", value: "rgb" })
    .editSemantic({ property: "coordinate[main].type", value: "cartesian" })
    .editSemantic({ property: "guide.axis.x.scale", value: "x" })
    .editSemantic({ property: "guide.axis.x.coordinate", value: "main" })
    .editSemantic({ property: "guide.axis.x.title", value: axes.x.title })
    .editSemantic({ property: "guide.axis.y.scale", value: "y" })
    .editSemantic({ property: "guide.axis.y.coordinate", value: "main" })
    .editSemantic({ property: "guide.axis.y.title", value: axes.y.title })
    .editSemantic({ property: "guide.grid.horizontal.scale", value: "y" })
    .editSemantic({ property: "guide.grid.horizontal.coordinate", value: "main" })
    .editSemantic({ property: "guide.legend.color.scale", value: "color" })
    .editSemantic({ property: "guide.legend.color.title", value: legend.title.text })
    .editSemantic({ property: "title.text", value: title.text })
    .createGraphics({ id: "canvas", type: "canvas" })
    .createGraphics({ id: "plot-main", type: "collection", parent: "canvas" });

  program = editProperties(program, "canvas", {
    width: values.width,
    height: values.height,
    background: "white"
  });

  program = program.createGraphics({
    id: "horizontalGridLines",
    parent: "plot-main",
    type: "line",
    length: y.length
  });
  program = editProperties(program, "horizontalGridLines", {
    x1: bounds.left,
    y1: y,
    x2: bounds.right,
    y2: y,
    stroke: GRID,
    strokeWidth: 1,
    strokeDash: y.map(() => [])
  });

  program = program.createGraphics({
    id: "rect",
    parent: "plot-main",
    type: "rect",
    length: values.cells.length
  });
  program = editProperties(program, "rect", {
    x: values.cells.map(cell => cell.x),
    y: values.cells.map(cell => cell.y),
    width: values.cells.map(cell => cell.width),
    height: values.cells.map(cell => cell.height),
    fill: values.cells.map(cell => cell.fill),
    stroke: "white",
    strokeWidth: 1
  });

  program = program.createGraphics({
    id: "text",
    parent: "plot-main",
    type: "text",
    length: values.cells.length
  });
  program = editText(program, "text", {
    x: values.cells.map(cell => cell.x + cell.width / 2),
    y: values.cells.map(cell => cell.y + cell.height / 2),
    text: values.cells.map(cell => cell.label)
  }, {
    fill: values.cells.map(cell => cell.labelFill),
    fontSize: 10,
    fontWeight: 600
  });

  for (const [channel, line] of [
    ["x", { x1: bounds.left, y1: bounds.bottom, x2: bounds.right, y2: bounds.bottom }],
    ["y", { x1: bounds.left, y1: bounds.bottom, x2: bounds.left, y2: bounds.top }]
  ]) {
    program = program.createGraphics({
      id: `${channel}AxisLine`,
      parent: "plot-main",
      type: "line"
    });
    program = editProperties(program, `${channel}AxisLine`, {
      ...line,
      stroke: AXIS,
      strokeWidth: 1
    });
  }

  program = program.createGraphics({
    id: "xAxisTicks",
    parent: "plot-main",
    type: "line",
    length: x.length
  });
  program = editProperties(program, "xAxisTicks", {
    x1: x,
    y1: bounds.bottom,
    x2: x,
    y2: bounds.bottom + 5,
    stroke: MUTED,
    strokeWidth: 1
  });
  program = program.createGraphics({
    id: "yAxisTicks",
    parent: "plot-main",
    type: "line",
    length: y.length
  });
  program = editProperties(program, "yAxisTicks", {
    x1: bounds.left - 5,
    y1: y,
    x2: bounds.left,
    y2: y,
    stroke: MUTED,
    strokeWidth: 1
  });

  program = program.createGraphics({
    id: "xAxisLabels",
    parent: "plot-main",
    type: "text",
    length: x.length
  });
  program = editText(program, "xAxisLabels", {
    x,
    y: bounds.bottom + 12,
    text: axes.x.labels
  }, { fontSize: 10, textBaseline: "top" });
  program = program.createGraphics({
    id: "yAxisLabels",
    parent: "plot-main",
    type: "text",
    length: y.length
  });
  program = editText(program, "yAxisLabels", {
    x: bounds.left - 10,
    y,
    text: axes.y.labels
  }, { fontSize: 10, textAlign: "right" });

  program = program.createGraphics({ id: "xAxisTitle", parent: "plot-main", type: "text" });
  program = editText(program, "xAxisTitle", {
    x: bounds.left + bounds.width / 2,
    y: values.height - 18,
    text: axes.x.title
  }, { fontSize: 13, fontWeight: 600 });
  program = program.createGraphics({ id: "yAxisTitle", parent: "plot-main", type: "text" });
  program = editText(program, "yAxisTitle", {
    x: 18,
    y: bounds.top + bounds.height / 2,
    text: axes.y.title
  }, { fontSize: 13, fontWeight: 600, rotation: -Math.PI / 2 });

  program = program.createGraphics({
    id: "colorGradientStrips",
    parent: "canvas",
    type: "rect",
    length: legend.strips.length
  });
  program = editProperties(program, "colorGradientStrips", {
    x: legend.strips.map(strip => strip.x),
    y: legend.strips.map(strip => strip.y),
    width: legend.strips.map(strip => strip.width),
    height: legend.strips.map(strip => strip.height),
    fill: legend.strips.map(strip => strip.fill),
    stroke: legend.strips.map(strip => strip.stroke),
    strokeWidth: legend.strips.map(strip => strip.strokeWidth)
  });
  program = program.createGraphics({
    id: "colorGradientTicks",
    parent: "canvas",
    type: "line",
    length: legend.ticks.length
  });
  program = editProperties(program, "colorGradientTicks", {
    x1: legend.ticks.map(tick => tick.x1),
    y1: legend.ticks.map(tick => tick.y1),
    x2: legend.ticks.map(tick => tick.x2),
    y2: legend.ticks.map(tick => tick.y2),
    stroke: MUTED,
    strokeWidth: 1
  });
  program = program.createGraphics({
    id: "colorGradientLabels",
    parent: "canvas",
    type: "text",
    length: legend.labels.length
  });
  program = editText(program, "colorGradientLabels", {
    x: legend.labels.map(label => label.x),
    y: legend.labels.map(label => label.y),
    text: legend.labels.map(label => label.text)
  }, { fontSize: 12, textAlign: "left" });
  program = program.createGraphics({
    id: "colorGradientTitle",
    parent: "canvas",
    type: "text"
  });
  program = editText(program, "colorGradientTitle", legend.title, {
    fontSize: 13,
    fontWeight: 600,
    textAlign: "left"
  });

  program = program.createGraphics({ id: "chartTitle", parent: "canvas", type: "text" });
  return editText(program, "chartTitle", title, {
    fill: "#0f172a",
    fontSize: 22,
    fontWeight: 600
  });
}
