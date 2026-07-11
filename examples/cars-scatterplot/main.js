import { render } from "../../src/index.js";
import { ChartProgram } from "../../src/extension.js";

const ORIGIN_COLORS = Object.freeze({
  USA: "#4c78a8",
  Europe: "#f58518",
  Japan: "#54a24b"
});

function mapLinear(values, [rangeStart, rangeEnd]) {
  const domainMin = Math.min(...values);
  const domainMax = Math.max(...values);

  return values.map(value => {
    const ratio = (value - domainMin) / (domainMax - domainMin);
    return rangeStart + ratio * (rangeEnd - rangeStart);
  });
}

const response = await fetch("../../data/cars.json");
const cars = await response.json();
const rows = cars.filter(
  car =>
    Number.isFinite(car.Horsepower) &&
    Number.isFinite(car.Miles_per_Gallon)
);
const x = mapLinear(
  rows.map(car => car.Horsepower),
  [30, 610]
);
const y = mapLinear(
  rows.map(car => car.Miles_per_Gallon),
  [370, 30]
);
const fill = rows.map(car => ORIGIN_COLORS[car.Origin]);

const program = new ChartProgram()
  .editSemantic({ property: "dataset[cars].values", value: rows })
  .editSemantic({ property: "layer[points].mark.type", value: "point" })
  .editSemantic({ property: "layer[points].data", value: "cars" })
  .createGraphics({ id: "canvas", type: "canvas" })
  .editGraphics({ target: "canvas", property: "width", value: 640 })
  .editGraphics({ target: "canvas", property: "height", value: 400 })
  .editGraphics({ target: "canvas", property: "background", value: "white" })
  .createGraphics({ id: "points", type: "circle", length: rows.length })
  .editGraphics({ target: "points", property: "x", value: x })
  .editGraphics({ target: "points", property: "y", value: y })
  .editGraphics({ target: "points", property: "fill", value: fill })
  .editGraphics({ target: "points", property: "radius", value: 3 });

const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"));
document.querySelector("#status").textContent = `${rows.length} cars rendered`;
