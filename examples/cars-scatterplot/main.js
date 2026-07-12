import { chart, render } from "../../src/index.js";

const ORIGIN_COLORS = Object.freeze({
  USA: "#4c78a8",
  Europe: "#f58518",
  Japan: "#54a24b"
});

const response = await fetch("../../data/cars.json");
const cars = await response.json();
const rows = cars.filter(
  car =>
    Number.isFinite(car.Horsepower) &&
    Number.isFinite(car.Miles_per_Gallon)
);
const fill = rows.map(car => ORIGIN_COLORS[car.Origin]);

const program = chart()
  .createCanvas({ width: 640, height: 400, margin: 30 })
  .createData({ id: "cars", values: rows })
  .createPointMark({ id: "points" })
  .encodeX({ field: "Horsepower" })
  .encodeY({ field: "Miles_per_Gallon" })
  .editGraphics({ target: "points", property: "fill", value: fill })
  .editGraphics({ target: "points", property: "radius", value: 3 });

const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"));
document.querySelector("#status").textContent = `${rows.length} cars rendered`;
