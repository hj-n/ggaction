import { render } from "../../src/index.js";

import { createProgramCompositionExample } from "./program.js";

const program = createProgramCompositionExample();
const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"));
document.querySelector("#status").textContent = "Two child programs rendered";
