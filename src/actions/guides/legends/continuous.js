import { action } from "../../../core/action.js";
import { cloneAndFreeze, isPlainObject } from "../../../core/immutable.js";
import { validateKeys } from "../../../core/validation.js";
import { interpolateColorStops } from "../../../grammar/scales/color.js";
import { mapLinearValues } from "../../../grammar/scales.js";
import { formatTimeTick } from "../../../grammar/ticks.js";
import { resolveGraphicBounds } from "../../../layout/canvas.js";
import { DEFAULT_COLORS, DEFAULT_FONT_FAMILY } from
  "../../../theme/defaults.js";

const OPTIONS = Object.freeze([
  "target", "channels", "position", "align", "offset", "title", "count",
  "gradient", "symbol", "labels", "titleStyle", "itemGap", "border",
  "direction", "columns", "titlePosition"
]);
const GRADIENT_OPTIONS = Object.freeze(["length", "thickness"]);
const TEXT_OPTIONS = Object.freeze([
  "offset", "color", "fontSize", "fontFamily", "fontWeight"
]);
const SYMBOL_OPTIONS = Object.freeze([
  "type", "radius", "fill", "stroke", "strokeWidth"
]);
const POSITIONS = Object.freeze(["right", "left", "top", "bottom"]);
const DEFAULT_LABELS = Object.freeze({
  offset: 12,
  color: DEFAULT_COLORS.text,
  fontSize: 12,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontWeight: "normal"
});
const DEFAULT_TITLE = Object.freeze({
  color: DEFAULT_COLORS.text,
  fontSize: 13,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontWeight: 600
});

function validatePositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be positive.`);
  }
  return value;
}

function validateNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be non-negative.`);
  }
  return value;
}

function validateTextOptions(value, label, defaults) {
  if (value === undefined) return { ...defaults };
  if (!isPlainObject(value)) throw new TypeError(`${label} must be a plain object.`);
  validateKeys(value, TEXT_OPTIONS, label);
  const result = { ...defaults, ...value };
  if (Object.hasOwn(result, "offset")) {
    validateNonNegative(result.offset, `${label} offset`);
  }
  validatePositive(result.fontSize, `${label} fontSize`);
  for (const key of ["color", "fontFamily"]) {
    if (typeof result[key] !== "string" || result[key].length === 0) {
      throw new TypeError(`${label} ${key} must be a non-empty string.`);
    }
  }
  if (
    typeof result.fontWeight !== "string" &&
    !Number.isFinite(result.fontWeight)
  ) {
    throw new TypeError(`${label} fontWeight must be a string or finite number.`);
  }
  return result;
}

function normalizeCommon(args, kind) {
  if (!isPlainObject(args)) {
    throw new TypeError("createLegend options must be a plain object.");
  }
  validateKeys(args, OPTIONS, "createLegend");
  const position = args.position ?? "right";
  if (!POSITIONS.includes(position)) {
    throw new Error(`Unsupported legend position "${position}".`);
  }
  const align = args.align ?? "center";
  if (!["left", "center", "right"].includes(align)) {
    throw new Error(`Unsupported legend alignment "${align}".`);
  }
  const count = args.count ?? 5;
  if (!Number.isInteger(count) || count < 2) {
    throw new RangeError("Continuous legend count must be an integer of at least 2.");
  }
  const offset = args.offset ?? 30;
  validateNonNegative(offset, "Legend offset");
  const itemGap = args.itemGap ?? 28;
  validatePositive(itemGap, "Legend itemGap");
  if (args.title !== undefined && (
    typeof args.title !== "string" || args.title.length === 0
  )) {
    throw new TypeError("Legend title must be a non-empty string.");
  }
  if (args.titlePosition !== undefined && args.titlePosition !== "top") {
    throw new Error("Continuous legends currently require top titlePosition.");
  }
  if (args.border !== undefined && args.border !== false) {
    throw new Error("Continuous legend border is not implemented yet.");
  }
  if (kind === "gradient") {
    for (const key of ["symbol", "columns", "direction", "itemGap"]) {
      if (Object.hasOwn(args, key)) {
        throw new Error(`Gradient legend does not accept ${key}.`);
      }
    }
  } else {
    for (const key of ["columns", "direction", "gradient"]) {
      if (Object.hasOwn(args, key)) {
        throw new Error(`Opacity legend does not accept ${key}.`);
      }
    }
  }
  return {
    target: args.target,
    position,
    align,
    offset,
    count,
    title: args.title,
    inferredTitle: args.title === undefined,
    labels: validateTextOptions(args.labels, "createLegend.labels", DEFAULT_LABELS),
    titleStyle: validateTextOptions(
      args.titleStyle,
      "createLegend.titleStyle",
      DEFAULT_TITLE
    ),
    itemGap,
    border: false
  };
}

