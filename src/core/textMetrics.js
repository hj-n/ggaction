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
