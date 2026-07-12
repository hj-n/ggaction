import { action } from "../../../core/action.js";
import { validateUserId } from "../../../core/identifiers.js";
import { isPlainObject } from "../../../core/immutable.js";
import { mapOrdinalValues } from "../../../core/scale.js";

const CHANNELS = Object.freeze(["color", "strokeDash"]);
const OPTIONS = Object.freeze([
  "target",
  "channels",
  "position",
  "title",
  "symbol",
  "labels",
  "titleStyle",
  "itemGap",
  "border"
]);
const SYMBOL_OPTIONS = Object.freeze(["length", "lineWidth"]);
const TEXT_OPTIONS = Object.freeze([
  "offset",
  "color",
  "fontSize",
  "fontFamily",
  "fontWeight"
]);
const TITLE_OPTIONS = Object.freeze([
  "color",
  "fontSize",
  "fontFamily",
  "fontWeight"
]);
const BORDER_OPTIONS = Object.freeze([
  "color",
  "lineWidth",
  "padding",
  "background"
]);
const DEFAULTS = Object.freeze({
  position: "right",
  symbol: Object.freeze({ length: 32, lineWidth: 2 }),
  labels: Object.freeze({
    offset: 10,
    color: "#334155",
    fontSize: 12,
    fontFamily: "sans-serif",
    fontWeight: "normal"
  }),
  titleStyle: Object.freeze({
    color: "#334155",
    fontSize: 13,
    fontFamily: "sans-serif",
    fontWeight: 600
  }),
  itemGap: 28,
  border: Object.freeze({
    color: "#cbd5e1",
    lineWidth: 1,
    padding: 12,
    background: "transparent"
  })
});

function validateKeys(value, supported, label) {
  for (const key of Object.keys(value)) {
    if (!supported.includes(key)) {
      throw new Error(`Unknown ${label} option "${key}".`);
    }
  }
}

function validateNested(value, supported, label) {
  if (!isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  validateKeys(value, supported, label);
}

function validateString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

function validateNonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative finite number.`);
  }
  return value;
}

function validatePositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive finite number.`);
  }
  return value;
}

function normalizeBorder(border) {
  if (border === undefined || border === false) return false;
  if (border !== true) {
    validateNested(border, BORDER_OPTIONS, "createLegend.border");
  }
  const value = border === true ? {} : border;
  const normalized = { ...DEFAULTS.border, ...value };
  validateString(normalized.color, "Legend border color");
  validateString(normalized.background, "Legend border background");
  validateNonNegative(normalized.lineWidth, "Legend border lineWidth");
  validateNonNegative(normalized.padding, "Legend border padding");
  return normalized;
}

function normalizeOptions(args) {
  validateKeys(args, OPTIONS, "createLegend");
  if (Object.hasOwn(args, "symbol")) {
    validateNested(args.symbol, SYMBOL_OPTIONS, "createLegend.symbol");
  }
  if (Object.hasOwn(args, "labels")) {
    validateNested(args.labels, TEXT_OPTIONS, "createLegend.labels");
  }
  if (Object.hasOwn(args, "titleStyle")) {
    validateNested(
      args.titleStyle,
      TITLE_OPTIONS,
      "createLegend.titleStyle"
    );
  }

  const symbol = { ...DEFAULTS.symbol, ...(args.symbol ?? {}) };
  const labels = { ...DEFAULTS.labels, ...(args.labels ?? {}) };
  const titleStyle = { ...DEFAULTS.titleStyle, ...(args.titleStyle ?? {}) };
  const position = args.position ?? DEFAULTS.position;
  const itemGap = args.itemGap ?? DEFAULTS.itemGap;

  if (position !== "right") {
    throw new Error(`Unsupported legend position "${position}".`);
  }
  validatePositive(symbol.length, "Legend symbol length");
  validateNonNegative(symbol.lineWidth, "Legend symbol lineWidth");
  validateNonNegative(labels.offset, "Legend label offset");
  validateString(labels.color, "Legend label color");
  validatePositive(labels.fontSize, "Legend label fontSize");
  validateString(labels.fontFamily, "Legend label fontFamily");
  if (
    typeof labels.fontWeight !== "string" &&
    !Number.isFinite(labels.fontWeight)
  ) {
    throw new TypeError("Legend label fontWeight must be a string or number.");
  }
  validateString(titleStyle.color, "Legend title color");
  validatePositive(titleStyle.fontSize, "Legend title fontSize");
  validateString(titleStyle.fontFamily, "Legend title fontFamily");
  if (
    typeof titleStyle.fontWeight !== "string" &&
    !Number.isFinite(titleStyle.fontWeight)
  ) {
    throw new TypeError("Legend title fontWeight must be a string or number.");
  }
  validatePositive(itemGap, "Legend itemGap");

  return {
    target: args.target,
    channels: args.channels,
    position,
    title: args.title,
    symbol,
    labels,
    titleStyle,
    itemGap,
    border: normalizeBorder(args.border)
  };
}