function resolvePoint(program, requested, channel) {
  const candidates = program.semanticSpec.layers.filter(layer =>
    layer.mark?.type === "point" &&
    layer.encoding?.[channel]?.scale !== undefined
  );
  const layer = requested === undefined
    ? candidates.length === 1 ? candidates[0] : undefined
    : candidates.find(candidate => candidate.id === requested);
  if (layer === undefined) {
    throw new Error(
      requested === undefined
        ? `${channel} legend requires one eligible point mark.`
        : `Unknown ${channel} legend target "${requested}".`
    );
  }
  return layer;
}

function requireResolvedScale(program, id, type) {
  const scale = program.resolvedScales[id];
  if (scale?.type !== type) {
    throw new Error(`Legend requires resolved ${type} scale "${id}".`);
  }
  return scale;
}

function resolveBounds(program) {
  const plot = resolveGraphicBounds(program);
  const canvas = program.graphicSpec.objects.canvas;
  if (
    plot === undefined ||
    ![plot.x, plot.y, plot.width, plot.height].every(Number.isFinite) ||
    canvas?.type !== "canvas" ||
    !Number.isFinite(canvas.properties.width) ||
    !Number.isFinite(canvas.properties.height)
  ) {
    throw new Error("Continuous legend layout requires Canvas bounds.");
  }
  return { plot, canvas: canvas.properties };
}

function sampleValues(domain, count) {
  return Array.from({ length: count }, (_, index) =>
    domain[0] + index / (count - 1) * (domain[1] - domain[0])
  );
}

function formatValues(values, domain, fieldType) {
  return values.map(value => fieldType === "temporal"
    ? formatTimeTick(value, domain)
    : String(+value.toPrecision(3))
  );
}

function styleText(program, id, style, { align = "left" } = {}) {
  return program
    .editGraphics({ target: id, property: "fill", value: style.color })
    .editGraphics({ target: id, property: "fontSize", value: style.fontSize })
    .editGraphics({ target: id, property: "fontFamily", value: style.fontFamily })
    .editGraphics({ target: id, property: "fontWeight", value: style.fontWeight })
    .editGraphics({ target: id, property: "textAlign", value: align })
    .editGraphics({ target: id, property: "textBaseline", value: "middle" });
}

function assertInsideCanvas(items, canvas, label) {
  if (items.some(item =>
    item.x < 0 || item.y < 0 || item.x > canvas.width || item.y > canvas.height
  )) {
    throw new Error(`${label} requires more Canvas margin space.`);
  }
}

