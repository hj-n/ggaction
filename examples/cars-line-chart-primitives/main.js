import { render } from "../../src/index.js";
import { createCarsLineChartPrimitives } from "../../test/programs/carsLineChartPrimitives.js";

const response = await fetch("../../data/cars.json");
const cars = await response.json();
const program = createCarsLineChartPrimitives(cars);

const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"));
document.querySelector("#status").textContent =
  `${program.semanticSpec.datasets[0].values.length} cars aggregated`;
