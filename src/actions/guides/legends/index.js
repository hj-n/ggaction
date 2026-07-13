import { registerCategoricalLegendActions } from "./categorical/index.js";
import { registerPointLegendActions } from "./point.js";

export function registerLegendActions(ProgramClass) {
  registerCategoricalLegendActions(ProgramClass);
  registerPointLegendActions(ProgramClass);
}