function resolveGradientLayout(program, config, scale) {
  const { plot, canvas } = resolveBounds(program);
  const vertical = ["right", "left"].includes(config.position);
  const length = config.gradient.length;
  const thickness = config.gradient.thickness;
  let x;
  let y;
  if (config.position === "right") {
    x = plot.x + plot.width + config.offset;
    y = plot.y + 46;
  } else if (config.position === "left") {
    x = plot.x - config.offset - thickness;
    y = plot.y + 46;
  } else {
    x = config.align === "left" ? plot.x
      : config.align === "right" ? plot.x + plot.width - length
        : plot.x + (plot.width - length) / 2;
    y = config.position === "top"
      ? plot.y - config.offset - thickness
      : plot.y + plot.height + config.offset;
  }
  const title = vertical
    ? { x, y: plot.y + 20, align: "left" }
    : { x: x + length / 2, y: y - 20, align: "center" };
  const values = sampleValues(scale.domain, config.count);
  const fractions = values.map((_, index) => index / (values.length - 1));
  const labelOffset = config.labels.offset;
  const labels = vertical
    ? fractions.map(fraction => ({
        x: config.position === "right"
          ? x + thickness + labelOffset
          : x - labelOffset,
        y: y + length * (1 - fraction),
        align: config.position === "right" ? "left" : "right"
      }))
    : fractions.map(fraction => ({
        x: x + length * fraction,
        y: config.position === "top"
          ? y - labelOffset
          : y + thickness + labelOffset,
        align: "center"
      }));
  const ticks = vertical
    ? labels.map(label => ({
        x1: config.position === "right" ? x + thickness : x,
        y1: label.y,
        x2: config.position === "right" ? x + thickness + 6 : x - 6,
        y2: label.y
      }))
    : labels.map(label => ({
        x1: label.x,
        y1: config.position === "top" ? y : y + thickness,
        x2: label.x,
        y2: config.position === "top" ? y - 6 : y + thickness + 6
      }));
  assertInsideCanvas([title, ...labels, ...ticks.flatMap(tick => [
    { x: tick.x1, y: tick.y1 }, { x: tick.x2, y: tick.y2 }
  ])], canvas, "Gradient legend layout");
  if (x < 0 || y < 0 || x + (vertical ? thickness : length) > canvas.width ||
      y + (vertical ? length : thickness) > canvas.height) {
    throw new Error("Gradient legend layout requires more Canvas margin space.");
  }
  return { vertical, x, y, length, thickness, values, labels, ticks, title };
}

function resolveGradientConfig(program, config) {
  const layer = resolvePoint(program, config.target, "color");
  const encoding = layer.encoding.color;
  if (!["quantitative", "temporal"].includes(encoding.fieldType)) {
    throw new Error("Gradient legend requires quantitative or temporal color.");
  }
  const scale = requireResolvedScale(program, encoding.scale, "sequential");
  return {
    layer,
    encoding,
    scale,
    config: {
      ...config,
      target: layer.id,
      scale: encoding.scale,
      fieldType: encoding.fieldType,
      title: config.inferredTitle ? encoding.field : config.title,
      domain: scale.domain
    }
  };
}

export const rematerializeGradientLegend = action(
  { op: "rematerializeGradientLegend", description: "Rematerialize a continuous color gradient legend." },
  function (args = {}) {
    validateKeys(args, [], "rematerializeGradientLegend");
    const stored = this.guideConfigs.legend?.gradient;
    if (stored === undefined) {
      throw new Error("Gradient legend requires stored configuration.");
    }
    const { scale, encoding, config } = resolveGradientConfig(this, stored);
    const layout = resolveGradientLayout(this, config, scale);
    const stripCount = 60;
    const stripSize = layout.length / stripCount;
    const strips = Array.from({ length: stripCount }, (_, index) => {
      const fraction = (index + 0.5) / stripCount;
      const color = interpolateColorStops(
        scale.range,
        layout.vertical ? 1 - fraction : fraction,
        scale.interpolate
      );
      return {
        x: layout.x + (layout.vertical ? 0 : index * stripSize),
        y: layout.y + (layout.vertical ? index * stripSize : 0),
        width: layout.vertical ? layout.thickness : stripSize,
        height: layout.vertical ? stripSize : layout.thickness,
        fill: color,
        stroke: color,
        strokeWidth: 0
      };
    });
    let next = this
      .editSemantic({ property: "guide.legend.color.scale", value: encoding.scale })
      .editSemantic({ property: "guide.legend.color.title", value: config.title })
      ._withLegendConfig("gradient", config)
      .editGraphics({ target: "colorGradientStrips", property: "length", value: strips.length });
    for (const property of ["x", "y", "width", "height", "fill", "stroke", "strokeWidth"]) {
      next = next.editGraphics({
        target: "colorGradientStrips",
        property,
        value: strips.map(strip => strip[property])
      });
    }
    next = next
      .editGraphics({ target: "colorGradientTicks", property: "length", value: layout.ticks.length });
    for (const property of ["x1", "y1", "x2", "y2"]) {
      next = next.editGraphics({
        target: "colorGradientTicks",
        property,
        value: layout.ticks.map(tick => tick[property])
      });
    }
    next = next
      .editGraphics({ target: "colorGradientTicks", property: "stroke", value: DEFAULT_COLORS.mutedText })
      .editGraphics({ target: "colorGradientTicks", property: "strokeWidth", value: 1 })
      .editGraphics({ target: "colorGradientLabels", property: "length", value: layout.labels.length })
      .editGraphics({ target: "colorGradientLabels", property: "x", value: layout.labels.map(label => label.x) })
      .editGraphics({ target: "colorGradientLabels", property: "y", value: layout.labels.map(label => label.y) })
      .editGraphics({
        target: "colorGradientLabels",
        property: "text",
        value: formatValues(layout.values, scale.domain, config.fieldType)
      });
    next = styleText(next, "colorGradientLabels", config.labels, {
      align: layout.labels[0].align
    })
      .editGraphics({ target: "colorGradientTitle", property: "x", value: layout.title.x })
      .editGraphics({ target: "colorGradientTitle", property: "y", value: layout.title.y })
      .editGraphics({ target: "colorGradientTitle", property: "text", value: config.title });
    return styleText(next, "colorGradientTitle", config.titleStyle, {
      align: layout.title.align
    });
  }
);

