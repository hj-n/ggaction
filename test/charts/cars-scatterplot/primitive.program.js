import { chart, render } from "../../../src/index.js";

const ORIGIN_COLORS = Object.freeze({
  USA: "#4c78a8",
  Japan: "#f58518",
  Europe: "#e45756"
});

const DEFAULT_LAYOUT = Object.freeze({
  width: 640,
  height: 400,
  margin: Object.freeze({
    top: 30,
    right: 30,
    bottom: 60,
    left: 70
  })
});

function selectValidCars(cars) {
  if (!Array.isArray(cars)) {
    throw new TypeError("cars must be an array.");
  }

  return cars.filter(
    car =>
      Number.isFinite(car.Horsepower) &&
      Number.isFinite(car.Miles_per_Gallon) &&
      typeof car.Origin === "string" &&
      car.Origin.length > 0
  );
}

function mapDomain(values, [domainStart, domainEnd], [rangeStart, rangeEnd]) {
  if (domainStart === domainEnd) {
    return values.map(() => (rangeStart + rangeEnd) / 2);
  }

  return values.map(value => {
    const ratio = (value - domainStart) / (domainEnd - domainStart);
    return rangeStart + ratio * (rangeEnd - rangeStart);
  });
}

function extent(values) {
  return [Math.min(...values), Math.max(...values)];
}

export function createCarsScatterplotPrimitiveValues(
  cars,
  {
    width = DEFAULT_LAYOUT.width,
    height = DEFAULT_LAYOUT.height,
    margin = DEFAULT_LAYOUT.margin
  } = {}
) {
  const validCars = selectValidCars(cars);
  const resolvedMargin = { ...DEFAULT_LAYOUT.margin, ...margin };
  const bounds = Object.freeze({
    left: resolvedMargin.left,
    right: width - resolvedMargin.right,
    top: resolvedMargin.top,
    bottom: height - resolvedMargin.bottom
  });
  const horsepower = validCars.map(car => car.Horsepower);
  const mileage = validCars.map(car => car.Miles_per_Gallon);
  const xDomain = extent(horsepower);
  const yDomain = extent(mileage);
  const xTickValues = [50, 100, 150, 200];
  const yTickValues = [10, 20, 30, 40];

  return {
    validCars,
    bounds,
    x: mapDomain(horsepower, xDomain, [bounds.left, bounds.right]),
    y: mapDomain(mileage, yDomain, [bounds.bottom, bounds.top]),
    fill: validCars.map(car => ORIGIN_COLORS[car.Origin]),
    xTicks: {
      values: xTickValues,
      positions: mapDomain(
        xTickValues,
        xDomain,
        [bounds.left, bounds.right]
      ),
      labels: xTickValues.map(String)
    },
    yTicks: {
      values: yTickValues,
      positions: mapDomain(
        yTickValues,
        yDomain,
        [bounds.bottom, bounds.top]
      ),
      labels: yTickValues.map(String)
    }
  };
}

