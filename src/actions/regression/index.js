import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { isPlainObject } from "../../core/immutable.js";
import { validateKeys } from "../../core/validation.js";
import { DEFAULT_COLORS } from "../../theme/defaults.js";

const REGRESSION_OPTIONS = Object.freeze([
  "target", "x", "y", "groupBy", "confidence", "band", "line"
]);
const BAND_OPTIONS = Object.freeze([
  "id", "data", "x", "lower", "upper", "groupBy", "coordinate", "xScale", "yScale",
  "color", "opacity"
]);
const LINE_OPTIONS = Object.freeze([
  "id", "data", "x", "y", "groupBy", "coordinate", "xScale", "yScale", "colorScale",
  "strokeWidth"
]);

function requireObject(value, label) {
  if (!isPlainObject(value)) throw new TypeError(`${label} must be a plain object.`);
  return value;
}

function requireField(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

function findPoint(program, requested) {
  const eligible = program.semanticSpec.layers.filter(layer =>
    layer.mark?.type === "point" &&
    layer.encoding?.x?.fieldType === "quantitative" &&
    layer.encoding?.y?.fieldType === "quantitative"
  );
  if (requested !== undefined) {
    const selected = eligible.find(layer => layer.id === requested);
    if (selected === undefined) {
      throw new Error(`Unknown regression point target "${requested}".`);
    }
    return selected;
  }
  const current = eligible.find(layer => layer.id === program.context.currentMark);
  if (current !== undefined) return current;
  if (eligible.length === 1) return eligible[0];
  if (eligible.length === 0) {
    throw new Error("createRegression requires an eligible quantitative point mark.");
  }
  throw new Error("createRegression target is ambiguous; provide target.");
}

function inferGroup(layer, args) {
  if (Object.hasOwn(args, "groupBy")) {
    return args.groupBy === undefined
      ? undefined
      : requireField(args.groupBy, "Regression groupBy");
  }
  const candidates = [...new Set(
    [layer.encoding?.color, layer.encoding?.shape]
      .filter(encoding => encoding?.fieldType === "nominal")
      .map(encoding => encoding.field)
  )];
  if (candidates.length > 1) {
    throw new Error("createRegression groupBy is ambiguous; provide groupBy.");
  }
  return candidates[0];
}

export const createRegressionBand = action(
  {
    op: "createRegressionBand",
    description: "Create and encode a grouped regression confidence band."
  },
  function (args = {}) {
    validateKeys(args, BAND_OPTIONS, "createRegressionBand");
    const id = validateUserId(args.id, "Regression band id");
    let next = this
      .createAreaMark({
        id,
        data: args.data,
        fill: args.color ?? DEFAULT_COLORS.regressionBand,
        opacity: args.opacity ?? 0.18
      })
      .encodeX({
        target: id,
        field: args.x,
        fieldType: "quantitative",
        coordinate: args.coordinate,
        scale: { id: args.xScale }
      })
      .encodeYRange({
        target: id,
        lower: args.lower,
        upper: args.upper,
        fieldType: "quantitative",
        coordinate: args.coordinate,
        scale: { id: args.yScale }
      });
    if (args.groupBy !== undefined) {
      next = next.encodeGroup({
        target: id,
        field: args.groupBy
      });
    }
    return next.rematerializeAreaMark({ id });
  }
);

export const createRegressionLine = action(
  {
    op: "createRegressionLine",
    description: "Create and encode grouped regression line paths."
  },
  function (args = {}) {
    validateKeys(args, LINE_OPTIONS, "createRegressionLine");
    const id = validateUserId(args.id, "Regression line id");
    let next = this
      .createLineMark({
        id,
        data: args.data,
        strokeWidth: args.strokeWidth ?? 3
      })
      .encodeX({
        target: id,
        field: args.x,
        fieldType: "quantitative",
        coordinate: args.coordinate,
        scale: { id: args.xScale }
      })
      .encodeY({
        target: id,
        field: args.y,
        fieldType: "quantitative",
        coordinate: args.coordinate,
        scale: { id: args.yScale }
      });
    if (args.groupBy !== undefined) {
      next = next
        .encodeColor({
          target: id,
          field: args.groupBy,
          scale: { id: args.colorScale }
        })
        .encodeGroup({
          target: id,
          field: args.groupBy
        });
    }
    return next.rematerializeLineMark({ id });
  }
);

export const createRegression = action(
  {
    op: "createRegression",
    description: "Fit and layer a linear regression line with confidence band."
  },
  function (args = {}) {
    validateKeys(args, REGRESSION_OPTIONS, "createRegression");
    const point = findPoint(this, args.target);
    const x = args.x === undefined
      ? point.encoding.x.field
      : requireField(args.x, "Regression x");
    const y = args.y === undefined
      ? point.encoding.y.field
      : requireField(args.y, "Regression y");
    const groupBy = inferGroup(point, args);
    const coordinate = point.coordinate;
    const xScale = point.encoding.x.scale;
    const yScale = point.encoding.y.scale;
    if (coordinate === undefined || xScale === undefined || yScale === undefined) {
      throw new Error("createRegression target requires stored coordinate and scales.");
    }
    const band = requireObject(args.band ?? {}, "Regression band");
    const line = requireObject(args.line ?? {}, "Regression line");
    validateKeys(band, ["color", "opacity"], "regression band");
    validateKeys(line, ["strokeWidth"], "regression line");
    const colorEncoding = point.encoding?.color;
    const namespace = point.id;
    const dataId = `${namespace}RegressionData`;
    const bandId = `${namespace}RegressionBands`;
    const lineId = `${namespace}RegressionLines`;
    const colorScale =
      groupBy !== undefined && colorEncoding?.field === groupBy
        ? colorEncoding.scale
        : `${namespace}RegressionColor`;

    return this
      .createRegressionData({
        id: dataId,
        source: point.data,
        x,
        y,
        ...(groupBy === undefined ? {} : { groupBy }),
        confidence: args.confidence ?? 0.95
      })
      .createRegressionBand({
        id: bandId,
        data: dataId,
        x,
        lower: "__regression_ci_lower",
        upper: "__regression_ci_upper",
        ...(groupBy === undefined ? {} : { groupBy }),
        coordinate,
        xScale,
        yScale,
        ...band
      })
      .createRegressionLine({
        id: lineId,
        data: dataId,
        x,
        y,
        ...(groupBy === undefined ? {} : { groupBy, colorScale }),
        coordinate,
        xScale,
        yScale,
        ...line
      });
  }
);

export function registerRegressionActions(ProgramClass) {
  ProgramClass.prototype.createRegressionBand = createRegressionBand;
  ProgramClass.prototype.createRegressionLine = createRegressionLine;
  ProgramClass.prototype.createRegression = createRegression;
}
