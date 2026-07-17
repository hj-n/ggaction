import { render } from "../../../src/index.js";

import {
  createNestedDashboardPrimitives,
  createReplacementPrimitives,
  createUnequalHorizontalPrimitives
} from "./primitive.program.js";

const [carsResponse, jobsResponse, gapminderResponse] = await Promise.all([
  fetch("../../../data/cars.json"),
  fetch("../../../data/jobs.json"),
  fetch("../../../data/gapminder.json")
]);
const [cars, jobs, gapminder] = await Promise.all([
  carsResponse.json(),
  jobsResponse.json(),
  gapminderResponse.json()
]);
const programs = {
  unequal: createUnequalHorizontalPrimitives(cars, jobs, gapminder),
  nested: createNestedDashboardPrimitives(cars, jobs, gapminder),
  replacement: createReplacementPrimitives(cars, jobs, gapminder)
};

for (const [id, program] of Object.entries(programs)) {
  const canvas = document.querySelector(`#${id}`);
  render(program, canvas.getContext("2d"));
}

window.__compositionGate = Object.freeze(Object.fromEntries(
  Object.entries(programs).map(([id, program]) => {
    const canvas = document.querySelector(`#${id}`);
    const nestedCanvases = Object.values(program.graphicSpec.objects)
      .filter(object => object.type === "canvas").length - 1;
    return [id, Object.freeze({
      width: canvas.width,
      height: canvas.height,
      nestedCanvases
    })];
  })
));
document.querySelector("#status").textContent = "Composition gate rendered";
