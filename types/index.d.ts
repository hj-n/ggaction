import type { ChartProgram } from "./program.js";

export type {
  ActionOptions,
  CanvasOptions,
  CategoricalEncodingOptions,
  ColorEncodingOptions,
  ChartProgram,
  ConcretePathCommand,
  EditScaleOptions,
  FieldType,
  GraphicObject,
  GraphicSpec,
  GraphicType,
  LegendOptions,
  ContinuousColorInterpolation,
  ContinuousColorScaleOptions,
  OpacityEncodingOptions,
  OpacityScaleOptions,
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
