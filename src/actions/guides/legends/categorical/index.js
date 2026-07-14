import {
  createCategoricalLegend,
  createLegend,
  removeCategoricalLegend,
  rematerializeLegend
} from "./actions.js";
import {
  createLegendBackground,
  createLegendLabels,
  createLegendTitle,
  editLegendBackground,
  editLegendLabels,
  editLegendTitle
} from "./components.js";
import {
  createLegendSymbolLines,
  createLegendSymbolPoints,
  createLegendSymbolSwatches,
  createLegendSymbols,
  editLegendSymbolLines,
  editLegendSymbolPoints,
  editLegendSymbolSwatches,
  editLegendSymbols
} from "./symbols.js";

export function registerCategoricalLegendActions(ProgramClass) {
  ProgramClass.prototype.createLegend = createLegend;
  ProgramClass.prototype.createCategoricalLegend = createCategoricalLegend;
  ProgramClass.prototype.removeCategoricalLegend = removeCategoricalLegend;
  ProgramClass.prototype.createLegendBackground = createLegendBackground;
  ProgramClass.prototype.editLegendBackground = editLegendBackground;
  ProgramClass.prototype.createLegendSymbols = createLegendSymbols;
  ProgramClass.prototype.editLegendSymbols = editLegendSymbols;
  ProgramClass.prototype.createLegendSymbolLines = createLegendSymbolLines;
  ProgramClass.prototype.editLegendSymbolLines = editLegendSymbolLines;
  ProgramClass.prototype.createLegendSymbolPoints = createLegendSymbolPoints;
  ProgramClass.prototype.editLegendSymbolPoints = editLegendSymbolPoints;
  ProgramClass.prototype.createLegendSymbolSwatches = createLegendSymbolSwatches;
  ProgramClass.prototype.editLegendSymbolSwatches = editLegendSymbolSwatches;
  ProgramClass.prototype.createLegendLabels = createLegendLabels;
  ProgramClass.prototype.editLegendLabels = editLegendLabels;
  ProgramClass.prototype.createLegendTitle = createLegendTitle;
  ProgramClass.prototype.editLegendTitle = editLegendTitle;
  ProgramClass.prototype.rematerializeLegend = rematerializeLegend;
}
