import { render } from "../../../src/index.js";

import {
  createGapminderPolarLinePrimitives,
  createJobsRadarPrimitives
} from "./primitive.program.js";

const [gapminderResponse, jobsResponse] = await Promise.all([
  fetch("../../../data/gapminder.json"),
  fetch("../../../data/jobs.json")
]);
const [gapminder, jobs] = await Promise.all([
  gapminderResponse.json(),
  jobsResponse.json()
]);
const gapminderProgram = createGapminderPolarLinePrimitives(gapminder);
const jobsProgram = createJobsRadarPrimitives(jobs);
const gapminderCanvas = document.querySelector("#gapminder-chart");
const jobsCanvas = document.querySelector("#jobs-chart");

render(gapminderProgram, gapminderCanvas.getContext("2d"));
render(jobsProgram, jobsCanvas.getContext("2d"));

window.__polarLineRadarGate = Object.freeze({
  gapminder: {
    width: gapminderCanvas.width,
    height: gapminderCanvas.height,
    paths: gapminderProgram.graphicSpec.objects.line.items.length,
    closed: gapminderProgram.graphicSpec.objects.line.items.every(item =>
      item.properties.commands.at(-1).op === "Z"
    )
  },
  jobs: {
    width: jobsCanvas.width,
    height: jobsCanvas.height,
    paths: jobsProgram.graphicSpec.objects.line.items.length,
    closed: jobsProgram.graphicSpec.objects.line.items.every(item =>
      item.properties.commands.at(-1).op === "Z"
    )
  }
});
