import {
  createData,
  createDerivedData,
  createRegressionData,
  filterData,
  materializeFilteredData,
  materializeRegressionData
} from "./actions.js";

export function registerDataActions(ProgramClass) {
  ProgramClass.prototype.createData = createData;
  ProgramClass.prototype.createDerivedData = createDerivedData;
  ProgramClass.prototype.materializeFilteredData = materializeFilteredData;
  ProgramClass.prototype.filterData = filterData;
  ProgramClass.prototype.materializeRegressionData = materializeRegressionData;
  ProgramClass.prototype.createRegressionData = createRegressionData;
}
