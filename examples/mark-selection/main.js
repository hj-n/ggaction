import { render } from "../../src/index.js";
import {
  createGroupedMaximumPointHighlight,
  createJapanLineSeriesHighlight,
  createTallestHistogramStackHighlight
} from "./program.js";

const response = await fetch("../../data/cars.json");
if (!response.ok) throw new Error(`Failed to load cars: ${response.status}`);
const cars = await response.json();
const examples = [
  ["points-chart", createGroupedMaximumPointHighlight(cars)],
  ["bars-chart", createTallestHistogramStackHighlight(cars)],
  ["lines-chart", createJapanLineSeriesHighlight(cars)]
];

for (const [id, program] of examples) {
  render(program, document.querySelector(`#${id}`).getContext("2d"));
}
document.querySelector("#status").textContent =
  "Point, stacked-bar, and line-series selections rendered";
