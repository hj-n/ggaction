import { registerBasicActions } from "./actions/basic.js";
import { ChartProgram as CoreChartProgram } from "./core/ChartProgram.js";

class BasicChartProgram extends CoreChartProgram {}

registerBasicActions(BasicChartProgram);

export function chart() {
  return new BasicChartProgram();
}
