import { registerGuideAxisActions } from "./axes/index.js";
import { registerGuideCollectionActions } from "./guideCollection.js";
import { registerGridActions } from "./grids/index.js";
import { registerLegendActions } from "./legends/index.js";

export function registerGuideActions(ProgramClass) {
  registerGuideAxisActions(ProgramClass);
  registerLegendActions(ProgramClass);
  registerGridActions(ProgramClass);
  registerGuideCollectionActions(ProgramClass);
}
