import { registerBarMarkActions } from "./bar/index.js";
import { registerAreaMarkActions } from "./area.js";
import { registerArcMarkActions } from "./arc.js";
import { registerLineMarkActions } from "./line.js";
import { registerPointMarkActions } from "./point.js";
import { registerRuleMarkActions } from "./rule.js";
import { removeMark } from "./remove.js";

export function registerMarkActions(ProgramClass) {
  registerPointMarkActions(ProgramClass);
  registerAreaMarkActions(ProgramClass);
  registerArcMarkActions(ProgramClass);
  registerLineMarkActions(ProgramClass);
  registerBarMarkActions(ProgramClass);
  registerRuleMarkActions(ProgramClass);
  ProgramClass.prototype.removeMark = removeMark;
}
