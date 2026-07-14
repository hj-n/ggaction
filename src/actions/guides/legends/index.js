import { registerCategoricalLegendActions } from "./categorical/index.js";
import { registerContinuousLegendActions } from "./continuous.js";
import { registerPointLegendActions } from "./point.js";

export function registerLegendActions(ProgramClass) {
  registerCategoricalLegendActions(ProgramClass);
  registerContinuousLegendActions(ProgramClass);
  registerPointLegendActions(ProgramClass);
}
