import { action } from "../core/action.js";
import {
  cloneAndFreeze,
  freezeOwned,
  isPlainObject
} from "../core/immutable.js";
import { parseSemanticPath } from "../core/semanticPath.js";
import {
  isDrawableGraphicType,
  validateGraphicType
} from "../core/graphicSchema.js";

const CONTEXT_KEYS = Object.freeze({
  dataset: "currentData",
  layer: "currentMark",
  scale: "currentScale",
  coordinate: "currentCoordinate",
  guide: "currentGuide"
});

const MARK_TYPES = new Set(["point", "line", "bar", "area"]);
const GRAPHIC_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function setNestedProperty(source, path, value) {
  const [key, ...rest] = path;

  if (rest.length === 0) {
    return freezeOwned({ ...source, [key]: cloneAndFreeze(value) });
  }

  const child = isPlainObject(source[key]) ? source[key] : {};
  return freezeOwned({
    ...source,
    [key]: setNestedProperty(child, rest, value)
  });
}

function updateEntity(spec, parsed, value) {
  const collection = spec[parsed.collection];
  const index = collection.findIndex(item => item.id === parsed.id);

  if (
    parsed.kind === "dataset" &&
    index !== -1 &&
    Object.hasOwn(collection[index], "values")
  ) {
    throw new Error(`Dataset "${parsed.id}" is immutable after creation.`);
  }

  const current = index === -1 ? { id: parsed.id } : collection[index];
  const updated = setNestedProperty(current, parsed.path, value);
  const nextCollection = [...collection];

  if (index === -1) {
    nextCollection.push(updated);
  } else {
    nextCollection[index] = updated;
  }

  return freezeOwned({
    ...spec,
    [parsed.collection]: freezeOwned(nextCollection)
  });
}

function updateGuides(spec, parsed, value) {
  return freezeOwned({
    ...spec,
    guides: setNestedProperty(spec.guides, parsed.path, value)
  });
}

function validateSemanticValue(parsed, value) {
  if (parsed.kind === "dataset" && parsed.path[0] === "values") {
    if (!Array.isArray(value) || !value.every(isPlainObject)) {
      throw new TypeError("Dataset values must be an array of plain row objects.");
    }
  }

  if (
    parsed.kind === "layer" &&
    parsed.path.join(".") === "mark.type" &&
    !MARK_TYPES.has(value)
  ) {
    throw new Error(`Unknown mark type "${value}".`);
  }
}

const editSemantic = action(
  {
    op: "editSemantic",
    description: "Create or replace one semantic property."
  },
  function ({ property, value } = {}) {
    if (value === undefined) {
      throw new TypeError("editSemantic requires a value.");
    }

    const parsed = parseSemanticPath(property);
    validateSemanticValue(parsed, value);

    const semanticSpec =
      parsed.kind === "guide"
        ? updateGuides(this.semanticSpec, parsed, value)
        : updateEntity(this.semanticSpec, parsed, value);
    const context = freezeOwned({
      ...this.context,
      [CONTEXT_KEYS[parsed.kind]]: parsed.id
    });

    return this._clone({ semanticSpec, context });
  }
);

function createGraphicDefinition({ id, type, length }) {
  if (length === undefined) {
    return freezeOwned({
      type,
      properties: freezeOwned({})
    });
  }

  return freezeOwned({
    type,
    children: freezeOwned(
      Array.from({ length }, (_, index) =>
        freezeOwned({
          id: `${id}:${index}`,
          properties: freezeOwned({})
        })
      )
    )
  });
}

function hasEquivalentGraphicDefinition(existing, { type, length }) {
  if (existing.type !== type) {
    return false;
  }

  if (length === undefined) {
    return !Object.hasOwn(existing, "children");
  }

  return existing.children?.length === length;
}

const createGraphics = action(
  {
    op: "createGraphics",
    description: "Create a concrete graphic or homogeneous collection."
  },
  function ({ id, type, length } = {}) {
    if (typeof id !== "string" || !GRAPHIC_ID_PATTERN.test(id)) {
      throw new TypeError(
        "createGraphics requires an id containing only letters, numbers, _ or -."
      );
    }

    const validatedType = validateGraphicType(type);

    if (
      length !== undefined &&
      (!Number.isInteger(length) || length < 0)
    ) {
      throw new TypeError("createGraphics length must be a non-negative integer.");
    }

    if (length !== undefined && !isDrawableGraphicType(validatedType)) {
      throw new Error(`Graphic type "${validatedType}" does not accept length.`);
    }

    const existing = this.graphicSpec.objects[id];

    if (existing !== undefined) {
      if (hasEquivalentGraphicDefinition(existing, { type: validatedType, length })) {
        return this;
      }

      throw new Error(`Graphic "${id}" already exists with a different definition.`);
    }

    const graphicSpec = freezeOwned({
      objects: freezeOwned({
        ...this.graphicSpec.objects,
        [id]: createGraphicDefinition({ id, type: validatedType, length })
      }),
      order: freezeOwned([...this.graphicSpec.order, id])
    });

    return this._clone({ graphicSpec });
  }
);

export function registerPrimitiveActions(ProgramClass) {
  ProgramClass.prototype.editSemantic = editSemantic;
  ProgramClass.prototype.createGraphics = createGraphics;
}