export const createGradientLegend = action(
  { op: "createGradientLegend", description: "Create a continuous color gradient legend." },
  function (args = {}) {
    const config = normalizeCommon(args, "gradient");
    if (args.channels !== undefined && (
      !Array.isArray(args.channels) ||
      args.channels.length !== 1 ||
      args.channels[0] !== "color"
    )) {
      throw new Error('Gradient legend requires channels: ["color"].');
    }
    if (args.gradient !== undefined && !isPlainObject(args.gradient)) {
      throw new TypeError("createLegend.gradient must be a plain object.");
    }
    validateKeys(args.gradient ?? {}, GRADIENT_OPTIONS, "createLegend.gradient");
    config.gradient = {
      length: args.gradient?.length ?? 120,
      thickness: args.gradient?.thickness ?? 12
    };
    validatePositive(config.gradient.length, "Gradient length");
    validatePositive(config.gradient.thickness, "Gradient thickness");
    const resolved = resolveGradientConfig(this, config);
    resolveGradientLayout(this, resolved.config, resolved.scale);
    if (this.graphicSpec.objects.colorGradientStrips !== undefined) {
      throw new Error("createGradientLegend requires a missing gradient legend.");
    }
    return this
      .editSemantic({ property: "guide.legend.color.scale", value: resolved.encoding.scale })
      .editSemantic({ property: "guide.legend.color.title", value: resolved.config.title })
      ._withLegendConfig("gradient", resolved.config)
      .createGraphics({ id: "colorGradientStrips", type: "rect", length: 0, after: resolved.layer.id })
      .createGraphics({ id: "colorGradientTicks", type: "line", length: 0 })
      .createGraphics({ id: "colorGradientLabels", type: "text", length: 0 })
      .createGraphics({ id: "colorGradientTitle", type: "text" })
      .rematerializeGradientLegend();
  }
);

function normalizeOpacitySymbol(value) {
  if (value === undefined) {
    return {
      type: "point",
      radius: 7,
      fill: DEFAULT_COLORS.mark
    };
  }
  if (!isPlainObject(value)) {
    throw new TypeError("createLegend.symbol must be one point recipe object.");
  }
  validateKeys(value, SYMBOL_OPTIONS, "createLegend.symbol");
  const symbol = {
    type: "point",
    radius: 7,
    fill: DEFAULT_COLORS.mark,
    ...value
  };
  if (symbol.type !== "point") {
    throw new Error("Opacity legend symbol must have type point.");
  }
  validatePositive(symbol.radius, "Opacity legend symbol radius");
  if (typeof symbol.fill !== "string" || symbol.fill.length === 0) {
    throw new TypeError("Opacity legend symbol fill must be non-empty.");
  }
  if (symbol.stroke !== undefined && (
    typeof symbol.stroke !== "string" || symbol.stroke.length === 0
  )) {
    throw new TypeError("Opacity legend symbol stroke must be non-empty.");
  }
  if (symbol.strokeWidth !== undefined) {
    validateNonNegative(symbol.strokeWidth, "Opacity legend symbol strokeWidth");
  }
  return symbol;
}

