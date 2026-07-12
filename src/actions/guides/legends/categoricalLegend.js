import { action } from "../../../core/action.js";
import { validateUserId } from "../../../core/identifiers.js";
import { isPlainObject } from "../../../core/immutable.js";
import { mapOrdinalValues } from "../../../core/scale.js";

const CHANNELS = Object.freeze(["color", "strokeDash"]);
const OPTIONS = Object.freeze([
  "target",
  "channels",
  "position",
  "align",
  "title",
  "symbol",
  "labels",
  "titleStyle",
  "itemGap",
  "border"
]);
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
const LAYER_OPTIONS = Object.freeze({
  line: Object.freeze(["type", "length", "lineWidth"]),
  point: Object.freeze([
    "type",
    "shape",
    "size",
    "fill",
    "stroke",
    "strokeWidth"
  ]),
  swatch: Object.freeze([
    "type",
    "width",
    "height",
    "stroke",
    "strokeWidth"
  ])
});
const COMMON_DEFAULTS = Object.freeze({
  labels: Object.freeze({
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

function validateObject(value, supported, label) {
  if (!isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  validateKeys(value, supported, label);
}

function nonEmptyString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

function nonNegative(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative finite number.`);
  }
  return value;
}

function positive(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive finite number.`);
  }
  return value;
}

function validateFontWeight(value, label) {
  if (typeof value !== "string" && !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a string or number.`);
  }
  return value;
}

function normalizeBorder(border) {
  if (border === undefined || border === false) return false;
  if (border !== true) {
    validateObject(border, BORDER_OPTIONS, "createLegend.border");
  }
  const normalized = {
    ...COMMON_DEFAULTS.border,
    ...(border === true ? {} : border)
  };
  nonEmptyString(normalized.color, "Legend border color");
  nonEmptyString(normalized.background, "Legend border background");
  nonNegative(normalized.lineWidth, "Legend border lineWidth");
  nonNegative(normalized.padding, "Legend border padding");
  return normalized;
}

function defaultRecipe(kind) {
  return kind === "series"
    ? { layers: [{ type: "line", length: 32, lineWidth: 2 }] }
    : {
        layers: [{
          type: "swatch",
          width: 14,
          height: 12,
          stroke: "white",
          strokeWidth: 0.5
        }]
      };
}

function normalizeLayer(layer) {
  if (!isPlainObject(layer) || !Object.hasOwn(LAYER_OPTIONS, layer.type)) {
    throw new Error("Legend symbol layer type must be line, point, or swatch.");
  }
  validateKeys(
    layer,
    LAYER_OPTIONS[layer.type],
    `createLegend.symbol.${layer.type}`
  );
  if (layer.type === "line") {
    const normalized = { length: 32, lineWidth: 2, ...layer };
    positive(normalized.length, "Legend line symbol length");
    nonNegative(normalized.lineWidth, "Legend line symbol lineWidth");
    return normalized;
  }
  if (layer.type === "point") {
    const normalized = {
      shape: "circle",
      size: 5,
      stroke: "white",
      strokeWidth: 0,
      ...layer
    };
    if (normalized.shape !== "circle") {
      throw new Error(`Unsupported legend point shape "${normalized.shape}".`);
    }
    positive(normalized.size, "Legend point symbol size");
    nonEmptyString(normalized.stroke, "Legend point symbol stroke");
    nonNegative(normalized.strokeWidth, "Legend point symbol strokeWidth");
    if (normalized.fill !== undefined) {
      nonEmptyString(normalized.fill, "Legend point symbol fill");
    }
    return normalized;
  }
  const normalized = {
    width: 14,
    height: 12,
    stroke: "white",
    strokeWidth: 0.5,
    ...layer
  };
  positive(normalized.width, "Legend swatch width");
  positive(normalized.height, "Legend swatch height");
  nonEmptyString(normalized.stroke, "Legend swatch stroke");
  nonNegative(normalized.strokeWidth, "Legend swatch strokeWidth");
  return normalized;
}

function normalizeRecipe(symbol, kind) {
  if (symbol === undefined || symbol === "auto") return defaultRecipe(kind);
  if (!isPlainObject(symbol)) {
    throw new TypeError('createLegend.symbol must be "auto" or a plain object.');
  }

  let layers;
  if (Object.hasOwn(symbol, "layers")) {
    validateKeys(symbol, ["layers"], "createLegend.symbol");
    if (!Array.isArray(symbol.layers) || symbol.layers.length === 0) {
      throw new TypeError("Legend symbol layers must be a non-empty array.");
    }
    layers = symbol.layers.map(normalizeLayer);
  } else if (kind === "series") {
    validateKeys(symbol, ["length", "lineWidth"], "createLegend.symbol");
    layers = [normalizeLayer({ type: "line", ...symbol })];
  } else {
    validateKeys(
      symbol,
      ["width", "height", "stroke", "strokeWidth"],
      "createLegend.symbol"
    );
    layers = [normalizeLayer({ type: "swatch", ...symbol })];
  }

  const types = layers.map(layer => layer.type);
  if (new Set(types).size !== types.length) {
    throw new Error("Legend symbol recipe supports at most one layer per type.");
  }
  return { layers };
}

function normalizeOptions(args, kind) {
  if (!isPlainObject(args)) {
    throw new TypeError("createLegend options must be a plain object.");
  }
  validateKeys(args, OPTIONS, "createLegend");
  if (Object.hasOwn(args, "labels")) {
    validateObject(args.labels, TEXT_OPTIONS, "createLegend.labels");
  }
  if (Object.hasOwn(args, "titleStyle")) {
    validateObject(
      args.titleStyle,
      TITLE_OPTIONS,
      "createLegend.titleStyle"
    );
  }

  const defaults = kind === "series"
    ? { position: "right", align: "center", offset: 10, itemGap: 28 }
    : { position: "bottom", align: "center", offset: 8, itemGap: 20 };
  const labels = {
    ...COMMON_DEFAULTS.labels,
    offset: defaults.offset,
    ...(args.labels ?? {})
  };
  const titleStyle = {
    ...COMMON_DEFAULTS.titleStyle,
    ...(args.titleStyle ?? {})
  };
  const position = args.position ?? defaults.position;
  const align = args.align ?? defaults.align;
  const itemGap = args.itemGap ?? defaults.itemGap;

  if (
    (kind === "series" && position !== "right") ||
    (kind === "color" && position !== "bottom")
  ) {
    throw new Error(`Unsupported legend position "${position}".`);
  }
  if (!["left", "center", "right"].includes(align)) {
    throw new Error(`Unsupported legend alignment "${align}".`);
  }
  if (position === "right" && align !== "center") {
    throw new Error("Right legends currently require center alignment.");
  }
  nonNegative(labels.offset, "Legend label offset");
  nonEmptyString(labels.color, "Legend label color");
  positive(labels.fontSize, "Legend label fontSize");
  nonEmptyString(labels.fontFamily, "Legend label fontFamily");
  validateFontWeight(labels.fontWeight, "Legend label fontWeight");
  nonEmptyString(titleStyle.color, "Legend title color");
  positive(titleStyle.fontSize, "Legend title fontSize");
  nonEmptyString(titleStyle.fontFamily, "Legend title fontFamily");
  validateFontWeight(titleStyle.fontWeight, "Legend title fontWeight");
  positive(itemGap, "Legend itemGap");

  return {
    target: args.target,
    channels: args.channels,
    position,
    align,
    title: args.title,
    symbol: normalizeRecipe(args.symbol, kind),
    labels,
    titleStyle,
    itemGap,
    border: normalizeBorder(args.border)
  };
}

function isCategoricalTarget(layer) {
  if (layer?.mark?.type === "line") {
    return CHANNELS.some(
      channel => layer.encoding?.[channel]?.scale !== undefined
    );
  }
  return layer?.mark?.type === "bar" &&
    layer.encoding?.color?.scale !== undefined;
}

function resolveTarget(program, requested) {
  if (requested !== undefined) {
    const id = validateUserId(requested, "Legend target id");
    const layer = program.semanticSpec.layers.find(item => item.id === id);
    if (!isCategoricalTarget(layer)) {
      throw new Error(`Unknown categorical legend target "${id}".`);
    }
    return layer;
  }

  const current = program.semanticSpec.layers.find(
    layer => layer.id === program.context.currentMark
  );
  if (isCategoricalTarget(current)) return current;
  const candidates = program.semanticSpec.layers.filter(isCategoricalTarget);
  if (candidates.length !== 1) {
    throw new Error(
      "createLegend requires target when the categorical mark is ambiguous."
    );
  }
  return candidates[0];
}

function sameValues(left, right) {
  return left.length === right.length && left.every(
    (value, index) => value === right[index]
  );
}

function resolveOrdinalScales(program, scaleIds) {
  const scales = scaleIds.map(id => {
    const semantic = program.semanticSpec.scales.find(item => item.id === id);
    const concrete = program.resolvedScales[id];
    if (semantic?.type !== "ordinal" || concrete?.type !== "ordinal") {
      throw new Error(`Legend requires resolved ordinal scale "${id}".`);
    }
    if (!Array.isArray(concrete.domain) || concrete.domain.length === 0) {
      throw new Error(`Legend scale "${id}" requires a non-empty domain.`);
    }
    return concrete;
  });
  if (scales.slice(1).some(scale => !sameValues(scale.domain, scales[0].domain))) {
    throw new Error("Combined legend scales must have identical ordered domains.");
  }
  return { scales, domain: scales[0].domain };
}

function resolveDefinition(program, layer, requestedChannels, requestedTitle) {
  const kind = layer.mark.type === "bar" ? "color" : "series";
  const channels = requestedChannels ?? (kind === "color"
    ? ["color"]
    : CHANNELS.filter(
        channel => layer.encoding?.[channel]?.scale !== undefined
      ));
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
  if (kind === "color" && !sameValues(channels, ["color"])) {
    throw new Error("Bar legends currently support only the color channel.");
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
  const resolved = resolveOrdinalScales(program, scales);
  const field = [...fields][0];
  return {
    kind,
    channels,
    scales,
    field,
    title: nonEmptyString(requestedTitle ?? field, "Legend title"),
    domain: resolved.domain
  };
}

function activeConfig(program) {
  const entries = ["series", "color"]
    .filter(kind => program.guideConfigs.legend?.[kind] !== undefined)
    .map(kind => [kind, program.guideConfigs.legend[kind]]);
  if (entries.length !== 1) {
    throw new Error("Legend component requires one categorical legend config.");
  }
  return { kind: entries[0][0], config: entries[0][1] };
}

function prefix(config) {
  return config.kind === "series" ? "seriesLegend" : "colorLegend";
}

function symbolGraphic(config, type) {
  const onlyDefault = config.symbol.layers.length === 1 &&
    ((config.kind === "series" && type === "line") ||
      (config.kind === "color" && type === "swatch"));
  if (onlyDefault) return `${prefix(config)}Symbols`;
  const suffix = { line: "Lines", point: "Points", swatch: "Swatches" }[type];
  return `${prefix(config)}Symbol${suffix}`;
}

function graphic(config, component) {
  return `${prefix(config)}${component}`;
}

function symbolWidth(config) {
  return Math.max(...config.symbol.layers.map(layer => {
    if (layer.type === "line") return layer.length;
    if (layer.type === "point") return layer.size * 2;
    return layer.width;
  }));
}

function resolveLayout(program, config) {
  const bounds = program.context.currentGraphicBounds;
  const canvas = program.graphicSpec.objects.canvas;
  if (
    bounds === undefined ||
    ![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite) ||
    canvas?.type !== "canvas" ||
    !Number.isFinite(canvas.properties.width) ||
    !Number.isFinite(canvas.properties.height)
  ) {
    throw new Error("Legend layout requires Canvas bounds, width, and height.");
  }

  const count = config.domain.length;
  const width = symbolWidth(config);
  if (config.position === "right") {
    const symbolX = Array(count).fill(bounds.x + bounds.width + 30);
    const itemY = Array.from(
      { length: count },
      (_, index) => bounds.y + 52 + index * config.itemGap
    );
    const labelX = symbolX.map(value => value + width + config.labels.offset);
    if (labelX.some(value => value >= canvas.properties.width)) {
      throw new Error("Legend layout requires more right-margin space.");
    }
    const titleX = symbolX[0];
    const titleY = bounds.y + 20;
    let background;
    if (config.border !== false) {
      const x = symbolX[0] - config.border.padding;
      const y = bounds.y + 8;
      const backgroundWidth =
        canvas.properties.width - x - config.border.padding;
      const height = itemY.at(-1) - y + config.border.padding;
      if (backgroundWidth <= 0 || height <= 0) {
        throw new Error("Legend background requires positive width and height.");
      }
      background = { x, y, width: backgroundWidth, height };
    }
    return { symbolX, itemY, labelX, titleX, titleY, background };
  }

  const labels = config.domain.map(String);
  const itemWidths = labels.map(
    label => width + config.labels.offset + label.length * 7
  );
  const totalWidth = itemWidths.reduce((sum, value) => sum + value, 0) +
    config.itemGap * Math.max(0, count - 1);
  let start;
  if (config.align === "left") start = bounds.x;
  else if (config.align === "right") {
    start = bounds.x + bounds.width - totalWidth;
  } else start = (canvas.properties.width - totalWidth) / 2;
  if (start < 0 || start + totalWidth > canvas.properties.width) {
    throw new Error("Legend layout requires more horizontal Canvas space.");
  }
  const symbolX = [];
  const labelX = [];
  let cursor = start;
  for (let index = 0; index < count; index += 1) {
    symbolX.push(cursor);
    labelX.push(cursor + width + config.labels.offset);
    cursor += itemWidths[index] + config.itemGap;
  }
  const itemY = Array(count).fill(canvas.properties.height - 28);
  const titleX = start + totalWidth / 2;
  const titleY = canvas.properties.height - 52;
  if (titleY <= bounds.y + bounds.height) {
    throw new Error("Legend layout requires more bottom-margin space.");
  }
  let background;
  if (config.border !== false) {
    const maxHeight = Math.max(
      config.labels.fontSize,
      ...config.symbol.layers.map(layer =>
        layer.type === "swatch"
          ? layer.height
          : layer.type === "point"
            ? layer.size * 2
            : layer.lineWidth
      )
    );
    const x = start - config.border.padding;
    const y = titleY - config.titleStyle.fontSize / 2 - config.border.padding;
    const backgroundWidth = totalWidth + config.border.padding * 2;
    const height = itemY[0] + maxHeight / 2 + config.border.padding - y;
    background = { x, y, width: backgroundWidth, height };
  }
  return { symbolX, itemY, labelX, titleX, titleY, background };
}

function resolveAppearance(program, config) {
  let colors = config.domain.map(() => "#4c78a8");
  let dashes = config.domain.map(() => []);
  for (let index = 0; index < config.channels.length; index += 1) {
    const scale = program.resolvedScales[config.scales[index]];
    const values = mapOrdinalValues(config.domain, scale.domain, scale.range);
    if (config.channels[index] === "color") colors = values;
    if (config.channels[index] === "strokeDash") dashes = values;
  }
  return { colors, dashes };
}

function noOptions(args, operation) {
  if (!isPlainObject(args) || Object.keys(args).length > 0) {
    throw new Error(`${operation} does not accept options.`);
  }
}

function layerFor(config, type) {
  const layer = config.symbol.layers.find(item => item.type === type);
  if (layer === undefined) {
    throw new Error(`Legend recipe does not contain a ${type} layer.`);
  }
  return layer;
}

function makeEditSymbol(type) {
  const suffix = { line: "Lines", point: "Points", swatch: "Swatches" }[type];
  const op = `editLegendSymbol${suffix}`;
  return action(
    { op, description: `Rematerialize categorical legend ${type} symbols.` },
    function (args = {}) {
      noOptions(args, op);
      const { config } = activeConfig(this);
      const layer = layerFor(config, type);
      const id = symbolGraphic(config, type);
      const expected = { line: "line", point: "circle", swatch: "rect" }[type];
      if (this.graphicSpec.objects[id]?.type !== expected) {
        throw new Error(`${op} requires existing ${type} symbols.`);
      }
      const layout = resolveLayout(this, config);
      const appearance = resolveAppearance(this, config);
      let next = this.editGraphics({
        target: id,
        property: "length",
        value: config.domain.length
      });
      if (type === "line") {
        const x1 = layout.symbolX.map(
          value => value + (symbolWidth(config) - layer.length) / 2
        );
        return next
          .editGraphics({ target: id, property: "x1", value: x1 })
          .editGraphics({ target: id, property: "y1", value: layout.itemY })
          .editGraphics({
            target: id,
            property: "x2",
            value: x1.map(value => value + layer.length)
          })
          .editGraphics({ target: id, property: "y2", value: layout.itemY })
          .editGraphics({ target: id, property: "stroke", value: appearance.colors })
          .editGraphics({ target: id, property: "strokeWidth", value: layer.lineWidth })
          .editGraphics({ target: id, property: "strokeDash", value: appearance.dashes });
      }
      if (type === "point") {
        const x = layout.symbolX.map(value => value + symbolWidth(config) / 2);
        return next
          .editGraphics({ target: id, property: "x", value: x })
          .editGraphics({ target: id, property: "y", value: layout.itemY })
          .editGraphics({ target: id, property: "radius", value: layer.size })
          .editGraphics({
            target: id,
            property: "fill",
            value: layer.fill ?? appearance.colors
          })
          .editGraphics({ target: id, property: "stroke", value: layer.stroke })
          .editGraphics({ target: id, property: "strokeWidth", value: layer.strokeWidth });
      }
      const x = layout.symbolX.map(
        value => value + (symbolWidth(config) - layer.width) / 2
      );
      return next
        .editGraphics({ target: id, property: "x", value: x })
        .editGraphics({
          target: id,
          property: "y",
          value: layout.itemY.map(value => value - layer.height / 2)
        })
        .editGraphics({ target: id, property: "width", value: layer.width })
        .editGraphics({ target: id, property: "height", value: layer.height })
        .editGraphics({ target: id, property: "fill", value: appearance.colors })
        .editGraphics({ target: id, property: "stroke", value: layer.stroke })
        .editGraphics({ target: id, property: "strokeWidth", value: layer.strokeWidth });
    }
  );
}

function makeCreateSymbol(type, edit) {
  const suffix = { line: "Lines", point: "Points", swatch: "Swatches" }[type];
  const op = `createLegendSymbol${suffix}`;
  return action(
    { op, description: `Create categorical legend ${type} symbols.` },
    function (args = {}) {
      noOptions(args, op);
      const { config } = activeConfig(this);
      layerFor(config, type);
      const id = symbolGraphic(config, type);
      if (this.graphicSpec.objects[id] !== undefined) {
        throw new Error(`${op} requires missing ${type} symbols.`);
      }
      const graphicType = { line: "line", point: "circle", swatch: "rect" }[type];
      return this
        .createGraphics({ id, type: graphicType, length: config.domain.length })
        [edit]();
    }
  );
}

const editLegendSymbolLines = makeEditSymbol("line");
const editLegendSymbolPoints = makeEditSymbol("point");
const editLegendSymbolSwatches = makeEditSymbol("swatch");
const createLegendSymbolLines = makeCreateSymbol(
  "line",
  "editLegendSymbolLines"
);
const createLegendSymbolPoints = makeCreateSymbol(
  "point",
  "editLegendSymbolPoints"
);
const createLegendSymbolSwatches = makeCreateSymbol(
  "swatch",
  "editLegendSymbolSwatches"
);

const createLegendSymbols = action(
  { op: "createLegendSymbols", description: "Create layered legend symbols." },
  function (args = {}) {
    noOptions(args, "createLegendSymbols");
    const { config } = activeConfig(this);
    let next = this;
    for (const layer of config.symbol.layers) {
      const operation = {
        line: "createLegendSymbolLines",
        point: "createLegendSymbolPoints",
        swatch: "createLegendSymbolSwatches"
      }[layer.type];
      next = next[operation]();
    }
    return next;
  }
);

const editLegendSymbols = action(
  { op: "editLegendSymbols", description: "Rematerialize layered legend symbols." },
  function (args = {}) {
    noOptions(args, "editLegendSymbols");
    const { config } = activeConfig(this);
    let next = this;
    for (const layer of config.symbol.layers) {
      const operation = {
        line: "editLegendSymbolLines",
        point: "editLegendSymbolPoints",
        swatch: "editLegendSymbolSwatches"
      }[layer.type];
      next = next[operation]();
    }
    return next;
  }
);

const editLegendLabels = action(
  { op: "editLegendLabels", description: "Rematerialize categorical legend labels." },
  function (args = {}) {
    noOptions(args, "editLegendLabels");
    const { config } = activeConfig(this);
    const id = graphic(config, "Labels");
    if (this.graphicSpec.objects[id]?.type !== "text") {
      throw new Error("editLegendLabels requires existing legend labels.");
    }
    const layout = resolveLayout(this, config);
    return this
      .editGraphics({ target: id, property: "length", value: config.domain.length })
      .editGraphics({ target: id, property: "x", value: layout.labelX })
      .editGraphics({ target: id, property: "y", value: layout.itemY })
      .editGraphics({ target: id, property: "text", value: config.domain.map(String) })
      .editGraphics({ target: id, property: "fill", value: config.labels.color })
      .editGraphics({ target: id, property: "fontSize", value: config.labels.fontSize })
      .editGraphics({ target: id, property: "fontFamily", value: config.labels.fontFamily })
      .editGraphics({ target: id, property: "fontWeight", value: config.labels.fontWeight })
      .editGraphics({ target: id, property: "textAlign", value: "left" })
      .editGraphics({ target: id, property: "textBaseline", value: "middle" });
  }
);

const createLegendLabels = action(
  { op: "createLegendLabels", description: "Create categorical legend labels." },
  function (args = {}) {
    noOptions(args, "createLegendLabels");
    const { config } = activeConfig(this);
    const id = graphic(config, "Labels");
    if (this.graphicSpec.objects[id] !== undefined) {
      throw new Error("createLegendLabels requires missing legend labels.");
    }
    return this
      .createGraphics({ id, type: "text", length: config.domain.length })
      .editLegendLabels();
  }
);

const editLegendTitle = action(
  { op: "editLegendTitle", description: "Rematerialize the categorical legend title." },
  function (args = {}) {
    noOptions(args, "editLegendTitle");
    const { config } = activeConfig(this);
    const id = graphic(config, "Title");
    if (this.graphicSpec.objects[id]?.type !== "text") {
      throw new Error("editLegendTitle requires an existing legend title.");
    }
    const layout = resolveLayout(this, config);
    return this
      .editGraphics({ target: id, property: "x", value: layout.titleX })
      .editGraphics({ target: id, property: "y", value: layout.titleY })
      .editGraphics({ target: id, property: "text", value: config.title })
      .editGraphics({ target: id, property: "fill", value: config.titleStyle.color })
      .editGraphics({ target: id, property: "fontSize", value: config.titleStyle.fontSize })
      .editGraphics({ target: id, property: "fontFamily", value: config.titleStyle.fontFamily })
      .editGraphics({ target: id, property: "fontWeight", value: config.titleStyle.fontWeight })
      .editGraphics({
        target: id,
        property: "textAlign",
        value: config.position === "bottom" ? "center" : "left"
      })
      .editGraphics({ target: id, property: "textBaseline", value: "middle" });
  }
);

const createLegendTitle = action(
  { op: "createLegendTitle", description: "Create the categorical legend title." },
  function (args = {}) {
    noOptions(args, "createLegendTitle");
    const { config } = activeConfig(this);
    const id = graphic(config, "Title");
    if (this.graphicSpec.objects[id] !== undefined) {
      throw new Error("createLegendTitle requires a missing legend title.");
    }
    return this
      .createGraphics({ id, type: "text" })
      .editLegendTitle();
  }
);

const editLegendBackground = action(
  { op: "editLegendBackground", description: "Rematerialize the legend background." },
  function (args = {}) {
    noOptions(args, "editLegendBackground");
    const { config } = activeConfig(this);
    if (config.border === false) {
      throw new Error("editLegendBackground requires border configuration.");
    }
    const id = graphic(config, "Background");
    if (this.graphicSpec.objects[id]?.type !== "rect") {
      throw new Error("editLegendBackground requires an existing background.");
    }
    const layout = resolveLayout(this, config).background;
    return this
      .editGraphics({ target: id, property: "x", value: layout.x })
      .editGraphics({ target: id, property: "y", value: layout.y })
      .editGraphics({ target: id, property: "width", value: layout.width })
      .editGraphics({ target: id, property: "height", value: layout.height })
      .editGraphics({ target: id, property: "fill", value: config.border.background })
      .editGraphics({ target: id, property: "stroke", value: config.border.color })
      .editGraphics({ target: id, property: "strokeWidth", value: config.border.lineWidth });
  }
);

const createLegendBackground = action(
  { op: "createLegendBackground", description: "Create the legend background rect." },
  function (args = {}) {
    noOptions(args, "createLegendBackground");
    const { config } = activeConfig(this);
    const id = graphic(config, "Background");
    if (this.graphicSpec.objects[id] !== undefined) {
      throw new Error("createLegendBackground requires a missing background.");
    }
    return this
      .createGraphics({ id, type: "rect" })
      .editLegendBackground();
  }
);

function resolveCurrentDefinition(program, config) {
  const layer = program.semanticSpec.layers.find(
    item => item.id === config.target
  );
  if (layer === undefined) {
    throw new Error(`Unknown categorical legend target "${config.target}".`);
  }
  const guide = program.semanticSpec.guides.legend?.[config.kind];
  if (guide === undefined) {
    throw new Error("Legend rematerialization requires semantic guide state.");
  }
  const channels = config.kind === "series" ? guide.channels : ["color"];
  const definition = resolveDefinition(program, layer, channels, guide.title);
  const storedScales = config.kind === "series" ? guide.scales : [guide.scale];
  if (!sameValues(definition.scales, storedScales)) {
    throw new Error("Legend encodings no longer use the stored guide scales.");
  }
  return definition;
}

const rematerializeLegend = action(
  { op: "rematerializeLegend", description: "Rematerialize every categorical legend component." },
  function (args = {}) {
    noOptions(args, "rematerializeLegend");
    const { kind, config } = activeConfig(this);
    const definition = resolveCurrentDefinition(this, config);
    let next = sameValues(config.domain, definition.domain)
      ? this
      : this._withLegendConfig(kind, { ...config, domain: definition.domain });
    if (config.border !== false) next = next.editLegendBackground();
    return next
      .editLegendSymbols()
      .editLegendLabels()
      .editLegendTitle();
  }
);

const createCategoricalLegend = action(
  { op: "createCategoricalLegend", description: "Create one categorical legend block." },
  function (args = {}) {
    const layer = resolveTarget(this, args.target);
    const kind = layer.mark.type === "bar" ? "color" : "series";
    const options = normalizeOptions(args, kind);
    if (
      this.semanticSpec.guides.legend?.series !== undefined ||
      this.semanticSpec.guides.legend?.color !== undefined
    ) {
      throw new Error("createCategoricalLegend requires a missing legend.");
    }
    const definition = resolveDefinition(
      this,
      layer,
      options.channels,
      options.title
    );
    const config = {
      target: layer.id,
      ...definition,
      position: options.position,
      align: options.align,
      symbol: options.symbol,
      labels: options.labels,
      titleStyle: options.titleStyle,
      itemGap: options.itemGap,
      border: options.border
    };
    resolveLayout(this, config);
    let next = this;
    if (kind === "series") {
      next = next
        .editSemantic({
          property: "guide.legend.series.channels",
          value: definition.channels
        })
        .editSemantic({
          property: "guide.legend.series.scales",
          value: definition.scales
        })
        .editSemantic({
          property: "guide.legend.series.title",
          value: definition.title
        });
    } else {
      next = next
        .editSemantic({
          property: "guide.legend.color.scale",
          value: definition.scales[0]
        })
        .editSemantic({
          property: "guide.legend.color.title",
          value: definition.title
        });
    }
    next = next._withLegendConfig(kind, config);
    if (config.border !== false) next = next.createLegendBackground();
    return next
      .createLegendSymbols()
      .createLegendLabels()
      .createLegendTitle();
  }
);

const createLegend = action(
  { op: "createLegend", description: "Create an inferred categorical legend." },
  function (args = {}) {
    if (!isPlainObject(args)) {
      throw new TypeError("createLegend options must be a plain object.");
    }
    return this.createCategoricalLegend(args);
  }
);

export function registerCategoricalLegendActions(ProgramClass) {
  ProgramClass.prototype.createLegend = createLegend;
  ProgramClass.prototype.createCategoricalLegend = createCategoricalLegend;
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