function hasSeriesEncoding(layer) {
  return layer?.mark?.type === "line" && CHANNELS.some(
    channel => layer.encoding?.[channel]?.scale !== undefined
  );
}

function resolveTarget(program, requested) {
  if (requested !== undefined) {
    const id = validateUserId(requested, "Legend target id");
    const layer = program.semanticSpec.layers.find(item => item.id === id);
    if (!hasSeriesEncoding(layer)) {
      throw new Error(`Unknown line series legend target "${id}".`);
    }
    return layer;
  }

  const current = program.semanticSpec.layers.find(
    layer => layer.id === program.context.currentMark
  );
  if (hasSeriesEncoding(current)) return current;

  const candidates = program.semanticSpec.layers.filter(hasSeriesEncoding);
  if (candidates.length !== 1) {
    throw new Error(
      "createLegend requires target when the line series mark is ambiguous."
    );
  }
  return candidates[0];
}

function sameDomain(left, right) {
  return left.length === right.length && left.every(
    (value, index) => value === right[index]
  );
}

function resolveSharedDomain(program, scales) {
  const resolved = scales.map(id => {
    const semantic = program.semanticSpec.scales.find(scale => scale.id === id);
    const concrete = program.resolvedScales[id];
    if (semantic?.type !== "ordinal" || concrete?.type !== "ordinal") {
      throw new Error(`Legend requires resolved ordinal scale "${id}".`);
    }
    if (!Array.isArray(concrete.domain) || concrete.domain.length === 0) {
      throw new Error(`Legend scale "${id}" requires a non-empty domain.`);
    }
    return concrete;
  });

  if (
    resolved.slice(1).some(
      scale => !sameDomain(resolved[0].domain, scale.domain)
    )
  ) {
    throw new Error(
      "Combined legend scales must have identical ordered domains."
    );
  }

  return resolved[0].domain;
}

function resolveSemantic(program, layer, requestedChannels, requestedTitle) {
  const channels = requestedChannels ?? CHANNELS.filter(
    channel => layer.encoding?.[channel]?.scale !== undefined
  );

  if (
    !Array.isArray(channels) ||
    channels.length === 0 ||
    !channels.every(channel => CHANNELS.includes(channel)) ||
    new Set(channels).size !== channels.length
  ) {
    throw new Error(
      "Legend channels must be a non-empty unique color/strokeDash array."
    );
  }

  const encodings = channels.map(channel => {
    const encoding = layer.encoding?.[channel];
    if (encoding?.scale === undefined) {
      throw new Error(`Legend target does not encode channel "${channel}".`);
    }
    return { channel, encoding };
  });
  const fields = new Set(encodings.map(item => item.encoding.field));
  if (fields.size !== 1) {
    throw new Error("Combined legend channels must encode the same field.");
  }

  const scales = encodings.map(item => item.encoding.scale);
  const domain = resolveSharedDomain(program, scales);

  const field = [...fields][0];
  const title = validateString(
    requestedTitle ?? field,
    "Legend title"
  );
  return { channels, scales, field, title, domain };
}