export function createCarsScatterplotPrimitives(cars) {
  const { validCars, bounds, x, y, fill, xTicks, yTicks } =
    createCarsScatterplotPrimitiveValues(cars);

  return chart()
    .editSemantic({ property: "dataset[cars].values", value: validCars })
    .editSemantic({ property: "layer[points].mark.type", value: "point" })
    .editSemantic({ property: "layer[points].data", value: "cars" })
    .editSemantic({ property: "layer[points].coordinate", value: "main" })
    .editSemantic({
      property: "layer[points].encoding.x.field",
      value: "Horsepower"
    })
    .editSemantic({
      property: "layer[points].encoding.x.fieldType",
      value: "quantitative"
    })
    .editSemantic({ property: "layer[points].encoding.x.scale", value: "x" })
    .editSemantic({
      property: "layer[points].encoding.y.field",
      value: "Miles_per_Gallon"
    })
    .editSemantic({
      property: "layer[points].encoding.y.fieldType",
      value: "quantitative"
    })
    .editSemantic({ property: "layer[points].encoding.y.scale", value: "y" })
    .editSemantic({
      property: "layer[points].encoding.color.field",
      value: "Origin"
    })
    .editSemantic({
      property: "layer[points].encoding.color.fieldType",
      value: "nominal"
    })
    .editSemantic({
      property: "layer[points].encoding.color.scale",
      value: "color"
    })
    .editSemantic({ property: "scale[x].type", value: "linear" })
    .editSemantic({ property: "scale[x].domain", value: "auto" })
    .editSemantic({ property: "scale[x].range", value: "auto" })
    .editSemantic({ property: "scale[y].type", value: "linear" })
    .editSemantic({ property: "scale[y].domain", value: "auto" })
    .editSemantic({ property: "scale[y].range", value: "auto" })
    .editSemantic({ property: "scale[color].type", value: "ordinal" })
    .editSemantic({ property: "scale[color].domain", value: "auto" })
    .editSemantic({ property: "scale[color].range", value: "auto" })
    .editSemantic({ property: "coordinate[main].type", value: "cartesian" })
    .editSemantic({ property: "guide.axis.x.coordinate", value: "main" })
    .editSemantic({ property: "guide.axis.x.scale", value: "x" })
    .editSemantic({ property: "guide.axis.x.title", value: "Horsepower" })
    .editSemantic({ property: "guide.axis.y.coordinate", value: "main" })
    .editSemantic({ property: "guide.axis.y.scale", value: "y" })
    .editSemantic({
      property: "guide.axis.y.title",
      value: "Miles per Gallon"
    })
    .editSemantic({ property: "guide.grid.horizontal.scale", value: "y" })
    .editSemantic({
      property: "guide.grid.horizontal.coordinate",
      value: "main"
    })
    .createGraphics({ id: "canvas", type: "canvas" })
    .createGraphics({ id: "plot-main", type: "collection", parent: "canvas" })
    .editGraphics({ target: "canvas", property: "width", value: 640 })
    .editGraphics({ target: "canvas", property: "height", value: 400 })
    .editGraphics({
      target: "canvas",
      property: "background",
      value: "white"
    })
    .createGraphics({
      id: "horizontalGridLines",
      parent: "plot-main",
      type: "line",
      length: yTicks.positions.length
    })
    .editGraphics({
      target: "horizontalGridLines",
      property: "x1",
      value: bounds.left
    })
    .editGraphics({
      target: "horizontalGridLines",
      property: "y1",
      value: yTicks.positions
    })
    .editGraphics({
      target: "horizontalGridLines",
      property: "x2",
      value: bounds.right
    })
    .editGraphics({
      target: "horizontalGridLines",
      property: "y2",
      value: yTicks.positions
    })
    .editGraphics({
      target: "horizontalGridLines",
      property: "stroke",
      value: "#e2e8f0"
    })
    .editGraphics({
      target: "horizontalGridLines",
      property: "strokeWidth",
      value: 1
    })
    .editGraphics({
      target: "horizontalGridLines",
      property: "strokeDash",
      value: yTicks.positions.map(() => [])
    })
    .createGraphics({ id: "xAxisLine", parent: "plot-main", type: "line" })
    .editGraphics({ target: "xAxisLine", property: "x1", value: bounds.left })
    .editGraphics({ target: "xAxisLine", property: "y1", value: bounds.bottom })
    .editGraphics({ target: "xAxisLine", property: "x2", value: bounds.right })
    .editGraphics({ target: "xAxisLine", property: "y2", value: bounds.bottom })
    .editGraphics({ target: "xAxisLine", property: "stroke", value: "#334155" })
    .editGraphics({ target: "xAxisLine", property: "strokeWidth", value: 1 })
    .createGraphics({ id: "yAxisLine", parent: "plot-main", type: "line" })
    .editGraphics({ target: "yAxisLine", property: "x1", value: bounds.left })
    .editGraphics({ target: "yAxisLine", property: "y1", value: bounds.bottom })
    .editGraphics({ target: "yAxisLine", property: "x2", value: bounds.left })
    .editGraphics({ target: "yAxisLine", property: "y2", value: bounds.top })
    .editGraphics({ target: "yAxisLine", property: "stroke", value: "#334155" })
    .editGraphics({ target: "yAxisLine", property: "strokeWidth", value: 1 })
    .createGraphics({
      id: "xAxisTicks",
      parent: "plot-main",
      type: "line",
      length: xTicks.positions.length,
      after: "xAxisLine"
    })
    .editGraphics({ target: "xAxisTicks", property: "x1", value: xTicks.positions })
    .editGraphics({ target: "xAxisTicks", property: "y1", value: bounds.bottom })
    .editGraphics({ target: "xAxisTicks", property: "x2", value: xTicks.positions })
    .editGraphics({
      target: "xAxisTicks",
      property: "y2",
      value: bounds.bottom + 6
    })
    .editGraphics({ target: "xAxisTicks", property: "stroke", value: "#64748b" })
    .editGraphics({ target: "xAxisTicks", property: "strokeWidth", value: 1 })
    .createGraphics({
      id: "yAxisTicks",
      parent: "plot-main",
      type: "line",
      length: yTicks.positions.length,
      after: "yAxisLine"
    })
    .editGraphics({
      target: "yAxisTicks",
      property: "x1",
      value: bounds.left - 6
    })
    .editGraphics({ target: "yAxisTicks", property: "y1", value: yTicks.positions })
    .editGraphics({ target: "yAxisTicks", property: "x2", value: bounds.left })
    .editGraphics({ target: "yAxisTicks", property: "y2", value: yTicks.positions })
    .editGraphics({ target: "yAxisTicks", property: "stroke", value: "#64748b" })
    .editGraphics({ target: "yAxisTicks", property: "strokeWidth", value: 1 })
    .createGraphics({
      id: "points",
      parent: "plot-main",
      type: "circle",
      length: validCars.length,
      after: "horizontalGridLines"
    })
    .editGraphics({ target: "points", property: "x", value: x })
    .editGraphics({ target: "points", property: "y", value: y })
    .editGraphics({ target: "points", property: "fill", value: fill })
    .editGraphics({ target: "points", property: "radius", value: 3 })
    .createGraphics({
      id: "xAxisLabels",
      parent: "plot-main",
      type: "text",
      length: xTicks.positions.length,
      after: "xAxisTicks"
    })
    .editGraphics({ target: "xAxisLabels", property: "x", value: xTicks.positions })
    .editGraphics({
      target: "xAxisLabels",
      property: "y",
      value: bounds.bottom + 18
    })
    .editGraphics({ target: "xAxisLabels", property: "text", value: xTicks.labels })
    .editGraphics({ target: "xAxisLabels", property: "fill", value: "#334155" })
    .editGraphics({ target: "xAxisLabels", property: "fontSize", value: 12 })
    .editGraphics({
      target: "xAxisLabels",
      property: "fontFamily",
      value: "sans-serif"
    })
    .editGraphics({ target: "xAxisLabels", property: "fontWeight", value: "normal" })
    .editGraphics({ target: "xAxisLabels", property: "textAlign", value: "center" })
    .editGraphics({ target: "xAxisLabels", property: "textBaseline", value: "top" })
    .createGraphics({
      id: "yAxisLabels",
      parent: "plot-main",
      type: "text",
      length: yTicks.positions.length,
      after: "yAxisTicks"
    })
    .editGraphics({
      target: "yAxisLabels",
      property: "x",
      value: bounds.left - 12
    })
    .editGraphics({ target: "yAxisLabels", property: "y", value: yTicks.positions })
    .editGraphics({ target: "yAxisLabels", property: "text", value: yTicks.labels })
    .editGraphics({ target: "yAxisLabels", property: "fill", value: "#334155" })
    .editGraphics({ target: "yAxisLabels", property: "fontSize", value: 12 })
    .editGraphics({
      target: "yAxisLabels",
      property: "fontFamily",
      value: "sans-serif"
    })
    .editGraphics({ target: "yAxisLabels", property: "fontWeight", value: "normal" })
    .editGraphics({ target: "yAxisLabels", property: "textAlign", value: "right" })
    .editGraphics({
      target: "yAxisLabels",
      property: "textBaseline",
      value: "middle"
    })
    .createGraphics({ id: "xAxisTitle", parent: "plot-main", type: "text", after: "xAxisLabels" })
    .editGraphics({
      target: "xAxisTitle",
      property: "x",
      value: (bounds.left + bounds.right) / 2
    })
    .editGraphics({ target: "xAxisTitle", property: "y", value: 382 })
    .editGraphics({ target: "xAxisTitle", property: "text", value: "Horsepower" })
    .editGraphics({ target: "xAxisTitle", property: "fill", value: "#334155" })
    .editGraphics({ target: "xAxisTitle", property: "fontSize", value: 13 })
    .editGraphics({
      target: "xAxisTitle",
      property: "fontFamily",
      value: "sans-serif"
    })
    .editGraphics({ target: "xAxisTitle", property: "fontWeight", value: 600 })
    .editGraphics({ target: "xAxisTitle", property: "textAlign", value: "center" })
    .editGraphics({
      target: "xAxisTitle",
      property: "textBaseline",
      value: "middle"
    })
    .editGraphics({ target: "xAxisTitle", property: "rotation", value: 0 })
    .createGraphics({ id: "yAxisTitle", parent: "plot-main", type: "text", after: "yAxisLabels" })
    .editGraphics({ target: "yAxisTitle", property: "x", value: 18 })
    .editGraphics({
      target: "yAxisTitle",
      property: "y",
      value: (bounds.top + bounds.bottom) / 2
    })
    .editGraphics({
      target: "yAxisTitle",
      property: "text",
      value: "Miles per Gallon"
    })
    .editGraphics({ target: "yAxisTitle", property: "fill", value: "#334155" })
    .editGraphics({ target: "yAxisTitle", property: "fontSize", value: 13 })
    .editGraphics({
      target: "yAxisTitle",
      property: "fontFamily",
      value: "sans-serif"
    })
    .editGraphics({ target: "yAxisTitle", property: "fontWeight", value: 600 })
    .editGraphics({ target: "yAxisTitle", property: "textAlign", value: "center" })
    .editGraphics({
      target: "yAxisTitle",
      property: "textBaseline",
      value: "middle"
    })
    .editGraphics({
      target: "yAxisTitle",
      property: "rotation",
      value: -Math.PI / 2
    });
}

export function renderCarsScatterplotPrimitives(program, canvasContext) {
  render(program, canvasContext);
}
