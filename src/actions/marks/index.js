import { registerBarMarkActions } from "./bar/index.js";
import { registerAreaMarkActions } from "./area.js";
import { registerLineMarkActions } from "./line.js";
import { registerPointMarkActions } from "./point.js";

export function registerMarkActions(ProgramClass) {
  registerPointMarkActions(ProgramClass);
  registerAreaMarkActions(ProgramClass);
  registerLineMarkActions(ProgramClass);
  registerBarMarkActions(ProgramClass);
}
