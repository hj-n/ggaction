import { isPlainObject } from "../../core/immutable.js";
import { validateKeys } from "../../core/validation.js";
import { resolveGraphicBounds } from "../../layout/canvas.js";
import { resolveConcreteGraphicBounds } from "../../grammar/schemas/graphicBounds.js";
import { measureTextWidth, wrapText } from "../../layout/text.js";
import { DEFAULT_COLORS, DEFAULT_FONT_FAMILY } from "../../theme/defaults.js";

const OPTIONS = Object.freeze([
  "text", "subtitle", "position", "align", "offset", "gap", "titleStyle",
  "subtitleStyle", "maxWidth", "wrap", "lineHeight"
]);
const STYLE_OPTIONS = Object.freeze([
  "color", "fontSize", "fontFamily", "fontWeight"
]);
const POSITIONS = Object.freeze(["top", "bottom", "left", "right"]);
const ALIGNS = Object.freeze(["left", "center", "right"]);
const WRAPS = Object.freeze(["word", "character"]);
const DEFAULTS = Object.freeze({
  position: "top",
  align: "left",
  offset: 0,
  gap: 8,
  titleStyle: Object.freeze({
    color: DEFAULT_COLORS.strongText,
    fontSize: 22,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontWeight: 600
  }),
  subtitleStyle: Object.freeze({
    color: DEFAULT_COLORS.mutedText,
    fontSize: 14,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontWeight: "normal"
  })
});

export function validateTitleString(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  if (/\r|\n/u.test(value)) {
    throw new Error(`${label} does not accept explicit newlines.`);
  }
  return value;
}

function normalizeStyle(value, defaults, label) {
  if (value !== undefined && !isPlainObject(value)) {
    throw new TypeError(`${label} must be a plain object.`);
  }
  const style = { ...defaults, ...(value ?? {}) };
  validateKeys(style, STYLE_OPTIONS, label);
  validateTitleString(style.color, `${label} color`);
  validateTitleString(style.fontFamily, `${label} fontFamily`);
  if (!Number.isFinite(style.fontSize) || style.fontSize <= 0) {
    throw new RangeError(`${label} fontSize must be a positive finite number.`);
  }
  if (!(
    (typeof style.fontWeight === "string" && style.fontWeight.length > 0) ||
    Number.isFinite(style.fontWeight)
  )) {
    throw new TypeError(`${label} fontWeight must be a non-empty string or number.`);
  }
  return style;
}

function normalizeConfig(args, defaults, { hasSubtitle }) {
  const position = args.position ?? defaults.position;
  const align = args.align ?? defaults.align;
  const offset = args.offset ?? defaults.offset;
  const gap = args.gap ?? defaults.gap;
  const titleStyle = normalizeStyle(
    args.titleStyle,
    defaults.titleStyle,
    "createTitle.titleStyle"
  );
  const subtitleStyle = normalizeStyle(
    args.subtitleStyle,
    defaults.subtitleStyle,
    "createTitle.subtitleStyle"
  );
  const maxWidth = args.maxWidth ?? defaults.maxWidth;
  const wrap = args.wrap ?? defaults.wrap ?? (maxWidth === undefined ? undefined : "word");
  const lineHeight = args.lineHeight ?? defaults.lineHeight;
  if (!POSITIONS.includes(position)) {
    throw new Error(`Unsupported title position "${position}".`);
  }
  if (!ALIGNS.includes(align)) {
    throw new Error(`Unsupported title align "${align}".`);
  }
  if (!Number.isFinite(offset)) {
    throw new TypeError("Chart title offset must be a finite number.");
  }
  if (!Number.isFinite(gap) || gap < 0) {
    throw new RangeError("Chart title gap must be a non-negative finite number.");
  }
  if (maxWidth !== undefined && (!Number.isFinite(maxWidth) || maxWidth <= 0)) {
    throw new RangeError("Chart title maxWidth must be a positive finite number.");
  }
  if (wrap !== undefined && !WRAPS.includes(wrap)) {
    throw new Error(`Unsupported title wrap "${wrap}".`);
  }
  if (maxWidth === undefined && (wrap !== undefined || lineHeight !== undefined)) {
    throw new Error("Chart title wrap and lineHeight require maxWidth.");
  }
  if (lineHeight !== undefined && (
    !Number.isFinite(lineHeight) ||
    lineHeight < titleStyle.fontSize ||
    (hasSubtitle && lineHeight < subtitleStyle.fontSize)
  )) {
    throw new RangeError("Chart title lineHeight must cover every visible fontSize.");
  }
  return {
    position,
    align,
    offset,
    gap,
    titleStyle,
    subtitleStyle,
    ...(maxWidth === undefined ? {} : { maxWidth, wrap, ...(lineHeight === undefined
      ? {}
      : { lineHeight }) })
  };
}

