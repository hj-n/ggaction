import { render } from "../../src/index.js";

import { createCarsOriginJitter } from "./program.js";

const response = await fetch("../../data/cars.json");
const cars = await response.json();
const program = createCarsOriginJitter(cars);
const canvas = document.querySelector("#chart");

render(program, canvas.getContext("2d"));
document.querySelector("#status").textContent =
  `${program.graphicSpec.objects.observations.items.length} cars rendered`;
