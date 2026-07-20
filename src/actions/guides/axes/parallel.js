import { action } from "../../../core/action.js";
import { validateUserId } from "../../../core/identifiers.js";
import { validateOptionObject } from "../../../core/validation.js";
import {
  isTransformedScaleType,
  mapContinuousScaleValues,
  mapOrdinalPositionValues,
  transformedTicks
} from "../../../grammar/scales/index.js";
import { niceTicks } from "../../../grammar/ticks.js";
import { resolveGraphicBounds } from "../../../layout/canvas.js";
import { resolvePlotGraphicPlacement } from
  "../../../materialization/graphicHierarchy.js";
import { findCoordinate } from "../../../selectors/coordinates.js";
import { findLayer } from "../../../selectors/layers.js";
import { DEFAULT_COLORS, DEFAULT_FONT_FAMILY } from
  "../../../theme/defaults.js";

const CREATE_OPTIONS = Object.freeze(["target", "coordinate"]);
const REMATERIALIZE_OPTIONS = Object.freeze(["target"]);
const AXIS_LINE_COLOR = "#475569";
const AXIS_TITLE_COLOR = "#1e293b";

function requireParallel(program, target) {
  const layer = findLayer(program, target);
  const coordinate = layer === undefined
    ? undefined
    : findCoordinate(program, layer.coordinate);
  if (
    layer?.mark?.type !== "line" ||
    coordinate?.type !== "parallel" ||
    layer.encoding?.parallel?.dimensions?.length < 2
  ) {
    throw new Error(`Parallel axes require an encoded Parallel line "${target}".`);
  }
  return { coordinate, dimensions: layer.encoding.parallel.dimensions, layer };
}

function resolveTarget(program, requested) {
  if (requested !== undefined) {
    const target = validateUserId(requested, "Parallel axes target");
    requireParallel(program, target);
    return target;
  }
  const candidates = program.semanticSpec.layers.filter(layer => {
    const coordinate = findCoordinate(program, layer.coordinate);
    return layer.encoding?.parallel !== undefined && coordinate?.type === "parallel";
  });
  if (candidates.length !== 1) {
    throw new Error(
      "Parallel axes require target when one Parallel layer cannot be inferred."
    );
  }
  return candidates[0].id;
}

function ticksForScale(scale) {
  if (["ordinal", "band", "point"].includes(scale.type)) return scale.domain;
  if (isTransformedScaleType(scale.type)) {
    return transformedTicks(scale.type, scale.domain, 5, {
      ...(scale.base === undefined ? {} : { base: scale.base }),
      ...(scale.exponent === undefined ? {} : { exponent: scale.exponent }),
      ...(scale.constant === undefined ? {} : { constant: scale.constant })
    });
  }
  return niceTicks(scale.domain, 5);
}

function formatValue(value) {
  if (Number.isFinite(value) && Math.abs(value) >= 1000 && value % 1000 === 0) {
    return `${value / 1000}k`;
  }
  return String(value);
}

function axisValues(program, dimensions) {
  const bounds = resolveGraphicBounds(program);
  const step = bounds.width / (dimensions.length - 1);
  const axes = dimensions.map((dimension, index) => {
    const scale = program.resolvedScales[dimension.scale];
    if (scale === undefined) {
      throw new Error(`Parallel axis requires resolved scale "${dimension.scale}".`);
    }
    const values = ticksForScale(scale);
    const y = ["ordinal", "band", "point"].includes(scale.type)
      ? mapOrdinalPositionValues(values, scale)
      : mapContinuousScaleValues(values, scale);
    return {
      ...dimension,
      x: bounds.x + step * index,
      values,
      y,
      labels: values.map(formatValue)
    };
  });
  return { axes, bounds };
}

