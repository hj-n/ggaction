import { isPlainObject } from "../../core/immutable.js";
import { validateKeys } from "../../core/validation.js";
import { resolveGraphicBounds } from "../../layout/canvas.js";
import { DEFAULT_COLORS, DEFAULT_FONT_FAMILY } from "../../theme/defaults.js";
import { resolveLayout as resolveLegendLayout } from
  "../guides/legends/categorical/layout.js";

const OPTIONS = Object.freeze([
  "text", "subtitle", "position", "align", "offset", "gap", "titleStyle",
  "subtitleStyle"
]);
const STYLE_OPTIONS = Object.freeze([
  "color", "fontSize", "fontFamily", "fontWeight"
]);
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

export function normalizeTitleOptions(args) {
  if (!isPlainObject(args)) {
    throw new TypeError("createTitle options must be a plain object.");
  }
  validateKeys(args, OPTIONS, "createTitle");
  const text = validateTitleString(args.text, "Chart title text");
  const subtitle = args.subtitle === undefined
    ? undefined
    : validateTitleString(args.subtitle, "Chart subtitle");
  const position = args.position ?? DEFAULTS.position;
  const align = args.align ?? DEFAULTS.align;
  const offset = args.offset ?? DEFAULTS.offset;
  const gap = args.gap ?? DEFAULTS.gap;
  if (position !== "top") throw new Error(`Unsupported title position "${position}".`);
  if (!["left", "center", "right"].includes(align)) {
    throw new Error(`Unsupported title align "${align}".`);
  }
  if (!Number.isFinite(offset)) throw new TypeError("Chart title offset must be a finite number.");
  if (!Number.isFinite(gap) || gap < 0) {
    throw new RangeError("Chart title gap must be a non-negative finite number.");
  }
  return {
    text,
    subtitle,
    position,
    align,
    offset,
    gap,
    titleStyle: normalizeStyle(args.titleStyle, DEFAULTS.titleStyle, "createTitle.titleStyle"),
    subtitleStyle: normalizeStyle(
      args.subtitleStyle,
      DEFAULTS.subtitleStyle,
      "createTitle.subtitleStyle"
    )
  };
}

export function requireTitleConfig(program) {
  if (program.titleConfig === undefined) {
    throw new Error("Title component requires chart title configuration.");
  }
  return program.titleConfig;
}

export function resolveTitleLayout(program, config) {
  const bounds = resolveGraphicBounds(program);
  const canvas = program.graphicSpec.objects.canvas;
  if (
    bounds === undefined ||
    ![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite) ||
    canvas?.type !== "canvas" ||
    !Number.isFinite(canvas.properties.width) ||
    !Number.isFinite(canvas.properties.height)
  ) {
    throw new Error("Chart title layout requires Canvas bounds and dimensions.");
  }
  const blockTop = 16 + config.offset;
  const titleY = blockTop + config.titleStyle.fontSize / 2;
  const hasSubtitle = program.semanticSpec.title.subtitle !== undefined;
  const subtitleY = hasSubtitle
    ? titleY + config.titleStyle.fontSize / 2 + config.gap +
      config.subtitleStyle.fontSize / 2
    : undefined;
  const blockBottom = hasSubtitle
    ? subtitleY + config.subtitleStyle.fontSize / 2
    : titleY + config.titleStyle.fontSize / 2;
  if (blockTop < 0 || blockBottom >= bounds.y) {
    throw new Error("Chart title requires more top-margin space.");
  }
  const topLegend = ["series", "color"]
    .map(kind => program.guideConfigs.legend?.[kind])
    .find(item => item?.position === "top");
  if (topLegend !== undefined && blockBottom >= resolveLegendLayout(program, topLegend).blockTop) {
    throw new Error("Chart title and top legend require more top-margin space.");
  }
  const x = config.align === "left"
    ? bounds.x
    : config.align === "center"
      ? bounds.x + bounds.width / 2
      : bounds.x + bounds.width;
  if (x < 0 || x > canvas.properties.width) {
    throw new Error("Chart title alignment falls outside the Canvas.");
  }
  return { x, titleY, subtitleY, textAlign: config.align };
}
