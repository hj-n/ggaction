import { render } from "../../src/index.js";

import { createCarsWindowRankScatterplot } from "./program.js";

const response = await fetch("../../data/cars.json");
const cars = await response.json();
const program = createCarsWindowRankScatterplot(cars);
const canvas = document.querySelector("#chart");

render(program, canvas.getContext("2d"), {
  pixelRatio: window.devicePixelRatio
});
document.querySelector("#status").textContent =
  `${program.graphicSpec.objects.rankedCarsPlot.items.length} ranked cars rendered`;