function resolveOpacityConfig(program, config) {
  const layer = resolvePoint(program, config.target, "opacity");
  const encoding = layer.encoding.opacity;
  if (encoding.fieldType !== "quantitative") {
    throw new Error("Opacity legend requires quantitative field opacity.");
  }
  const scale = requireResolvedScale(program, encoding.scale, "linear");
  return {
    layer,
    encoding,
    scale,
    config: {
      ...config,
      target: layer.id,
      scale: encoding.scale,
      title: config.inferredTitle ? encoding.field : config.title,
      domain: scale.domain
    }
  };
}

function resolveOpacityLayout(program, config, scale) {
  const { plot, canvas } = resolveBounds(program);
  const vertical = ["right", "left"].includes(config.position);
  const values = sampleValues(scale.domain, config.count);
  const radius = config.symbol.radius;
  let symbols;
  let labels;
  let title;
  if (vertical) {
    const baseX = config.position === "right"
      ? plot.x + plot.width + config.offset
      : plot.x - config.offset;
    const y = values.map((_, index) => plot.y + 46 + index * config.itemGap);
    symbols = y.map(itemY => ({
      x: config.position === "right" ? baseX + radius : baseX - radius,
      y: itemY
    }));
    labels = y.map(itemY => ({
      x: config.position === "right"
        ? baseX + radius * 2 + config.labels.offset - 2
        : baseX - radius * 2 - config.labels.offset + 2,
      y: itemY,
      align: config.position === "right" ? "left" : "right"
    }));
    title = {
      x: config.position === "right" ? baseX : baseX - radius * 2,
      y: plot.y + 20,
      align: config.position === "right" ? "left" : "right"
    };
  } else {
    const width = (values.length - 1) * Math.max(56, config.itemGap * 2);
    const startX = config.align === "left" ? plot.x
      : config.align === "right" ? plot.x + plot.width - width
        : plot.x + (plot.width - width) / 2;
    const y = config.position === "top"
      ? plot.y - config.offset - radius
      : plot.y + plot.height + config.offset + radius;
    symbols = values.map((_, index) => ({
      x: startX + index * width / (values.length - 1), y
    }));
    labels = symbols.map(symbol => ({
      x: symbol.x,
      y: config.position === "top"
        ? symbol.y - radius - config.labels.offset
        : symbol.y + radius + config.labels.offset,
      align: "center"
    }));
    title = { x: startX + width / 2, y: y - 26, align: "center" };
  }
  assertInsideCanvas([title, ...symbols, ...labels], canvas, "Opacity legend layout");
  return { values, symbols, labels, title };
}

export const rematerializeOpacityLegend = action(
  { op: "rematerializeOpacityLegend", description: "Rematerialize a field-opacity sample legend." },
  function (args = {}) {
    validateKeys(args, [], "rematerializeOpacityLegend");
    const stored = this.guideConfigs.legend?.opacity;
    if (stored === undefined) {
      throw new Error("Opacity legend requires stored configuration.");
    }
    const { encoding, scale, config } = resolveOpacityConfig(this, stored);
    const layout = resolveOpacityLayout(this, config, scale);
    const opacities = mapLinearValues(layout.values, scale.domain, scale.range, {
      clamp: scale.clamp ?? false
    });
    let next = this
      .editSemantic({ property: "guide.legend.opacity.scale", value: encoding.scale })
      .editSemantic({ property: "guide.legend.opacity.title", value: config.title })
      ._withLegendConfig("opacity", config)
      .editGraphics({ target: "opacityLegendSymbols", property: "length", value: layout.values.length })
      .editGraphics({ target: "opacityLegendSymbols", property: "x", value: layout.symbols.map(symbol => symbol.x) })
      .editGraphics({ target: "opacityLegendSymbols", property: "y", value: layout.symbols.map(symbol => symbol.y) })
      .editGraphics({ target: "opacityLegendSymbols", property: "radius", value: config.symbol.radius })
      .editGraphics({ target: "opacityLegendSymbols", property: "fill", value: config.symbol.fill })
      .editGraphics({ target: "opacityLegendSymbols", property: "opacity", value: opacities })
      .editGraphics({ target: "opacityLegendLabels", property: "length", value: layout.values.length })
      .editGraphics({ target: "opacityLegendLabels", property: "x", value: layout.labels.map(label => label.x) })
      .editGraphics({ target: "opacityLegendLabels", property: "y", value: layout.labels.map(label => label.y) })
      .editGraphics({
        target: "opacityLegendLabels",
        property: "text",
        value: formatValues(layout.values, scale.domain, "quantitative")
      });
    if (config.symbol.stroke !== undefined) {
      next = next.editGraphics({
        target: "opacityLegendSymbols",
        property: "stroke",
        value: config.symbol.stroke
      });
    }
    if (config.symbol.strokeWidth !== undefined) {
      next = next.editGraphics({
        target: "opacityLegendSymbols",
        property: "strokeWidth",
        value: config.symbol.strokeWidth
      });
    }
    next = styleText(next, "opacityLegendLabels", config.labels, {
      align: layout.labels[0].align
    })
      .editGraphics({ target: "opacityLegendTitle", property: "x", value: layout.title.x })
      .editGraphics({ target: "opacityLegendTitle", property: "y", value: layout.title.y })
      .editGraphics({ target: "opacityLegendTitle", property: "text", value: config.title });
    return styleText(next, "opacityLegendTitle", config.titleStyle, {
      align: layout.title.align
    });
  }
);

