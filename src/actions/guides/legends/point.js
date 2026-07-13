import { action } from "../../../core/action.js";
import { validateKeys } from "../../../core/validation.js";
import { mapLinearValues, mapOrdinalValues } from "../../../grammar/scales.js";
import { resolveGraphicBounds } from "../../../layout/canvas.js";

const SERIES_OPTIONS = Object.freeze(["target"]);
const SIZE_OPTIONS = Object.freeze(["target", "count"]);

function resolvePoint(program, requested) {
  const candidates = program.semanticSpec.layers.filter(layer =>
    layer.mark?.type === "point" &&
    layer.encoding?.color?.scale !== undefined &&
    layer.encoding?.shape?.scale !== undefined
  );
  const layer = requested === undefined
    ? candidates.length === 1 ? candidates[0] : undefined
    : candidates.find(item => item.id === requested);
  if (layer === undefined) {
    throw new Error(
      requested === undefined
        ? "Point series legend requires one eligible point mark."
        : `Unknown point series legend target "${requested}".`
    );
  }
  if (layer.encoding.color.field !== layer.encoding.shape.field) {
    throw new Error("Point color and shape legends require the same field.");
  }
  return layer;
}

function requireScale(program, id, type) {
  const scale = program.resolvedScales[id];
  if (scale?.type !== type) {
    throw new Error(`Legend requires resolved ${type} scale "${id}".`);
  }
  return scale;
}

function bounds(program) {
  const value = resolveGraphicBounds(program);
  const canvas = program.graphicSpec.objects.canvas;
  if (
    value === undefined ||
    ![value.x, value.y, value.width, value.height].every(Number.isFinite) ||
    !Number.isFinite(canvas?.properties.width)
  ) {
    throw new Error("Legend layout requires Canvas bounds and width.");
  }
  return value;
}

function styleText(program, id, { title = false } = {}) {
  return program
    .editGraphics({ target: id, property: "fill", value: title ? "#0f172a" : "#334155" })
    .editGraphics({ target: id, property: "fontSize", value: title ? 13 : 12 })
    .editGraphics({ target: id, property: "fontFamily", value: "sans-serif" })
    .editGraphics({ target: id, property: "fontWeight", value: title ? 600 : "normal" })
    .editGraphics({ target: id, property: "textAlign", value: "left" })
    .editGraphics({ target: id, property: "textBaseline", value: "middle" });
}

export const rematerializePointSeriesLegend = action(
  {
    op: "rematerializePointSeriesLegend",
    description: "Rematerialize composite point and line series legend."
  },
  function (args = {}) {
    validateKeys(args, [], "rematerializePointSeriesLegend");
    const config = this.guideConfigs.legend?.point;
    if (config === undefined) {
      throw new Error("Point series legend requires stored configuration.");
    }
    const layer = resolvePoint(this, config.target);
    const color = requireScale(this, layer.encoding.color.scale, "ordinal");
    const shape = requireScale(this, layer.encoding.shape.scale, "ordinal");
    if (JSON.stringify(color.domain) !== JSON.stringify(shape.domain)) {
      throw new Error("Point color and shape scales require one ordered domain.");
    }
    const plot = bounds(this);
    const count = color.domain.length;
    const originX = plot.x + plot.width + 30;
    const itemY = Array.from({ length: count }, (_, index) => plot.y + 56 + index * 34);
    const colors = mapOrdinalValues(color.domain, color.domain, color.range);
    const shapes = mapOrdinalValues(color.domain, shape.domain, shape.range);
    const children = shapes.map((symbol, index) => {
      const area = 64;
      if (symbol === "circle") {
        return {
          type: "circle",
          properties: {
            x: originX + 16,
            y: itemY[index],
            radius: Math.sqrt(area / Math.PI),
            fill: colors[index]
          }
        };
      }
      const side = Math.sqrt(area);
      return {
        type: "rect",
        properties: {
          x: originX + 16 - side / 2,
          y: itemY[index] - side / 2,
          width: side,
          height: side,
          fill: colors[index],
          stroke: colors[index],
          strokeWidth: 0
        }
      };
    });
    let next = this;
    if (config.line) {
      next = next
        .editGraphics({ target: "originLegendLines", property: "length", value: count })
        .editGraphics({ target: "originLegendLines", property: "x1", value: originX })
        .editGraphics({ target: "originLegendLines", property: "y1", value: itemY })
        .editGraphics({ target: "originLegendLines", property: "x2", value: originX + 32 })
        .editGraphics({ target: "originLegendLines", property: "y2", value: itemY })
        .editGraphics({ target: "originLegendLines", property: "stroke", value: colors })
        .editGraphics({ target: "originLegendLines", property: "strokeWidth", value: 3 });
    }
    next = next
      .editGraphics({ target: "originLegendPoints", property: "children", value: children })
      .editGraphics({ target: "originLegendLabels", property: "length", value: count })
      .editGraphics({ target: "originLegendLabels", property: "x", value: originX + 44 })
      .editGraphics({ target: "originLegendLabels", property: "y", value: itemY })
      .editGraphics({ target: "originLegendLabels", property: "text", value: color.domain.map(String) })
      .editGraphics({ target: "originLegendTitle", property: "x", value: originX })
      .editGraphics({ target: "originLegendTitle", property: "y", value: plot.y + 18 })
      .editGraphics({ target: "originLegendTitle", property: "text", value: config.title });
    next = styleText(next, "originLegendLabels");
    return styleText(next, "originLegendTitle", { title: true });
  }
);