function resolveCurrentDomain(program, config) {
  const guide = program.semanticSpec.guides.legend?.series;
  if (guide === undefined) {
    throw new Error("Legend rematerialization requires semantic series guide state.");
  }
  const layer = program.semanticSpec.layers.find(
    item => item.id === config.target
  );
  if (layer === undefined) {
    throw new Error(`Unknown line series legend target "${config.target}".`);
  }
  const current = resolveSemantic(
    program,
    layer,
    guide.channels,
    guide.title
  );
  if (!sameDomain(current.scales, guide.scales)) {
    throw new Error("Legend encodings no longer use the stored guide scales.");
  }
  return current.domain;
}

function requireConfig(program) {
  const config = program.guideConfigs.legend?.series;
  if (config === undefined) {
    throw new Error("Legend component requires series legend configuration.");
  }
  return config;
}

function resolveLayout(program, config) {
  const bounds = program.context.currentGraphicBounds;
  const canvas = program.graphicSpec.objects.canvas;
  if (
    bounds === undefined ||
    ![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite) ||
    canvas?.type !== "canvas" ||
    !Number.isFinite(canvas.properties.width)
  ) {
    throw new Error("Legend layout requires Canvas bounds and width.");
  }

  const count = config.domain.length;
  const symbolX1 = bounds.x + bounds.width + 30;
  const symbolX2 = symbolX1 + config.symbol.length;
  const labelX = symbolX2 + config.labels.offset;
  const titleY = bounds.y + 20;
  const itemY = Array.from(
    { length: count },
    (_, index) => bounds.y + 52 + index * config.itemGap
  );

  if (labelX >= canvas.properties.width) {
    throw new Error("Legend layout requires more right-margin space.");
  }

  let background;
  if (config.border !== false) {
    const x = symbolX1 - config.border.padding;
    const y = bounds.y + 8;
    const width = canvas.properties.width - x - config.border.padding;
    const height = itemY.at(-1) - y + config.border.padding;
    if (width <= 0 || height <= 0) {
      throw new Error("Legend background requires positive width and height.");
    }
    background = { x, y, width, height };
  }

  return {
    symbolX1,
    symbolX2,
    labelX,
    titleX: symbolX1,
    titleY,
    itemY,
    background
  };
}

function resolveAppearance(program, config) {
  const guide = program.semanticSpec.guides.legend?.series;
  if (guide === undefined) {
    throw new Error("Legend appearance requires semantic series guide state.");
  }
  let strokes = config.domain.map(() => "#4c78a8");
  let dashes = config.domain.map(() => []);

  for (let index = 0; index < guide.channels.length; index += 1) {
    const channel = guide.channels[index];
    const scale = program.resolvedScales[guide.scales[index]];
    const values = mapOrdinalValues(config.domain, scale.domain, scale.range);
    if (channel === "color") strokes = values;
    if (channel === "strokeDash") dashes = values;
  }
  return { strokes, dashes };
}

function noOptions(args, operation) {
  if (Object.keys(args).length > 0) {
    throw new Error(`${operation} does not accept options.`);
  }
}

const editLegendSymbols = action(
  { op: "editLegendSymbols", description: "Rematerialize legend line symbols." },
  function (args = {}) {
    noOptions(args, "editLegendSymbols");
    const config = requireConfig(this);
    const graphic = this.graphicSpec.objects.seriesLegendSymbols;
    if (graphic?.type !== "line") {
      throw new Error("editLegendSymbols requires existing legend symbols.");
    }
    const layout = resolveLayout(this, config);
    const appearance = resolveAppearance(this, config);
    return this
      .editGraphics({ target: "seriesLegendSymbols", property: "length", value: config.domain.length })
      .editGraphics({ target: "seriesLegendSymbols", property: "x1", value: layout.symbolX1 })
      .editGraphics({ target: "seriesLegendSymbols", property: "y1", value: layout.itemY })
      .editGraphics({ target: "seriesLegendSymbols", property: "x2", value: layout.symbolX2 })
      .editGraphics({ target: "seriesLegendSymbols", property: "y2", value: layout.itemY })
      .editGraphics({ target: "seriesLegendSymbols", property: "stroke", value: appearance.strokes })
      .editGraphics({ target: "seriesLegendSymbols", property: "strokeWidth", value: config.symbol.lineWidth })
      .editGraphics({ target: "seriesLegendSymbols", property: "strokeDash", value: appearance.dashes });
  }
);

