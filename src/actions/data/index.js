import { createData } from "./actions.js";

export function registerDataActions(ProgramClass) {
  ProgramClass.prototype.createData = createData;
}
