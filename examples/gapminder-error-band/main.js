import { render } from "../../src/index.js";
import { createGapminderErrorBand } from "./program.js";

const response = await fetch("../../data/gapminder.json");
if (!response.ok) {
  throw new Error(`Failed to load gapminder data: ${response.status}`);
}
const gapminder = await response.json();
const program = createGapminderErrorBand(gapminder);

const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"));
document.querySelector("#status").textContent =
  `Mean life expectancy and 95% confidence intervals from ${gapminder.length} rows`;
