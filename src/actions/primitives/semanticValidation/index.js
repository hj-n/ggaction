import { validateCoordinateType } from "../../../grammar/coordinates.js";
import { validateDatasetSemanticValue } from "./dataset.js";
import { validateGuideSemanticValue } from "./guide.js";
import { validateLayerSemanticValue } from "./layer.js";
import { validateScaleSemanticValue } from "./scale.js";
import { validateNonEmptySemanticString } from "./shared.js";

const VALIDATORS = Object.freeze({
  dataset: validateDatasetSemanticValue,
  layer: validateLayerSemanticValue,
  scale: validateScaleSemanticValue,
  coordinate(_program, parsed, value) {
    if (parsed.path[0] === "type") validateCoordinateType(value);
  },
  guide: validateGuideSemanticValue,
  title(_program, parsed, value) {
    validateNonEmptySemanticString(value, `Chart title ${parsed.path[0]}`);
  }
});

export function validateSemanticValue(program, parsed, value) {
  VALIDATORS[parsed.kind]?.(program, parsed, value);
}
