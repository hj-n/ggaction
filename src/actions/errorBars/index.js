import { createErrorBarCap } from "./components.js";
import { createErrorBar } from "./create.js";

export function registerErrorBarActions(ProgramClass) {
  ProgramClass.prototype.createErrorBarCap = createErrorBarCap;
  ProgramClass.prototype.createErrorBar = createErrorBar;
}
