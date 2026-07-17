import { render } from "../../src/index.js";
import { createCarsOriginDonut } from "./program.js";

const response = await fetch("../../data/cars.json");
const program = createCarsOriginDonut(await response.json());
const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"));
document.querySelector("#status").textContent = "Rendered Cars Origin donut.";

window.__carsOriginDonut = Object.freeze({
  width: canvas.width,
  height: canvas.height,
  paths: program.graphicSpec.objects.arc.items.length
});
