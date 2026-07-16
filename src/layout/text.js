import { measureTextWidth } from "../core/textMetrics.js";

export { measureTextWidth } from "../core/textMetrics.js";

function wrapCodePoints(text, maxWidth, style) {
  const lines = [];
  let line = "";
  for (const codePoint of [...text]) {
    const candidate = line + codePoint;
    if (line !== "" && measureTextWidth(candidate, style) > maxWidth) {
      lines.push(line);
      line = codePoint;
    } else {
      line = candidate;
    }
  }
  if (line !== "") lines.push(line);
  return lines;
}

function wrapWords(text, maxWidth, style) {
  const lines = [];
  let line = "";
  for (const word of text.trim().split(/\s+/u)) {
    if (measureTextWidth(word, style) > maxWidth) {
      if (line !== "") {
        lines.push(line);
        line = "";
      }
      const fragments = wrapCodePoints(word, maxWidth, style);
      lines.push(...fragments.slice(0, -1));
      line = fragments.at(-1);
      continue;
    }
    const candidate = line === "" ? word : `${line} ${word}`;
    if (line !== "" && measureTextWidth(candidate, style) > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line !== "") lines.push(line);
  return lines;
}

export function wrapText(text, {
  maxWidth,
  mode = "word",
  style
} = {}) {
  if (maxWidth === undefined) return [text];
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    throw new RangeError("Text maxWidth must be positive.");
  }
  if (!["word", "character"].includes(mode)) {
    throw new Error(`Unsupported text wrap mode "${mode}".`);
  }
  return mode === "word"
    ? wrapWords(text, maxWidth, style)
    : wrapCodePoints(text, maxWidth, style);
}
