import { render } from "../../src/index.js";
import { createNightingaleRoseChart } from "./program.js";

const response = await fetch("../../data/nightingale_rose.json");
const program = createNightingaleRoseChart(await response.json());
const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"));
document.querySelector("#status").textContent = "Rendered Nightingale rose chart.";

window.__nightingaleRoseChart = Object.freeze({
  width: canvas.width,
  height: canvas.height,
  paths: program.graphicSpec.objects.arc.items.length
});
