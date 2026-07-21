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

function horizontalExtents(width, align) {
  if (align === "center") return [-width / 2, width / 2];
  if (["right", "end"].includes(align)) return [-width, 0];
  return [0, width];
}

function verticalExtents(fontSize, baseline) {
  if (baseline === "middle") return [-fontSize / 2, fontSize / 2];
  if (["top", "hanging"].includes(baseline)) return [0, fontSize];
  if (["bottom", "ideographic"].includes(baseline)) return [-fontSize, 0];
  return [-fontSize * 0.8, fontSize * 0.2];
}

export function resolveTextBounds({
  x,
  y,
  text,
  fontSize,
  textAlign = "left",
  textBaseline = "alphabetic",
  rotation = 0
} = {}) {
  if (![x, y, rotation].every(Number.isFinite)) {
    throw new TypeError("Text bounds require finite x, y, and rotation values.");
  }
  const width = measureTextWidth(text, { fontSize });
  const [left, right] = horizontalExtents(width, textAlign);
  const [top, bottom] = verticalExtents(fontSize, textBaseline);
  const cosine = Math.cos(rotation);
  const sine = Math.sin(rotation);
  const corners = [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom]
  ].map(([localX, localY]) => ({
    x: x + localX * cosine - localY * sine,
    y: y + localX * sine + localY * cosine
  }));
  return Object.freeze({
    left: Math.min(...corners.map(point => point.x)),
    right: Math.max(...corners.map(point => point.x)),
    top: Math.min(...corners.map(point => point.y)),
    bottom: Math.max(...corners.map(point => point.y))
  });
}
