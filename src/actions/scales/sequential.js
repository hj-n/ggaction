import { action } from "../../core/action.js";
import { validateKeys } from "../../core/validation.js";
import { findSemanticScale } from "../../selectors/scales.js";

const OPTIONS = Object.freeze([
  "id",
  "type",
  "domain",
  "range",
  "interpolate",
  "clamp",
  "reverse"
]);

export const setSequentialScale = action(
  {
    op: "setSequentialScale",
    description: "Create or update an internal sequential color scale."
  },
  function (args = {}) {
    validateKeys(args, OPTIONS, "setSequentialScale");
    if (args.type !== "sequential") {
      throw new Error('setSequentialScale requires type "sequential".');
    }
    const existing = findSemanticScale(this, args.id);
    if (existing !== undefined && existing.type !== "sequential") {
      throw new Error(
        `Scale "${args.id}" cannot change type from "${existing.type}" to "sequential".`
      );
    }
    let next = this;
    for (const property of [
      "type", "domain", "range", "interpolate", "clamp", "reverse"
    ]) {
      if (!Object.hasOwn(args, property)) continue;
      if (existing?.[property] === args[property]) continue;
      next = next.editSemantic({
        property: `scale[${args.id}].${property}`,
        value: args[property]
      });
    }
    return next;
  }
);