const createLegendSymbols = action(
  { op: "createLegendSymbols", description: "Create legend line symbols." },
  function (args = {}) {
    noOptions(args, "createLegendSymbols");
    const config = requireConfig(this);
    if (this.graphicSpec.objects.seriesLegendSymbols !== undefined) {
      throw new Error("createLegendSymbols requires missing legend symbols.");
    }
    return this
      .createGraphics({ id: "seriesLegendSymbols", type: "line", length: config.domain.length })
      .editLegendSymbols();
  }
);

const editLegendLabels = action(
  { op: "editLegendLabels", description: "Rematerialize legend labels." },
  function (args = {}) {
    noOptions(args, "editLegendLabels");
    const config = requireConfig(this);
    if (this.graphicSpec.objects.seriesLegendLabels?.type !== "text") {
      throw new Error("editLegendLabels requires existing legend labels.");
    }
    const layout = resolveLayout(this, config);
    return this
      .editGraphics({ target: "seriesLegendLabels", property: "length", value: config.domain.length })
      .editGraphics({ target: "seriesLegendLabels", property: "x", value: layout.labelX })
      .editGraphics({ target: "seriesLegendLabels", property: "y", value: layout.itemY })
      .editGraphics({ target: "seriesLegendLabels", property: "text", value: config.domain.map(String) })
      .editGraphics({ target: "seriesLegendLabels", property: "fill", value: config.labels.color })
      .editGraphics({ target: "seriesLegendLabels", property: "fontSize", value: config.labels.fontSize })
      .editGraphics({ target: "seriesLegendLabels", property: "fontFamily", value: config.labels.fontFamily })
      .editGraphics({ target: "seriesLegendLabels", property: "fontWeight", value: config.labels.fontWeight })
      .editGraphics({ target: "seriesLegendLabels", property: "textAlign", value: "left" })
      .editGraphics({ target: "seriesLegendLabels", property: "textBaseline", value: "middle" });
  }
);

const createLegendLabels = action(
  { op: "createLegendLabels", description: "Create legend text labels." },
  function (args = {}) {
    noOptions(args, "createLegendLabels");
    const config = requireConfig(this);
    if (this.graphicSpec.objects.seriesLegendLabels !== undefined) {
      throw new Error("createLegendLabels requires missing legend labels.");
    }
    return this
      .createGraphics({ id: "seriesLegendLabels", type: "text", length: config.domain.length })
      .editLegendLabels();
  }
);

const editLegendTitle = action(
  { op: "editLegendTitle", description: "Rematerialize the legend title." },
  function (args = {}) {
    noOptions(args, "editLegendTitle");
    const config = requireConfig(this);
    if (this.graphicSpec.objects.seriesLegendTitle?.type !== "text") {
      throw new Error("editLegendTitle requires an existing legend title.");
    }
    const layout = resolveLayout(this, config);
    return this
      .editGraphics({ target: "seriesLegendTitle", property: "x", value: layout.titleX })
      .editGraphics({ target: "seriesLegendTitle", property: "y", value: layout.titleY })
      .editGraphics({ target: "seriesLegendTitle", property: "text", value: config.title })
      .editGraphics({ target: "seriesLegendTitle", property: "fill", value: config.titleStyle.color })
      .editGraphics({ target: "seriesLegendTitle", property: "fontSize", value: config.titleStyle.fontSize })
      .editGraphics({ target: "seriesLegendTitle", property: "fontFamily", value: config.titleStyle.fontFamily })
      .editGraphics({ target: "seriesLegendTitle", property: "fontWeight", value: config.titleStyle.fontWeight })
      .editGraphics({ target: "seriesLegendTitle", property: "textAlign", value: "left" })
      .editGraphics({ target: "seriesLegendTitle", property: "textBaseline", value: "middle" });
  }
);

const createLegendTitle = action(
  { op: "createLegendTitle", description: "Create the legend title." },
  function (args = {}) {
    noOptions(args, "createLegendTitle");
    requireConfig(this);
    if (this.graphicSpec.objects.seriesLegendTitle !== undefined) {
      throw new Error("createLegendTitle requires a missing legend title.");
    }
    return this
      .createGraphics({ id: "seriesLegendTitle", type: "text" })
      .editLegendTitle();
  }
);