export const createPointSeriesLegend = action(
  {
    op: "createPointSeriesLegend",
    description: "Create a color-shape point legend with an optional line layer."
  },
  function (args = {}) {
    validateKeys(args, SERIES_OPTIONS, "createPointSeriesLegend");
    const layer = resolvePoint(this, args.target);
    const color = requireScale(this, layer.encoding.color.scale, "ordinal");
    const line = this.semanticSpec.layers.some(candidate =>
      candidate.mark?.type === "line" &&
      candidate.encoding?.color?.field === layer.encoding.color.field &&
      candidate.encoding.color.scale === layer.encoding.color.scale
    );
    let next = this
      .editSemantic({
        property: "guide.legend.series.channels",
        value: ["color", "shape"]
      })
      .editSemantic({
        property: "guide.legend.series.scales",
        value: [layer.encoding.color.scale, layer.encoding.shape.scale]
      })
      .editSemantic({
        property: "guide.legend.series.title",
        value: layer.encoding.color.field
      })
      ._withLegendConfig("point", {
        target: layer.id,
        title: layer.encoding.color.field,
        domain: color.domain,
        line
      });
    if (line) {
      next = next.createGraphics({ id: "originLegendLines", type: "line", length: color.domain.length });
    }
    return next
      .createGraphics({ id: "originLegendPoints", type: "collection" })
      .createGraphics({ id: "originLegendLabels", type: "text", length: color.domain.length })
      .createGraphics({ id: "originLegendTitle", type: "text" })
      .rematerializePointSeriesLegend();
  }
);

export const rematerializeSizeLegend = action(
  {
    op: "rematerializeSizeLegend",
    description: "Rematerialize a quantitative point-size legend."
  },
  function (args = {}) {
    validateKeys(args, [], "rematerializeSizeLegend");
    const config = this.guideConfigs.legend?.size;
    if (config === undefined) throw new Error("Size legend requires stored configuration.");
    const scale = requireScale(this, config.scale, "linear");
    const plot = bounds(this);
    const originX = plot.x + plot.width + 30;
    const seriesCount = this.guideConfigs.legend?.point?.domain.length ?? 0;
    const titleY = plot.y + 56 + seriesCount * 34 + 22;
    const values = Array.from(
      { length: config.count },
      (_, index) => scale.domain[0] +
        index / (config.count - 1) * (scale.domain[1] - scale.domain[0])
    );
    const areas = mapLinearValues(values, scale.domain, scale.range);
    const itemY = values.map((_, index) => titleY + 34 + index * 40);
    let next = this
      .editGraphics({ target: "sizeLegendSymbols", property: "length", value: values.length })
      .editGraphics({ target: "sizeLegendSymbols", property: "x", value: originX + 16 })
      .editGraphics({ target: "sizeLegendSymbols", property: "y", value: itemY })
      .editGraphics({
        target: "sizeLegendSymbols",
        property: "radius",
        value: areas.map(area => Math.sqrt(area / Math.PI))
      })
      .editGraphics({ target: "sizeLegendSymbols", property: "fill", value: "#94a3b8" })
      .editGraphics({ target: "sizeLegendSymbols", property: "opacity", value: 0.7 })
      .editGraphics({ target: "sizeLegendLabels", property: "length", value: values.length })
      .editGraphics({ target: "sizeLegendLabels", property: "x", value: originX + 44 })
      .editGraphics({ target: "sizeLegendLabels", property: "y", value: itemY })
      .editGraphics({
        target: "sizeLegendLabels",
        property: "text",
        value: values.map(value => String(+value.toPrecision(3)))
      })
      .editGraphics({ target: "sizeLegendTitle", property: "x", value: originX })
      .editGraphics({ target: "sizeLegendTitle", property: "y", value: titleY })
      .editGraphics({ target: "sizeLegendTitle", property: "text", value: config.title });
    next = styleText(next, "sizeLegendLabels");
    return styleText(next, "sizeLegendTitle", { title: true });
  }
);

export const createSizeLegend = action(
  {
    op: "createSizeLegend",
    description: "Create a quantitative equal-area point-size legend."
  },
  function (args = {}) {
    validateKeys(args, SIZE_OPTIONS, "createSizeLegend");
    const layer = resolvePoint(this, args.target);
    const encoding = layer.encoding?.size;
    if (encoding?.scale === undefined) {
      throw new Error(`Point mark "${layer.id}" requires a size encoding.`);
    }
    const scale = requireScale(this, encoding.scale, "linear");
    const count = args.count ?? 5;
    if (!Number.isInteger(count) || count < 2) {
      throw new RangeError("Size legend count must be an integer of at least 2.");
    }
    return this
      .editSemantic({ property: "guide.legend.size.scale", value: encoding.scale })
      .editSemantic({ property: "guide.legend.size.title", value: encoding.field })
      ._withLegendConfig("size", {
        target: layer.id,
        scale: encoding.scale,
        title: encoding.field,
        domain: scale.domain,
        count
      })
      .createGraphics({ id: "sizeLegendSymbols", type: "circle", length: count })
      .createGraphics({ id: "sizeLegendLabels", type: "text", length: count })
      .createGraphics({ id: "sizeLegendTitle", type: "text" })
      .rematerializeSizeLegend();
  }
);

export function registerPointLegendActions(ProgramClass) {
  ProgramClass.prototype.createPointSeriesLegend = createPointSeriesLegend;
  ProgramClass.prototype.rematerializePointSeriesLegend = rematerializePointSeriesLegend;
  ProgramClass.prototype.createSizeLegend = createSizeLegend;
  ProgramClass.prototype.rematerializeSizeLegend = rematerializeSizeLegend;
}
