import { action } from "../../core/action.js";
import { isPlainObject } from "../../core/immutable.js";
import {
  validateNonEmptyString,
  validateOptionObject
} from "../../core/validation.js";
import { requireDataset } from "../../selectors/datasets.js";
import {
  applyFacadeGuides,
  normalizeAppearance,
  normalizeFieldEncoding,
  normalizeGuides,
  positionArgs,
  resolveFacadeData,
  resolveFacadeId,
  targetArgs,
  validateFacadeOptions
} from "./shared.js";

const OPTIONS = Object.freeze([
  "id", "data", "coordinate", "x", "y", "bin", "color", "rect", "guides"
]);
const RECT_OPTIONS = Object.freeze([
  "opacity", "stroke", "strokeWidth"
]);
const BIN_OPTIONS = Object.freeze([
  "bins", "extent", "includeEmpty"
]);
const BINNED_POSITION_OPTIONS = Object.freeze([
  "field", "fieldType", "scale"
]);
const BINNED_COLOR_OPTIONS = Object.freeze([
  "scale", "palette"
]);

function normalizeBin(value) {
  if (!isPlainObject(value)) {
    throw new TypeError("createHeatmap bin must be a plain object.");
  }
  validateOptionObject(value, BIN_OPTIONS, "createHeatmap bin");
  return {
    ...value,
    includeEmpty: value.includeEmpty ?? true
  };
}

function normalizeBinnedPosition(value, channel) {
  const label = `createHeatmap ${channel}`;
  const encoding = normalizeFieldEncoding(value, label);
  validateOptionObject(encoding, BINNED_POSITION_OPTIONS, label);
  const field = validateNonEmptyString(encoding.field, `${label} field`);
  const fieldType = encoding.fieldType ?? "quantitative";
  if (fieldType !== "quantitative") {
    throw new Error(`${label} requires a quantitative field.`);
  }
  if (encoding.scale !== undefined && !isPlainObject(encoding.scale)) {
    throw new TypeError(`${label} scale must be a plain object.`);
  }
  return { ...encoding, field, fieldType };
}

function normalizeBinnedColor(value) {
  if (value === undefined) return {};
  if (!isPlainObject(value)) {
    throw new TypeError("createHeatmap binned color must be a plain object.");
  }
  validateOptionObject(value, BINNED_COLOR_OPTIONS, "createHeatmap binned color");
  return { ...value };
}

function resolvedPosition(encoding, field, extent) {
  const scale = encoding.scale ?? {};
  return {
    field,
    fieldType: "quantitative",
    scale: {
      type: "linear",
      nice: false,
      zero: false,
      ...scale,
      domain: scale.domain === undefined || scale.domain === "auto"
        ? extent
        : scale.domain
    }
  };
}

function axisWithTitle(value, text) {
  if (value === false) return false;
  if (value !== undefined && !isPlainObject(value)) {
    throw new TypeError("createHeatmap binned axis must be false or a plain object.");
  }
  if (value?.title !== undefined && !isPlainObject(value.title)) {
    throw new TypeError("createHeatmap binned axis title must be a plain object.");
  }
  return {
    ...value,
    title: {
      text,
      ...value?.title
    }
  };
}

function binnedGuides(guides, xTitle, yTitle) {
  if (guides === false) return false;
  for (const key of ["axes", "legend"]) {
    if (
      guides[key] !== undefined &&
      guides[key] !== false &&
      !isPlainObject(guides[key])
    ) {
      throw new TypeError(
        `createHeatmap guides ${key} must be false or a plain object.`
      );
    }
  }
  const axes = guides.axes === false
    ? false
    : {
        ...guides.axes,
        x: axisWithTitle(guides.axes?.x, xTitle),
        y: axisWithTitle(guides.axes?.y, yTitle)
      };
  const legend = guides.legend === false
    ? false
    : { title: "Count", ...guides.legend };
  return {
    ...guides,
    axes,
    grid: guides.grid ?? false,
    legend
  };
}

function createPreGriddedHeatmap(program, args, { id, data, rect, guides }) {
  const x = normalizeFieldEncoding(args.x, "createHeatmap x");
  const y = normalizeFieldEncoding(args.y, "createHeatmap y");
  const color = normalizeFieldEncoding(args.color, "createHeatmap color");
  const next = program
    .createRectMark({ id, data, ...rect })
    .encodeX(positionArgs(x, { target: id, coordinate: args.coordinate }))
    .encodeY(positionArgs(y, { target: id, coordinate: args.coordinate }))
    .encodeColor(targetArgs(color, id));
  return applyFacadeGuides(next, guides);
}

function createBinnedHeatmap(program, args, { id, data, rect, guides }) {
  const x = normalizeBinnedPosition(args.x, "x");
  const y = normalizeBinnedPosition(args.y, "y");
  const bin = normalizeBin(args.bin);
  const color = normalizeBinnedColor(args.color);
  const resolvedGuides = binnedGuides(guides, x.field, y.field);
  const generatedData = `${id}Bin2DData`;
  const binned = program.createBin2DData({
    id: generatedData,
    source: data,
    x: x.field,
    y: y.field,
    ...bin
  });
  const dataset = requireDataset(binned, generatedData);
  const transform = dataset.transform[0];
  const resolved = transform.resolved;
  const xEncoding = resolvedPosition(x, transform.as.x0, resolved.extent.x);
  const yEncoding = resolvedPosition(y, transform.as.y0, resolved.extent.y);

  const next = binned
    .createRectMark({ id, data: generatedData, ...rect })
    .encodeX(positionArgs(xEncoding, { target: id, coordinate: args.coordinate }))
    .encodeX2({ target: id, field: transform.as.x1, fieldType: "quantitative" })
    .encodeY(positionArgs(yEncoding, { target: id, coordinate: args.coordinate }))
    .encodeY2({ target: id, field: transform.as.y1, fieldType: "quantitative" })
    .encodeColor({
      target: id,
      field: transform.as.count,
      fieldType: "quantitative",
      ...color
    });
  return applyFacadeGuides(
    next,
    resolvedGuides
  );
}

export const createHeatmap = action(
  {
    op: "createHeatmap",
    description: "Create a pre-gridded or rectangularly binned heatmap."
  },
  function (args = {}) {
    validateFacadeOptions(args, OPTIONS, "createHeatmap");
    const id = resolveFacadeId(this, args.id, {
      defaultId: "heatmap",
      operation: "createHeatmap"
    });
    const data = resolveFacadeData(this, args.data, "createHeatmap");
    const rect = normalizeAppearance(args.rect, RECT_OPTIONS, "createHeatmap rect");
    const guides = normalizeGuides(args.guides, "createHeatmap");
    const shared = { id, data, rect, guides };
    return args.bin === undefined
      ? createPreGriddedHeatmap(this, args, shared)
      : createBinnedHeatmap(this, args, shared);
  }
);
