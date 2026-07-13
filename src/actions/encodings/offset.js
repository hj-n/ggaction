import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { isPlainObject } from "../../core/immutable.js";
import {
  readNominalField,
  validateNominalFieldType,
  validateOrdinalDomain,
  validateOrdinalScaleType,
  validateScaleRange
} from "../../grammar/scales.js";
import { resolveTarget, validateOptions } from "./shared.js";

const ENCODING_OPTIONS = Object.freeze(["field", "target", "fieldType", "scale"]);
const SCALE_OPTIONS = Object.freeze(["id", "type", "domain", "range"]);

function resolveOffsetScale(program, options) {
  if (!isPlainObject(options)) {
    throw new TypeError("Encoding scale must be a plain object.");
  }

  validateOptions(options, SCALE_OPTIONS, "scale");
  const id = validateUserId(options.id ?? "xOffset", "Scale id");
  const existing = program.semanticSpec.scales.find(item => item.id === id);

  return {
    id,
    type: validateOrdinalScaleType(
      options.type ?? existing?.type ?? "ordinal"
    ),
    domain: validateOrdinalDomain(
      options.domain ?? existing?.domain ?? "auto"
    ),
    range: validateScaleRange(
      options.range ?? existing?.range ?? "auto"
    )
  };
}

const encodeXOffset = action(
  {
    op: "encodeXOffset",
    description: "Encode a nominal field within each ordinal x band."
  },
  function (args = {}) {
    validateOptions(args, ENCODING_OPTIONS, "encodeXOffset");
    const fieldType = validateNominalFieldType(args.fieldType ?? "nominal");
    const { id: target, dataset, layer } = resolveTarget(
      this,
      args.target,
      ["bar"],
      "bar mark"
    );

    if (
      layer.encoding?.x?.fieldType !== "ordinal" ||
      layer.encoding.x.scale === undefined ||
      layer.encoding?.y?.aggregate !== "mean" ||
      layer.encoding.y.stack !== null
    ) {
      throw new Error(
        "encodeXOffset requires an ordinal x and mean/non-stacked y bar encoding."
      );
    }

    readNominalField(dataset.values, args.field);
    const scale = resolveOffsetScale(this, args.scale ?? {});

    return this
      .editSemantic({
        property: `layer[${target}].encoding.xOffset.field`,
        value: args.field
      })
      .editSemantic({
        property: `layer[${target}].encoding.xOffset.fieldType`,
        value: fieldType
      })
      .editSemantic({
        property: `layer[${target}].encoding.xOffset.scale`,
        value: scale.id
      })
      .createScale(scale)
      .rematerializeScale({ id: scale.id });
  }
);

export function registerOffsetEncodingAction(ProgramClass) {
  ProgramClass.prototype.encodeXOffset = encodeXOffset;
}
