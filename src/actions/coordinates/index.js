import { createCoordinate } from "./actions.js";

export function registerCoordinateActions(ProgramClass) {
  ProgramClass.prototype.createCoordinate = createCoordinate;
}