export function normalizeTitleOptions(args) {
  if (!isPlainObject(args)) {
    throw new TypeError("createTitle options must be a plain object.");
  }
  validateKeys(args, OPTIONS, "createTitle");
  const text = validateTitleString(args.text, "Chart title text");
  const subtitle = args.subtitle === undefined
    ? undefined
    : validateTitleString(args.subtitle, "Chart subtitle");
  return {
    text,
    subtitle,
    ...normalizeConfig(args, DEFAULTS, { hasSubtitle: subtitle !== undefined })
  };
}

export function normalizeTitleEditOptions(args, previous, semanticTitle) {
  if (!isPlainObject(args)) {
    throw new TypeError("editTitle options must be a plain object.");
  }
  validateKeys(args, OPTIONS, "editTitle");
  if (Object.keys(args).length === 0) {
    throw new Error("editTitle requires at least one change.");
  }
  const text = args.text === undefined
    ? semanticTitle.text
    : validateTitleString(args.text, "Chart title text");
  const subtitle = args.subtitle === false
    ? undefined
    : args.subtitle === undefined
      ? semanticTitle.subtitle
      : validateTitleString(args.subtitle, "Chart subtitle");
  if (args.subtitle !== undefined && args.subtitle !== false && typeof args.subtitle !== "string") {
    throw new TypeError("Chart subtitle must be a non-empty string or false.");
  }
  return {
    text,
    subtitle,
    config: normalizeConfig(args, previous, { hasSubtitle: subtitle !== undefined })
  };
}

export function requireTitleConfig(program) {
  if (program.titleConfig === undefined) {
    throw new Error("Title component requires chart title configuration.");
  }
  return program.titleConfig;
}

function lineCenters(lines, style, lineHeight, start) {
  return lines.map((_, index) => start + style.fontSize / 2 + index * lineHeight);
}

function buildReadingBlock(program, config) {
  const titleText = validateTitleString(program.semanticSpec.title.text, "Chart title text");
  const subtitleText = program.semanticSpec.title.subtitle;
  const titleLines = wrapText(titleText, {
    maxWidth: config.maxWidth,
    mode: config.wrap,
    style: config.titleStyle
  });
  const subtitleLines = subtitleText === undefined ? [] : wrapText(
    validateTitleString(subtitleText, "Chart subtitle"),
    {
      maxWidth: config.maxWidth,
      mode: config.wrap,
      style: config.subtitleStyle
    }
  );
  const titleLineHeight = config.lineHeight ?? config.titleStyle.fontSize * 1.2;
  const subtitleLineHeight = config.lineHeight ?? config.subtitleStyle.fontSize * 1.2;
  const titleCenters = lineCenters(
    titleLines,
    config.titleStyle,
    titleLineHeight,
    0
  );
  const titleBottom = titleCenters.at(-1) + config.titleStyle.fontSize / 2;
  const subtitleStart = titleBottom + (subtitleLines.length === 0 ? 0 : config.gap);
  const subtitleCenters = lineCenters(
    subtitleLines,
    config.subtitleStyle,
    subtitleLineHeight,
    subtitleStart
  );
  const height = subtitleLines.length === 0
    ? titleBottom
    : subtitleCenters.at(-1) + config.subtitleStyle.fontSize / 2;
  const widths = [
    ...titleLines.map(line => measureTextWidth(line, config.titleStyle)),
    ...subtitleLines.map(line => measureTextWidth(line, config.subtitleStyle))
  ];
  return {
    titleLines,
    subtitleLines,
    titleCenters,
    subtitleCenters,
    width: Math.max(...widths),
    height
  };
}

function alignedAnchor(start, length, blockLength, align) {
  if (align === "left") return start + blockLength / 2;
  if (align === "center") return start + length / 2;
  return start + length - blockLength / 2;
}

function axisAlignedTextBounds({ x, y, text, style, align, rotation }) {
  const width = measureTextWidth(text, style);
  const left = align === "left" ? 0 : align === "center" ? -width / 2 : -width;
  const right = left + width;
  const top = -style.fontSize / 2;
  const bottom = style.fontSize / 2;
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  const corners = [
    [left, top], [right, top], [right, bottom], [left, bottom]
  ].map(([localX, localY]) => ({
    x: x + localX * cosine - localY * sine,
    y: y + localX * sine + localY * cosine
  }));
  return {
    left: Math.min(...corners.map(point => point.x)),
    right: Math.max(...corners.map(point => point.x)),
    top: Math.min(...corners.map(point => point.y)),
    bottom: Math.max(...corners.map(point => point.y))
  };
}

function unionBounds(bounds) {
  return {
    left: Math.min(...bounds.map(item => item.left)),
    right: Math.max(...bounds.map(item => item.right)),
    top: Math.min(...bounds.map(item => item.top)),
    bottom: Math.max(...bounds.map(item => item.bottom))
  };
}

function componentBounds(component, style) {
  return unionBounds(component.lines.map((text, index) => axisAlignedTextBounds({
    x: Array.isArray(component.x) ? component.x[index] : component.x,
    y: Array.isArray(component.y) ? component.y[index] : component.y,
    text,
    style,
    align: component.textAlign,
    rotation: component.rotation
  })));
}

