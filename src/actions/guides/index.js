import { registerGuideAxisActions } from "./axes/index.js";
import { registerGuideCollectionActions } from "./guideCollection.js";
import { registerLegendActions } from "./legends/index.js";

export function registerGuideActions(ProgramClass) {
  registerGuideAxisActions(ProgramClass);
  registerLegendActions(ProgramClass);
  registerGuideCollectionActions(ProgramClass);
}
