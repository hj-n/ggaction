import { createPointMark } from "./create.js";
import { editPointMark } from "./edit.js";
import { rematerializePointMark } from "./materialize.js";

export { registerPointJitterActions } from "./jitter.js";

export function registerPointMarkActions(ProgramClass) {
  ProgramClass.prototype.createPointMark = createPointMark;
  ProgramClass.prototype.editPointMark = editPointMark;
  ProgramClass.prototype.rematerializePointMark = rematerializePointMark;
}
