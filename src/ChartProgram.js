import { registerActions } from "./actions/index.js";
import { ChartProgram as CoreChartProgram } from "./core/ChartProgram.js";

export class ChartProgram extends CoreChartProgram {}

registerActions(ChartProgram);

export function chart() {
  return new ChartProgram();
}