export const rematerializeParallelAxes = action(
  {
    op: "rematerializeParallelAxes",
    description: "Recompute concrete Parallel dimension axes."
  },
  function (args = {}) {
    validateOptionObject(
      args,
      REMATERIALIZE_OPTIONS,
      "rematerializeParallelAxes"
    );
    const target = resolveTarget(
      this,
      args.target ?? this.guideConfigs.axis?.parallel?.axes?.target
    );
    const { dimensions } = requireParallel(this, target);
    const { axes, bounds } = axisValues(this, dimensions);
    const ticks = axes.flatMap(axis => axis.values.map((value, index) => ({
      x: axis.x,
      y: axis.y[index],
      value,
      text: axis.labels[index]
    })));
    let next = this
      .editGraphics({
        target: "parallelAxisLines",
        property: "length",
        value: axes.length
      })
      .editGraphics({
        target: "parallelAxisLines",
        property: "x1",
        value: axes.map(axis => axis.x)
      })
      .editGraphics({ target: "parallelAxisLines", property: "y1", value: bounds.y })
      .editGraphics({
        target: "parallelAxisLines",
        property: "x2",
        value: axes.map(axis => axis.x)
      })
      .editGraphics({
        target: "parallelAxisLines",
        property: "y2",
        value: bounds.y + bounds.height
      })
      .editGraphics({
        target: "parallelAxisLines",
        property: "stroke",
        value: AXIS_LINE_COLOR
      })
      .editGraphics({
        target: "parallelAxisLines",
        property: "strokeWidth",
        value: 1.25
      })
      .editGraphics({
        target: "parallelAxisTicks",
        property: "length",
        value: ticks.length
      })
      .editGraphics({
        target: "parallelAxisTicks",
        property: "x1",
        value: ticks.map(tick => tick.x - 4)
      })
      .editGraphics({
        target: "parallelAxisTicks",
        property: "y1",
        value: ticks.map(tick => tick.y)
      })
      .editGraphics({
        target: "parallelAxisTicks",
        property: "x2",
        value: ticks.map(tick => tick.x + 4)
      })
      .editGraphics({
        target: "parallelAxisTicks",
        property: "y2",
        value: ticks.map(tick => tick.y)
      })
      .editGraphics({
        target: "parallelAxisTicks",
        property: "stroke",
        value: DEFAULT_COLORS.mutedText
      })
      .editGraphics({
        target: "parallelAxisTicks",
        property: "strokeWidth",
        value: 1
      })
      .editGraphics({
        target: "parallelAxisLabels",
        property: "length",
        value: ticks.length
      })
      .editGraphics({
        target: "parallelAxisLabels",
        property: "x",
        value: ticks.map(tick => tick.x - 9)
      })
      .editGraphics({
        target: "parallelAxisLabels",
        property: "y",
        value: ticks.map(tick => tick.y)
      })
      .editGraphics({
        target: "parallelAxisLabels",
        property: "text",
        value: ticks.map(tick => tick.text)
      })
      .editGraphics({ target: "parallelAxisLabels", property: "fill", value: AXIS_LINE_COLOR })
      .editGraphics({ target: "parallelAxisLabels", property: "fontSize", value: 11 })
      .editGraphics({ target: "parallelAxisLabels", property: "fontFamily", value: DEFAULT_FONT_FAMILY })
      .editGraphics({ target: "parallelAxisLabels", property: "fontWeight", value: "normal" })
      .editGraphics({ target: "parallelAxisLabels", property: "textAlign", value: "right" })
      .editGraphics({ target: "parallelAxisLabels", property: "textBaseline", value: "middle" })
      .editGraphics({
        target: "parallelAxisTitles",
        property: "length",
        value: axes.length
      })
      .editGraphics({
        target: "parallelAxisTitles",
        property: "x",
        value: axes.map(axis => axis.x)
      })
      .editGraphics({
        target: "parallelAxisTitles",
        property: "y",
        value: bounds.y - 20
      })
      .editGraphics({
        target: "parallelAxisTitles",
        property: "text",
        value: axes.map(axis => axis.title)
      })
      .editGraphics({ target: "parallelAxisTitles", property: "fill", value: AXIS_TITLE_COLOR })
      .editGraphics({ target: "parallelAxisTitles", property: "fontSize", value: 13 })
      .editGraphics({ target: "parallelAxisTitles", property: "fontFamily", value: DEFAULT_FONT_FAMILY })
      .editGraphics({ target: "parallelAxisTitles", property: "fontWeight", value: 600 })
      .editGraphics({ target: "parallelAxisTitles", property: "textAlign", value: "center" })
      .editGraphics({ target: "parallelAxisTitles", property: "textBaseline", value: "middle" });
    return next._withGuideConfig("parallel", "axes", {
      target,
      scales: dimensions.map(dimension => dimension.scale)
    });
  }
);

