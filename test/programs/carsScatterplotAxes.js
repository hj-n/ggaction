import { chart, render } from "../../src/index.js";

const ORIGIN_COLORS = Object.freeze({
  USA: "#4c78a8",
  Europe: "#f58518",
  Japan: "#54a24b"
});

const PLOT_BOUNDS = Object.freeze({
  left: 70,
  right: 610,
  top: 30,
  bottom: 340
});

function selectValidCars(cars) {
  if (!Array.isArray(cars)) {
    throw new TypeError("cars must be an array.");
  }

  return cars.filter(
    car =>
      Number.isFinite(car.Horsepower) &&
      Number.isFinite(car.Miles_per_Gallon)
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

function editProperties(program, target, properties) {
  return Object.entries(properties).reduce(
    (next, [property, value]) =>
      next.editGraphics({ target, property, value }),
    program
  );
}

function editTextStyle(program, target, properties = {}) {
  return editProperties(program, target, {
    fill: "#334155",
    fontSize: 12,
    fontFamily: "sans-serif",
    fontWeight: "normal",
    textAlign: "center",
    textBaseline: "middle",
    ...properties
  });
}

export function createCarsScatterplotAxesValues(cars) {
  const validCars = selectValidCars(cars);
  const horsepower = validCars.map(car => car.Horsepower);
  const mileage = validCars.map(car => car.Miles_per_Gallon);
  const xDomain = extent(horsepower);
  const yDomain = extent(mileage);
  const xTickValues = [50, 100, 150, 200];
  const yTickValues = [10, 20, 30, 40];

  return {
    validCars,
    bounds: PLOT_BOUNDS,
    x: mapDomain(horsepower, xDomain, [PLOT_BOUNDS.left, PLOT_BOUNDS.right]),
    y: mapDomain(mileage, yDomain, [PLOT_BOUNDS.bottom, PLOT_BOUNDS.top]),
    fill: validCars.map(car => ORIGIN_COLORS[car.Origin]),
    xTicks: {
      values: xTickValues,
      positions: mapDomain(
        xTickValues,
        xDomain,
        [PLOT_BOUNDS.left, PLOT_BOUNDS.right]
      ),
      labels: xTickValues.map(String)
    },
    yTicks: {
      values: yTickValues,
      positions: mapDomain(
        yTickValues,
        yDomain,
        [PLOT_BOUNDS.bottom, PLOT_BOUNDS.top]
      ),
      labels: yTickValues.map(String)
    }
  };
}

export function createCarsScatterplotAxes(cars) {
  const values = createCarsScatterplotAxesValues(cars);
  const { validCars, bounds, x, y, fill, xTicks, yTicks } = values;
  let program = chart()
    .editSemantic({ property: "dataset[cars].values", value: validCars })
    .editSemantic({ property: "layer[points].mark.type", value: "point" })
    .editSemantic({ property: "layer[points].data", value: "cars" })
    .createGraphics({ id: "canvas", type: "canvas" });

  program = editProperties(program, "canvas", {
    width: 640,
    height: 400,
    background: "white"
  });

  program = program.createGraphics({ id: "xAxis", type: "line" });
  program = editProperties(program, "xAxis", {
    x1: bounds.left,
    y1: bounds.bottom,
    x2: bounds.right,
    y2: bounds.bottom,
    stroke: "#334155",
    strokeWidth: 1
  });

  program = program.createGraphics({ id: "yAxis", type: "line" });
  program = editProperties(program, "yAxis", {
    x1: bounds.left,
    y1: bounds.top,
    x2: bounds.left,
    y2: bounds.bottom,
    stroke: "#334155",
    strokeWidth: 1
  });

  program = program.createGraphics({
    id: "xTicks",
    type: "line",
    length: xTicks.positions.length
  });
  program = editProperties(program, "xTicks", {
    x1: xTicks.positions,
    y1: bounds.bottom,
    x2: xTicks.positions,
    y2: bounds.bottom + 6,
    stroke: "#64748b",
    strokeWidth: 1
  });

  program = program.createGraphics({
    id: "yTicks",
    type: "line",
    length: yTicks.positions.length
  });
  program = editProperties(program, "yTicks", {
    x1: bounds.left - 6,
    y1: yTicks.positions,
    x2: bounds.left,
    y2: yTicks.positions,
    stroke: "#64748b",
    strokeWidth: 1
  });

  program = program.createGraphics({
    id: "points",
    type: "circle",
    length: validCars.length
  });
  program = editProperties(program, "points", {
    x,
    y,
    fill,
    radius: 3
  });

  program = program.createGraphics({
    id: "xLabels",
    type: "text",
    length: xTicks.positions.length
  });
  program = editTextStyle(program, "xLabels", {
    x: xTicks.positions,
    y: bounds.bottom + 18,
    text: xTicks.labels,
    textAlign: "center",
    textBaseline: "top"
  });

  program = program.createGraphics({
    id: "yLabels",
    type: "text",
    length: yTicks.positions.length
  });
  program = editTextStyle(program, "yLabels", {
    x: bounds.left - 12,
    y: yTicks.positions,
    text: yTicks.labels,
    textAlign: "right",
    textBaseline: "middle"
  });

  program = program.createGraphics({ id: "xTitle", type: "text" });
  program = editTextStyle(program, "xTitle", {
    x: (bounds.left + bounds.right) / 2,
    y: 382,
    text: "Horsepower",
    fontSize: 13,
    fontWeight: 600
  });

  program = program.createGraphics({ id: "yTitle", type: "text" });
  program = editTextStyle(program, "yTitle", {
    x: 18,
    y: (bounds.top + bounds.bottom) / 2,
    text: "Miles per Gallon",
    fontSize: 13,
    fontWeight: 600,
    rotation: -Math.PI / 2
  });

  return program;
}

export function renderCarsScatterplotAxes(program, canvasContext) {
  render(program, canvasContext);
}