function reservedGraphicIds(program, position) {
  const ids = [];
  const axisChannel = ["top", "bottom"].includes(position) ? "x" : "y";
  const axis = program.guideConfigs.axis?.[axisChannel];
  if (axis && Object.values(axis).some(config => config?.position === position)) {
    const prefix = axisChannel === "x" ? "xAxis" : "yAxis";
    ids.push(`${prefix}Line`, `${prefix}Ticks`, `${prefix}Labels`, `${prefix}Title`);
  }
  const prefixes = {
    series: "seriesLegend",
    color: "colorLegend",
    gradient: "colorGradient",
    opacity: "opacityLegend"
  };
  for (const [kind, config] of Object.entries(program.guideConfigs.legend ?? {})) {
    if (config?.position !== position || prefixes[kind] === undefined) continue;
    ids.push(...Object.keys(program.graphicSpec.objects).filter(
      id => id.startsWith(prefixes[kind])
    ));
    if (kind === "series" && program.guideConfigs.legend?.size !== undefined) {
      ids.push(...Object.keys(program.graphicSpec.objects).filter(
        id => id.startsWith("sizeLegend")
      ));
    }
  }
  return [...new Set(ids)];
}

function intersects(first, second) {
  return first.left < second.right && first.right > second.left &&
    first.top < second.bottom && first.bottom > second.top;
}

function validateLayout(program, position, titleBounds, plot, canvas) {
  if (
    titleBounds.left < 0 || titleBounds.top < 0 ||
    titleBounds.right > canvas.width || titleBounds.bottom > canvas.height
  ) {
    throw new Error(`Chart title requires more ${position}-margin space.`);
  }
  const outsidePlot = {
    top: titleBounds.bottom <= plot.y,
    bottom: titleBounds.top >= plot.y + plot.height,
    left: titleBounds.right <= plot.x,
    right: titleBounds.left >= plot.x + plot.width
  }[position];
  if (!outsidePlot) {
    throw new Error(`Chart title requires more ${position}-margin space.`);
  }
  for (const id of reservedGraphicIds(program, position)) {
    const bounds = program.graphicSpec.objects[id] === undefined
      ? undefined
      : resolveConcreteGraphicBounds(program.graphicSpec, id);
    if (bounds !== undefined && intersects(titleBounds, bounds)) {
      throw new Error(`Chart title and ${position} guides require more margin space.`);
    }
  }
}

export function resolveTitleLayout(program, config) {
  const plot = resolveGraphicBounds(program);
  const canvas = program.graphicSpec.objects.canvas;
  if (
    plot === undefined ||
    ![plot.x, plot.y, plot.width, plot.height].every(Number.isFinite) ||
    canvas?.type !== "canvas" ||
    !Number.isFinite(canvas.properties.width) ||
    !Number.isFinite(canvas.properties.height)
  ) {
    throw new Error("Chart title layout requires Canvas bounds and dimensions.");
  }
  const block = buildReadingBlock(program, config);
  const horizontal = ["top", "bottom"].includes(config.position);
  let title;
  let subtitle;
  if (horizontal) {
    const x = config.align === "left"
      ? plot.x
      : config.align === "center"
        ? plot.x + plot.width / 2
        : plot.x + plot.width;
    const blockTop = config.position === "top"
      ? 16 + config.offset
      : plot.y + plot.height + config.offset;
    title = {
      lines: block.titleLines,
      x,
      y: block.titleCenters.map(value => blockTop + value),
      textAlign: config.align,
      rotation: 0,
      explicitRotation: config.position !== "top" || block.titleLines.length > 1
    };
    subtitle = block.subtitleLines.length === 0 ? undefined : {
      lines: block.subtitleLines,
      x,
      y: block.subtitleCenters.map(value => blockTop + value),
      textAlign: config.align,
      rotation: 0,
      explicitRotation: config.position !== "top" || block.subtitleLines.length > 1
    };
  } else {
    const rotation = config.position === "left" ? -Math.PI / 2 : Math.PI / 2;
    const y = alignedAnchor(plot.y, plot.height, block.width, config.align);
    const edge = config.position === "left"
      ? 16 + config.offset
      : canvas.properties.width - 16 + config.offset;
    const mapX = value => config.position === "left" ? edge + value : edge - value;
    title = {
      lines: block.titleLines,
      x: block.titleCenters.map(mapX),
      y,
      textAlign: "center",
      rotation,
      explicitRotation: true
    };
    subtitle = block.subtitleLines.length === 0 ? undefined : {
      lines: block.subtitleLines,
      x: block.subtitleCenters.map(mapX),
      y,
      textAlign: "center",
      rotation,
      explicitRotation: true
    };
  }
  const titleBounds = unionBounds([
    componentBounds(title, config.titleStyle),
    ...(subtitle === undefined ? [] : [componentBounds(subtitle, config.subtitleStyle)])
  ]);
  validateLayout(
    program,
    config.position,
    titleBounds,
    plot,
    canvas.properties
  );
  return { title, subtitle, bounds: titleBounds };
}
