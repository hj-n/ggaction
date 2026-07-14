import type { ChartProgram } from "./program.js";

export type {
  ActionOptions,
  CanvasOptions,
  CategoricalEncodingOptions,
  ChartProgram,
  EditScaleOptions,
  FieldType,
  GraphicObject,
  GraphicSpec,
  GraphicType,
  LegendOptions,
  PointShape,
  Palette,
  PaletteName,
  PositionEncodingOptions,
  RegressionOptions,
  ScaleRange,
  ScaleOptions,
  ScaleType,
  SemanticSpec,
  TraceNode
} from "./program.js";

export function chart(): ChartProgram;
export function render(
  program: Pick<ChartProgram, "graphicSpec">,
  context: CanvasRenderingContext2D,
  options?: { pixelRatio?: number }
): void;
