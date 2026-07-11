const ownedValues = new WeakSet();

export function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function freezeOwned(value) {
  if (value !== null && typeof value === "object") {
    Object.freeze(value);
    ownedValues.add(value);
  }

  return value;
}

export function isOwned(value) {
  return value !== null && typeof value === "object" && ownedValues.has(value);
}

export function cloneAndFreeze(value, ancestors = new WeakSet()) {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (ancestors.has(value)) {
    throw new TypeError("Cannot store cyclic values in a ChartProgram.");
  }

  ancestors.add(value);

  let clone;

  if (Array.isArray(value)) {
    clone = value.map(item => cloneAndFreeze(item, ancestors));
  } else if (isPlainObject(value)) {
    clone = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        cloneAndFreeze(item, ancestors)
      ])
    );
  } else {
    throw new TypeError("ChartProgram state only supports plain objects and arrays.");
  }

  ancestors.delete(value);
  return freezeOwned(clone);
}