const editLegendBackground = action(
  { op: "editLegendBackground", description: "Rematerialize the legend background." },
  function (args = {}) {
    noOptions(args, "editLegendBackground");
    const config = requireConfig(this);
    if (config.border === false) {
      throw new Error("editLegendBackground requires border configuration.");
    }
    if (this.graphicSpec.objects.seriesLegendBackground?.type !== "rect") {
      throw new Error("editLegendBackground requires an existing background.");
    }
    const layout = resolveLayout(this, config).background;
    return this
      .editGraphics({ target: "seriesLegendBackground", property: "x", value: layout.x })
      .editGraphics({ target: "seriesLegendBackground", property: "y", value: layout.y })
      .editGraphics({ target: "seriesLegendBackground", property: "width", value: layout.width })
      .editGraphics({ target: "seriesLegendBackground", property: "height", value: layout.height })
      .editGraphics({ target: "seriesLegendBackground", property: "fill", value: config.border.background })
      .editGraphics({ target: "seriesLegendBackground", property: "stroke", value: config.border.color })
      .editGraphics({ target: "seriesLegendBackground", property: "strokeWidth", value: config.border.lineWidth });
  }
);

const createLegendBackground = action(
  { op: "createLegendBackground", description: "Create the legend background rect." },
  function (args = {}) {
    noOptions(args, "createLegendBackground");
    requireConfig(this);
    if (this.graphicSpec.objects.seriesLegendBackground !== undefined) {
      throw new Error("createLegendBackground requires a missing background.");
    }
    return this
      .createGraphics({ id: "seriesLegendBackground", type: "rect" })
      .editLegendBackground();
  }
);

const rematerializeLegend = action(
  { op: "rematerializeLegend", description: "Rematerialize every series legend component." },
  function (args = {}) {
    noOptions(args, "rematerializeLegend");
    const config = requireConfig(this);
    const domain = resolveCurrentDomain(this, config);
    let next = sameDomain(config.domain, domain)
      ? this
      : this._withLegendConfig({ ...config, domain });
    if (config.border !== false) next = next.editLegendBackground();
    return next
      .editLegendSymbols()
      .editLegendLabels()
      .editLegendTitle();
  }
);

const createLegend = action(
  { op: "createLegend", description: "Create a combined line-series legend." },
  function (args = {}) {
    const options = normalizeOptions(args);
    if (this.semanticSpec.guides.legend?.series !== undefined) {
      throw new Error("createLegend requires a missing series legend.");
    }
    const layer = resolveTarget(this, options.target);
    const semantic = resolveSemantic(
      this,
      layer,
      options.channels,
      options.title
    );
    const config = {
      target: layer.id,
      ...semantic,
      position: options.position,
      symbol: options.symbol,
      labels: options.labels,
      titleStyle: options.titleStyle,
      itemGap: options.itemGap,
      border: options.border
    };
    resolveLayout(this, config);
    let next = this
      .editSemantic({
        property: "guide.legend.series.channels",
        value: semantic.channels
      })
      .editSemantic({
        property: "guide.legend.series.scales",
        value: semantic.scales
      })
      .editSemantic({
        property: "guide.legend.series.title",
        value: semantic.title
      })
      ._withLegendConfig(config);

    if (config.border !== false) next = next.createLegendBackground();
    return next
      .createLegendSymbols()
      .createLegendLabels()
      .createLegendTitle();
  }
);

export function registerSeriesLegendActions(ProgramClass) {
  ProgramClass.prototype.createLegend = createLegend;
  ProgramClass.prototype.createLegendBackground = createLegendBackground;
  ProgramClass.prototype.editLegendBackground = editLegendBackground;
  ProgramClass.prototype.createLegendSymbols = createLegendSymbols;
  ProgramClass.prototype.editLegendSymbols = editLegendSymbols;
  ProgramClass.prototype.createLegendLabels = createLegendLabels;
  ProgramClass.prototype.editLegendLabels = editLegendLabels;
  ProgramClass.prototype.createLegendTitle = createLegendTitle;
  ProgramClass.prototype.editLegendTitle = editLegendTitle;
  ProgramClass.prototype.rematerializeLegend = rematerializeLegend;
}
