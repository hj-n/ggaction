import { createViolinPlot } from "./create.js";

export function registerViolinPlotActions(ProgramClass) {
  ProgramClass.prototype.createViolinPlot = createViolinPlot;
}
