import { createErrorBand } from "./create.js";

export function registerErrorBandActions(ProgramClass) {
  ProgramClass.prototype.createErrorBand = createErrorBand;
}