export const createParallelAxes = action(
  {
    op: "createParallelAxes",
    description: "Create ordinary line and text graphics for Parallel dimensions."
  },
  function (args = {}) {
    validateOptionObject(args, CREATE_OPTIONS, "createParallelAxes");
    const target = resolveTarget(this, args.target);
    const { coordinate, dimensions } = requireParallel(this, target);
    if (args.coordinate !== undefined && args.coordinate !== coordinate.id) {
      throw new Error(
        `Parallel layer "${target}" uses coordinate "${coordinate.id}".`
      );
    }
    for (const id of [
      "parallelAxisLines", "parallelAxisTicks", "parallelAxisLabels",
      "parallelAxisTitles"
    ]) {
      if (this.graphicSpec.objects[id] !== undefined) {
        throw new Error("createParallelAxes requires missing Parallel axes.");
      }
    }
    const placement = resolvePlotGraphicPlacement(this);
    let next = this
      .editSemantic({
        property: "guide.axis.parallel.target",
        value: target
      })
      .editSemantic({
        property: "guide.axis.parallel.coordinate",
        value: coordinate.id
      })
      .editSemantic({
        property: "guide.axis.parallel.scales",
        value: dimensions.map(dimension => dimension.scale)
      })
      .createGraphics({ id: "parallelAxisLines", type: "line", length: 0, ...placement })
      .editGraphics({ target: "parallelAxisLines", property: "stroke", value: AXIS_LINE_COLOR })
      .editGraphics({ target: "parallelAxisLines", property: "strokeWidth", value: 1.25 })
      .createGraphics({ id: "parallelAxisTicks", type: "line", length: 0, ...placement })
      .editGraphics({ target: "parallelAxisTicks", property: "stroke", value: DEFAULT_COLORS.mutedText })
      .editGraphics({ target: "parallelAxisTicks", property: "strokeWidth", value: 1 })
      .createGraphics({ id: "parallelAxisLabels", type: "text", length: 0, ...placement })
      .editGraphics({ target: "parallelAxisLabels", property: "fill", value: AXIS_LINE_COLOR })
      .editGraphics({ target: "parallelAxisLabels", property: "fontSize", value: 11 })
      .editGraphics({ target: "parallelAxisLabels", property: "fontFamily", value: DEFAULT_FONT_FAMILY })
      .editGraphics({ target: "parallelAxisLabels", property: "fontWeight", value: "normal" })
      .editGraphics({ target: "parallelAxisLabels", property: "textAlign", value: "right" })
      .editGraphics({ target: "parallelAxisLabels", property: "textBaseline", value: "middle" })
      .createGraphics({ id: "parallelAxisTitles", type: "text", length: 0, ...placement })
      .editGraphics({ target: "parallelAxisTitles", property: "fill", value: AXIS_TITLE_COLOR })
      .editGraphics({ target: "parallelAxisTitles", property: "fontSize", value: 13 })
      .editGraphics({ target: "parallelAxisTitles", property: "fontFamily", value: DEFAULT_FONT_FAMILY })
      .editGraphics({ target: "parallelAxisTitles", property: "fontWeight", value: 600 })
      .editGraphics({ target: "parallelAxisTitles", property: "textAlign", value: "center" })
      .editGraphics({ target: "parallelAxisTitles", property: "textBaseline", value: "middle" });
    return next.rematerializeParallelAxes({ target });
  }
);

export function registerParallelAxisActions(ProgramClass) {
  ProgramClass.prototype.createParallelAxes = createParallelAxes;
  ProgramClass.prototype.rematerializeParallelAxes = rematerializeParallelAxes;
}
