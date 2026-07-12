import { registerAxisCollectionActions } from "./axisCollections.js";
import { registerAxisLabelActions } from "./axisLabels.js";
import { registerAxisLineActions } from "./axisLines.js";
import { registerAxisTickGroupActions } from "./axisTickGroups.js";
import { registerAxisTickActions } from "./axisTicks.js";
import { registerAxisTitleActions } from "./axisTitles.js";
import { registerAxisActions } from "./axes.js";

export function registerGuideAxisActions(ProgramClass) {
  registerAxisLineActions(ProgramClass);
  registerAxisTickActions(ProgramClass);
  registerAxisLabelActions(ProgramClass);
  registerAxisTickGroupActions(ProgramClass);
  registerAxisTitleActions(ProgramClass);
  registerAxisActions(ProgramClass);
  registerAxisCollectionActions(ProgramClass);
}
