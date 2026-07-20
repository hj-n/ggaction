const UINT32_RANGE = 0x1_0000_0000;

export function canonicalJitterScalar(value, label = "Jitter identity") {
  if (typeof value === "string") {
    return `string:${new TextEncoder().encode(value).length}:${value}`;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return `number:${Object.is(value, -0) ? "0" : String(value)}`;
  }
  if (typeof value === "boolean") {
    return `boolean:${value}`;
  }
  throw new TypeError(`${label} must be a string, finite number, or boolean.`);
}

export function stableUint32HashV1(value) {
  const bytes = new TextEncoder().encode(value);
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

export function jitterIdentityV1({ target, channel, seed = 0, identity }) {
  if (typeof target !== "string" || target.length === 0) {
    throw new TypeError("Jitter target must be a non-empty string.");
  }
  if (!["x", "y"].includes(channel)) {
    throw new Error('Jitter channel must be "x" or "y".');
  }
  return [
    canonicalJitterScalar(target, "Jitter target"),
    canonicalJitterScalar(channel, "Jitter channel"),
    canonicalJitterScalar(seed, "Jitter seed"),
    canonicalJitterScalar(identity, "Jitter key")
  ].join("\0");
}

export function requestedJitterOffsetV1(options, maximum) {
  if (!Number.isFinite(maximum) || maximum <= 0) {
    throw new RangeError("Jitter maximum must be a positive finite number.");
  }
  const hash = stableUint32HashV1(jitterIdentityV1(options));
  return (2 * (hash / UINT32_RANGE) - 1) * maximum;
}

export function resolveJitterMaximum(maxOffset, scale) {
  if (maxOffset === null || typeof maxOffset !== "object" || Array.isArray(maxOffset)) {
    throw new TypeError("Jitter maxOffset must be an object.");
  }
  const hasPixels = Object.hasOwn(maxOffset, "pixels");
  const hasBand = Object.hasOwn(maxOffset, "band");
  if (hasPixels === hasBand) {
    throw new Error("Jitter maxOffset requires exactly one of pixels or band.");
  }
  if (hasPixels) {
    if (!Number.isFinite(maxOffset.pixels) || maxOffset.pixels <= 0) {
      throw new RangeError("Jitter pixel maximum must be positive and finite.");
    }
    return maxOffset.pixels;
  }
  if (!Number.isFinite(maxOffset.band) || maxOffset.band <= 0 || maxOffset.band > 0.5) {
    throw new RangeError("Jitter band maximum must be greater than 0 and at most 0.5.");
  }
  if (!scale || !["ordinal", "point", "band"].includes(scale.type)) {
    throw new Error("Band jitter requires a categorical position scale.");
  }
  const slot = scale.bandwidth > 0 ? scale.bandwidth : Math.abs(scale.step);
  if (!Number.isFinite(slot) || slot <= 0) {
    throw new Error("Band jitter requires a positive effective category slot.");
  }
  return slot * maxOffset.band;
}

export function containJitterOffset({
  base,
  requested,
  plotMinimum,
  plotMaximum,
  halfExtent,
  slotWidth
}) {
  if (![base, requested, plotMinimum, plotMaximum, halfExtent].every(Number.isFinite)) {
    throw new TypeError("Jitter containment values must be finite numbers.");
  }
  if (plotMaximum < plotMinimum || halfExtent < 0) {
    throw new RangeError("Jitter containment bounds are invalid.");
  }
  let minimum = plotMinimum + halfExtent;
  let maximum = plotMaximum - halfExtent;
  if (slotWidth !== undefined) {
    if (!Number.isFinite(slotWidth) || slotWidth <= 0) {
      throw new RangeError("Jitter slot width must be positive and finite.");
    }
    minimum = Math.max(minimum, base - slotWidth / 2 + halfExtent);
    maximum = Math.min(maximum, base + slotWidth / 2 - halfExtent);
  }
  if (minimum > maximum) {
    return Object.freeze({ finalOffset: 0, clamped: true, available: false });
  }
  const final = Math.max(minimum, Math.min(maximum, base + requested));
  return Object.freeze({
    finalOffset: final - base,
    clamped: final !== base + requested,
    available: true
  });
}

export function resolveJitterOffsets({
  target,
  channel,
  seed = 0,
  identities,
  base,
  maximum,
  plotMinimum,
  plotMaximum,
  halfExtents,
  slotWidth
}) {
  const offsets = identities.map((identity, index) => {
    const requested = requestedJitterOffsetV1({
      target,
      channel,
      seed,
      identity
    }, maximum);
    return containJitterOffset({
      base: base[index],
      requested,
      plotMinimum,
      plotMaximum,
      halfExtent: Array.isArray(halfExtents) ? halfExtents[index] : halfExtents,
      slotWidth
    });
  });
  return Object.freeze({
    final: Object.freeze(base.map((value, index) => value + offsets[index].finalOffset)),
    requested: Object.freeze(identities.map((identity) => requestedJitterOffsetV1({
      target,
      channel,
      seed,
      identity
    }, maximum))),
    offsets: Object.freeze(offsets.map(item => item.finalOffset)),
    clampedItemCount: offsets.filter(item => item.clamped).length
  });
}
