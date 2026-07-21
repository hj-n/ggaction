import { validateUserId } from "../../../core/identifiers.js";
import { isPlainObject } from "../../../core/immutable.js";
import { validateDatasetTransforms } from "../../../grammar/transforms.js";
import { hasDataset } from "../../../selectors/datasets.js";

export function validateDatasetSemanticValue(program, parsed, value) {
  const property = parsed.path[0];
  if (property === "values") {
    if (!Array.isArray(value) || !value.every(isPlainObject)) {
      throw new TypeError("Dataset values must be an array of plain row objects.");
    }
    return;
  }
  if (property === "source") {
    validateUserId(value, "Dataset source id");
    if (!hasDataset(program, value)) {
      throw new Error(`Unknown source dataset "${value}".`);
    }
    return;
  }
  if (property === "transform") validateDatasetTransforms(value);
}
