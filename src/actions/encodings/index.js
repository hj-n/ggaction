import { registerAppearanceEncodingAction } from "./appearance.js";
import { registerBarWidthEncodingAction } from "./barWidth.js";
import { registerCategoricalEncodingActions } from "./categorical.js";
import { registerDensityEncodingAction } from "./density.js";
import { registerHistogramEncodingAction } from "./histogram.js";
import { registerOffsetEncodingAction } from "./offset.js";
import { registerPositionEncodingActions } from "./position.js";
import { registerRangedEncodingActions } from "./ranged.js";

export function registerEncodingActions(ProgramClass) {
  registerPositionEncodingActions(ProgramClass);
  registerRangedEncodingActions(ProgramClass);
  registerOffsetEncodingAction(ProgramClass);
  registerBarWidthEncodingAction(ProgramClass);
  registerHistogramEncodingAction(ProgramClass);
  registerDensityEncodingAction(ProgramClass);
  registerCategoricalEncodingActions(ProgramClass);
  registerAppearanceEncodingAction(ProgramClass);
}
