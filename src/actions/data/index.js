import {
  createData,
  createDerivedData,
  filterData,
  materializeFilteredData
} from "./actions.js";

export function registerDataActions(ProgramClass) {
  ProgramClass.prototype.createData = createData;
  ProgramClass.prototype.createDerivedData = createDerivedData;
  ProgramClass.prototype.materializeFilteredData = materializeFilteredData;
  ProgramClass.prototype.filterData = filterData;
}