export const createOpacityLegend = action(
  { op: "createOpacityLegend", description: "Create a field-opacity sample legend." },
  function (args = {}) {
    const config = normalizeCommon(args, "opacity");
    if (args.channels !== undefined && (
      !Array.isArray(args.channels) ||
      args.channels.length !== 1 ||
      args.channels[0] !== "opacity"
    )) {
      throw new Error('Opacity legend requires channels: ["opacity"].');
    }
    config.symbol = normalizeOpacitySymbol(args.symbol);
    const resolved = resolveOpacityConfig(this, config);
    resolveOpacityLayout(this, resolved.config, resolved.scale);
    if (this.graphicSpec.objects.opacityLegendSymbols !== undefined) {
      throw new Error("createOpacityLegend requires a missing opacity legend.");
    }
    return this
      .editSemantic({ property: "guide.legend.opacity.scale", value: resolved.encoding.scale })
      .editSemantic({ property: "guide.legend.opacity.title", value: resolved.config.title })
      ._withLegendConfig("opacity", resolved.config)
      .createGraphics({ id: "opacityLegendSymbols", type: "circle", length: 0, after: resolved.layer.id })
      .createGraphics({ id: "opacityLegendLabels", type: "text", length: 0 })
      .createGraphics({ id: "opacityLegendTitle", type: "text" })
      .rematerializeOpacityLegend();
  }
);

export const removeOpacityLegend = action(
  { op: "removeOpacityLegend", description: "Remove a field-opacity legend after switching to constant opacity." },
  function (args = {}) {
    validateKeys(args, [], "removeOpacityLegend");
    if (this.guideConfigs.legend?.opacity === undefined) return this;
    const { opacity: semanticOpacity, ...semanticLegend } =
      this.semanticSpec.guides.legend ?? {};
    const { opacity: configOpacity, ...legendConfigs } =
      this.guideConfigs.legend ?? {};
    void semanticOpacity;
    void configOpacity;
    const removed = new Set([
      "opacityLegendSymbols", "opacityLegendLabels", "opacityLegendTitle"
    ]);
    return this._clone({
      semanticSpec: cloneAndFreeze({
        ...this.semanticSpec,
        guides: {
          ...this.semanticSpec.guides,
          legend: semanticLegend
        }
      }),
      graphicSpec: cloneAndFreeze({
        objects: Object.fromEntries(
          Object.entries(this.graphicSpec.objects).filter(([id]) => !removed.has(id))
        ),
        order: this.graphicSpec.order.filter(id => !removed.has(id))
      }),
      materializationConfigs: cloneAndFreeze({
        ...this.materializationConfigs,
        guides: {
          ...this.materializationConfigs.guides,
          legend: legendConfigs
        }
      })
    });
  }
);

export function registerContinuousLegendActions(ProgramClass) {
  ProgramClass.prototype.createGradientLegend = createGradientLegend;
  ProgramClass.prototype.rematerializeGradientLegend = rematerializeGradientLegend;
  ProgramClass.prototype.createOpacityLegend = createOpacityLegend;
  ProgramClass.prototype.rematerializeOpacityLegend = rematerializeOpacityLegend;
  ProgramClass.prototype.removeOpacityLegend = removeOpacityLegend;
}
