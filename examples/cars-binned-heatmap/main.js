import { render } from "../../src/index.js";

import { createCarsBinnedHeatmap } from "./program.js";

const response = await fetch("../../data/cars.json");
const cars = await response.json();
const program = createCarsBinnedHeatmap(cars);
const canvas = document.querySelector("#chart");

render(program, canvas.getContext("2d"), {
  pixelRatio: window.devicePixelRatio
});
const cells = program.graphicSpec.objects.heatmap.items.length;
document.querySelector("#status").textContent = `${cells} binned cells rendered`;
window.__carsBinnedHeatmap = Object.freeze({
  width: 700,
  height: 500,
  cells
});
