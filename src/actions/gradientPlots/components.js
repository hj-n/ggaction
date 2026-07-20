import { action } from "../../core/action.js";
import { validateKeys } from "../../core/validation.js";
import { GRADIENT_PROFILE_FIELDS } from "../../grammar/gradientProfile.js";
import { resolveGraphicBounds } from "../../layout/canvas.js";
import { findLayer } from "../../selectors/layers.js";
import { createDensityLegendPaint } from "./paint.js";

const CENTER_OPTIONS = Object.freeze([
  "id", "owner", "data", "category", "categoryType", "coordinate",
  "categoryScale", "measureScale", "orientation", "size", "stroke",
  "strokeWidth"
]);
const LEGEND_OPTIONS = Object.freeze(["owner", "title", "position"]);

export const createGradientPlotCenter = action(
  {
    op: "createGradientPlotCenter",
    description: "Create the optional center rule for one gradient plot."
  },
  function (args = {}) {
    validateKeys(args, CENTER_OPTIONS, "createGradientPlotCenter");
    const categoryAction = args.orientation === "vertical" ? "encodeX" : "encodeY";
    const measureAction = args.orientation === "vertical" ? "encodeY" : "encodeX";
    const spanOrientation = args.orientation === "vertical" ? "horizontal" : "vertical";
    let next = this.createRuleMark({ id: args.id, data: args.data });
    next = next[categoryAction]({
      target: args.id,
      field: args.category,
      fieldType: args.categoryType,
      coordinate: args.coordinate,
      scale: { id: args.categoryScale }
    });
    next = next[measureAction]({
      target: args.id,
      field: GRADIENT_PROFILE_FIELDS.center,
      fieldType: "quantitative",
      coordinate: args.coordinate,
      scale: { id: args.measureScale }
    });
    return next
      .encodeStroke({ target: args.id, value: args.stroke })
      .encodeStrokeWidth({ target: args.id, value: args.strokeWidth })
      .materializeRuleSpan({
        id: args.id,
        orientation: spanOrientation,
        size: args.size
      });
  }
);

function legendIds(owner) {
  return {
    strip: `${owner}DensityLegend`,
    labels: `${owner}DensityLegendLabels`,
    title: `${owner}DensityLegendTitle`
  };
}

function requireLegendOwner(program, owner) {
  const layer = findLayer(program, owner);
  const config = program.markConfigs[owner]?.gradientPlot;
  if (layer === undefined || config?.materialized !== true) {
    throw new Error(`Unknown gradient-plot legend owner "${owner}".`);
  }
  return { layer, config };
}

export const rematerializeGradientPlotLegend = action(
  {
    op: "rematerializeGradientPlotLegend",
    description: "Rematerialize one gradient plot density legend."
  },
  function ({ owner } = {}) {
    const { config } = requireLegendOwner(this, owner);
    const ids = legendIds(owner);
    const bounds = resolveGraphicBounds(this);
    const position = config.guides.legend.position;
    if (position !== "right") {
      throw new Error('Gradient plot density legend currently requires position "right".');
    }
    const x = bounds.x + bounds.width + 50;
    const y = bounds.y + 50;
    const width = 22;
    const height = Math.min(170, Math.max(80, bounds.height - 110));
    return this
      .editGraphics({ target: ids.strip, property: "x", value: x })
      .editGraphics({ target: ids.strip, property: "y", value: y })
      .editGraphics({ target: ids.strip, property: "width", value: width })
      .editGraphics({ target: ids.strip, property: "height", value: height })
      .editGraphics({
        target: ids.strip,
        property: "fill",
        value: createDensityLegendPaint(config.gradient.opacity)
      })
      .editGraphics({ target: ids.strip, property: "stroke", value: "#cbd5e1" })
      .editGraphics({ target: ids.strip, property: "strokeWidth", value: 1 })
      .editGraphics({ target: ids.labels, property: "x", value: x + width + 10 })
      .editGraphics({ target: ids.labels, property: "y", value: [y + height, y] })
      .editGraphics({ target: ids.labels, property: "text", value: ["Low", "High"] })
      .editGraphics({ target: ids.labels, property: "fill", value: "#64748b" })
      .editGraphics({ target: ids.labels, property: "fontSize", value: 11 })
      .editGraphics({ target: ids.labels, property: "fontFamily", value: "sans-serif" })
      .editGraphics({ target: ids.labels, property: "textAlign", value: "left" })
      .editGraphics({ target: ids.labels, property: "textBaseline", value: "middle" })
      .editGraphics({ target: ids.title, property: "x", value: x })
      .editGraphics({ target: ids.title, property: "y", value: y - 18 })
      .editGraphics({ target: ids.title, property: "text", value: config.guides.legend.title })
      .editGraphics({ target: ids.title, property: "fill", value: "#334155" })
      .editGraphics({ target: ids.title, property: "fontSize", value: 12 })
      .editGraphics({ target: ids.title, property: "fontFamily", value: "sans-serif" })
      .editGraphics({ target: ids.title, property: "fontWeight", value: 600 })
      .editGraphics({ target: ids.title, property: "textAlign", value: "left" })
      .editGraphics({ target: ids.title, property: "textBaseline", value: "middle" });
  }
);

export const createGradientPlotLegend = action(
  {
    op: "createGradientPlotLegend",
    description: "Create the neutral density legend owned by one gradient plot."
  },
  function (args = {}) {
    validateKeys(args, LEGEND_OPTIONS, "createGradientPlotLegend");
    requireLegendOwner(this, args.owner);
    if (args.position !== undefined && args.position !== "right") {
      throw new Error('Gradient plot density legend currently requires position "right".');
    }
    if (args.title !== undefined && (typeof args.title !== "string" || args.title.length === 0)) {
      throw new TypeError("Gradient plot density legend title must be a non-empty string.");
    }
    const ids = legendIds(args.owner);
    const densityScale = `${args.owner}Density`;
    let next = this
      .editSemantic({ property: `scale[${densityScale}].type`, value: "sequential" })
      .editSemantic({
        property: `scale[${densityScale}].domain`,
        value: this.markConfigs[args.owner].gradientPlot.intensityDomain
      })
      .editSemantic({
        property: `scale[${densityScale}].range`,
        value: { palette: { name: "greys" } }
      })
      .editSemantic({ property: "guide.legend.color.scale", value: densityScale })
      .editSemantic({
        property: "guide.legend.color.title",
        value: args.title ?? "Relative density"
      })
      .createGraphics({ id: ids.strip, type: "rect", parent: "canvas" })
      .createGraphics({ id: ids.labels, type: "text", length: 2, parent: "canvas" })
      .createGraphics({ id: ids.title, type: "text", parent: "canvas" });
    next = next._withMarkConfig(args.owner, {
      ...next.markConfigs[args.owner],
      gradientPlot: {
        ...next.markConfigs[args.owner].gradientPlot,
        guides: {
          ...next.markConfigs[args.owner].gradientPlot.guides,
          legend: {
            title: args.title ?? "Relative density",
            position: args.position ?? "right"
          }
        }
      }
    });
    return next.rematerializeGradientPlotLegend({ owner: args.owner });
  }
);

export function removeGradientPlotLegend(program, owner) {
  const ids = legendIds(owner);
  let next = program;
  for (const id of Object.values(ids)) {
    if (next.graphicSpec.objects[id] !== undefined) {
      next = next.editGraphics({ target: id, remove: true });
    }
  }
  return next;
}
