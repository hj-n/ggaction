import {
  cloneAndFreeze,
  freezeOwned,
  isOwned,
  isPlainObject
} from "./immutable.js";

export function ownProgramState(value) {
  return isOwned(value) ? value : cloneAndFreeze(value);
}

export function ownChildPrograms(children, ProgramClass) {
  if (!isPlainObject(children)) {
    throw new TypeError("ChartProgram children must be a plain object.");
  }
  if (isOwned(children)) return children;
  const owned = {};
  for (const [id, program] of Object.entries(children)) {
    if (typeof id !== "string" || id.length === 0) {
      throw new TypeError("ChartProgram child IDs must be non-empty strings.");
    }
    if (!(program instanceof ProgramClass)) {
      throw new TypeError(`ChartProgram child "${id}" must be a ChartProgram.`);
    }
    owned[id] = program;
  }
  return freezeOwned(owned);
}
