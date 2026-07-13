import {
  createData,
  createDensityData,
  createDerivedData,
  createRegressionData,
  filterData,
  materializeFilteredData,
  materializeDensityData,
  materializeRegressionData
} from "./actions.js";

export function registerDataActions(ProgramClass) {
  ProgramClass.prototype.createData = createData;
  ProgramClass.prototype.createDerivedData = createDerivedData;
  ProgramClass.prototype.createDensityData = createDensityData;
  ProgramClass.prototype.materializeFilteredData = materializeFilteredData;
  ProgramClass.prototype.filterData = filterData;
  ProgramClass.prototype.materializeRegressionData = materializeRegressionData;
  ProgramClass.prototype.materializeDensityData = materializeDensityData;
  ProgramClass.prototype.createRegressionData = createRegressionData;
}
