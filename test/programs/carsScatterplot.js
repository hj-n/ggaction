import { chart, render } from "../../src/index.js";

const ORIGIN_COLORS = Object.freeze({
  USA: "#4c78a8",
  Europe: "#f58518",
  Japan: "#54a24b"
});

export function selectValidCars(cars) {
  if (!Array.isArray(cars)) {
    throw new TypeError("cars must be an array.");
  }

  return cars.filter(
    car =>
      Number.isFinite(car.Horsepower) &&
      Number.isFinite(car.Miles_per_Gallon)
  );
}

export function mapLinear(values, range) {
  if (!Array.isArray(values) || values.some(value => !Number.isFinite(value))) {
    throw new TypeError("values must be an array of finite numbers.");
  }

  if (
    !Array.isArray(range) ||
    range.length !== 2 ||
    range.some(value => !Number.isFinite(value))
  ) {
    throw new TypeError("range must contain two finite numbers.");
  }

  if (values.length === 0) {
    return [];
  }

  const domainMin = Math.min(...values);
  const domainMax = Math.max(...values);
  const [rangeStart, rangeEnd] = range;

  if (domainMin === domainMax) {
    const midpoint = (rangeStart + rangeEnd) / 2;
    return values.map(() => midpoint);
  }

  return values.map(value => {
    const ratio = (value - domainMin) / (domainMax - domainMin);
    return rangeStart + ratio * (rangeEnd - rangeStart);
  });
}

export function createCarsScatterplotValues(cars) {
  const validCars = selectValidCars(cars);
  const x = mapLinear(
    validCars.map(car => car.Horsepower),
    [30, 610]
  );
  const y = mapLinear(
    validCars.map(car => car.Miles_per_Gallon),
    [370, 30]
  );
  const fill = validCars.map(car => {
    const color = ORIGIN_COLORS[car.Origin];

    if (color === undefined) {
      throw new Error(`Unknown car origin "${car.Origin}".`);
    }

    return color;
  });

  return { validCars, x, y, fill };
}

export function createCarsScatterplot(cars) {
  const { validCars, x, y, fill } = createCarsScatterplotValues(cars);

  return chart()
    .editSemantic({
      property: "dataset[cars].values",
      value: validCars
    })
    .editSemantic({
      property: "layer[points].mark.type",
      value: "point"
    })
    .editSemantic({
      property: "layer[points].data",
      value: "cars"
    })
    .createGraphics({
      id: "canvas",
      type: "canvas"
    })
    .editGraphics({
      target: "canvas",
      property: "width",
      value: 640
    })
    .editGraphics({
      target: "canvas",
      property: "height",
      value: 400
    })
    .editGraphics({
      target: "canvas",
      property: "background",
      value: "white"
    })
    .createGraphics({
      id: "points",
      type: "circle",
      length: validCars.length
    })
    .editGraphics({
      target: "points",
      property: "x",
      value: x
    })
    .editGraphics({
      target: "points",
      property: "y",
      value: y
    })
    .editGraphics({
      target: "points",
      property: "fill",
      value: fill
    })
    .editGraphics({
      target: "points",
      property: "radius",
      value: 3
    });
}

export function renderCarsScatterplot(program, canvasContext) {
  render(program, canvasContext);
}
