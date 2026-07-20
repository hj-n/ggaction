import { render } from "../../../src/index.js";
import { createCarsBinnedHeatmap } from "./public.program.js";

const response = await fetch("/data/cars.json");
if (!response.ok) throw new Error(`Cars request failed with ${response.status}.`);
const cars = await response.json();
const program = createCarsBinnedHeatmap(cars);
const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"), { pixelRatio: 2 });
document.querySelector("#status").textContent = "80 binned cells rendered";
window.__ggactionGate = Object.freeze({ program, logicalWidth: 700, logicalHeight: 500 });
