import { createScale } from "./create.js";
import { editScale } from "./edit.js";
import { rematerializeScale } from "./materialize.js";

export function registerScaleActions(ProgramClass) {
  ProgramClass.prototype.createScale = createScale;
  ProgramClass.prototype.editScale = editScale;
  ProgramClass.prototype.rematerializeScale = rematerializeScale;
}
