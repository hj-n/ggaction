function codePointWidth(codePoint) {
  if (/\s/u.test(codePoint)) return 0.28;
  if (/[iIl1.,:;!'|]/u.test(codePoint)) return 0.27;
  if (/[mwMW@#%&]/u.test(codePoint)) return 0.82;
  if (/[A-Z]/u.test(codePoint)) return 0.61;
  if (/[0-9]/u.test(codePoint)) return 0.53;
  if (/[-_]/u.test(codePoint)) return 0.34;
  if (codePoint.codePointAt(0) > 0x7f) return 1;
  return 0.47;
}

export function measureTextWidth(text, { fontSize } = {}) {
  if (typeof text !== "string") {
    throw new TypeError("Text measurement requires a string.");
  }
  if (!Number.isFinite(fontSize) || fontSize <= 0) {
    throw new RangeError("Text measurement requires a positive fontSize.");
  }
  return [...text].reduce(
    (width, codePoint) => width + codePointWidth(codePoint) * fontSize,
    0
  );
}

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
