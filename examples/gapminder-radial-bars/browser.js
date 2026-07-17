import { render } from "../../src/index.js";
import { createGapminderRadialBars } from "./program.js";

const response = await fetch("../../data/gapminder.json");
const program = createGapminderRadialBars(await response.json());
const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"));
document.querySelector("#status").textContent = "Rendered Gapminder radial bars.";

window.__gapminderRadialBars = Object.freeze({
  width: canvas.width,
  height: canvas.height,
  paths: program.graphicSpec.objects.arc.items.length
});
