const DRAWABLE_TYPES = new Set(["circle", "rect", "line", "text", "path"]);
const STRUCTURAL_TYPES = new Set(["canvas", "container"]);

export function validateGraphicType(type) {
  if (!DRAWABLE_TYPES.has(type) && !STRUCTURAL_TYPES.has(type)) {
    throw new Error(`Unknown graphic type "${type}".`);
  }

  return type;
}

export function isDrawableGraphicType(type) {
  return DRAWABLE_TYPES.has(type);
}

export function isStructuralGraphicType(type) {
  return STRUCTURAL_TYPES.has(type);
}

export function validateGraphicProperty() {
  throw new Error("validateGraphicProperty() is not implemented yet.");
}
