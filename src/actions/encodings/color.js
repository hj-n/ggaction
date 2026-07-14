import { action } from "../../core/action.js";
import {
  readNominalField,
  readQuantitativeField,
  readTemporalField,
  validateNominalFieldType
} from "../../grammar/scales.js";
import {
  BAR_GRAINS,
  inferBarColorLayout,
  resolveBarGrain
} from "../../grammar/bars/policy.js";
import {
  resolveColorScaleDefinition,
  resolveSequentialColorScaleDefinition
} from "../scales/definitions.js";
import {
  applyEncodingScale,
  resolveReassignmentScaleOptions,
  resolveTarget,
  validateLineSeriesCompatibility,
  validateOptions
} from "./shared.js";
import { applyMaterializationPlan } from "../../materialization/dependencies.js";
import { planEncodingRematerialization } from "../../materialization/encodings.js";

const COLOR_ENCODING_OPTIONS = Object.freeze([
  "field", "target", "fieldType", "scale", "layout"
]);

function encodeContinuousColor(program, args) {
  if (!["quantitative", "temporal"].includes(args.fieldType)) {
    throw new Error(`Unsupported color field type "${args.fieldType}".`);
  }
  if (args.layout !== undefined) {
    throw new Error("Continuous color does not support layout.");
  }
  const { id: target, dataset, layer } = resolveTarget(
    program,
    args.target,
    ["point"],
    "continuous color point mark"
  );
  if (args.fieldType === "temporal") {
    readTemporalField(dataset.values, args.field);
  } else {
    readQuantitativeField(dataset.values, args.field);
  }
  const requestedScale = resolveReassignmentScaleOptions(
    layer.encoding?.color,
    args.scale ?? {}
  );
  const scale = resolveSequentialColorScaleDefinition(
    program,
    args.fieldType,
    requestedScale
  );
  const next = program
    .editSemantic({
      property: `layer[${target}].encoding.color.field`,
      value: args.field
    })
    .editSemantic({
      property: `layer[${target}].encoding.color.fieldType`,
      value: args.fieldType
    })
    .editSemantic({
      property: `layer[${target}].encoding.color.scale`,
      value: scale.id
    })
    .setSequentialScale(scale);
  return applyMaterializationPlan(
    next,
    planEncodingRematerialization(next, {
      target,
      channel: "color",
      scale: scale.id
    })
  );
}

const encodeColor = action(
  {
    op: "encodeColor",
    description: "Encode a field as graphical color."
  },
  function (args = {}) {
    validateOptions(args, COLOR_ENCODING_OPTIONS, "encodeColor");
    const requestedFieldType = args.fieldType ?? "nominal";
    if (requestedFieldType !== "nominal") {
      return encodeContinuousColor(this, {
        ...args,
        fieldType: requestedFieldType
      });
    }
    const fieldType = validateNominalFieldType(requestedFieldType);
    const { id: target, dataset, layer } = resolveTarget(
      this,
      args.target,
      ["point", "line", "bar", "area"],
      "color mark"
    );
    if (
      args.layout !== undefined &&
      args.layout !== "group" &&
      args.layout !== "stack"
    ) {
      throw new Error(`Unsupported color layout "${args.layout}".`);
    }
    if (layer.mark.type !== "bar" && args.layout !== undefined) {
      throw new Error("Color layout is supported only for bar marks.");
    }
    if (
      layer.mark.type === "area" &&
      (layer.encoding?.group?.field === undefined ||
        layer.encoding.group.field !== args.field)
    ) {
      throw new Error(
        "Area color encoding must match an existing group encoding."
      );
    }
    validateLineSeriesCompatibility(layer, "color", args.field);

    const barGrain = resolveBarGrain(layer);
    const isHistogram = barGrain === BAR_GRAINS.histogram;
    const isOrdinalAggregate = barGrain === BAR_GRAINS.aggregate;
    const layout = args.layout ?? (
      layer.encoding?.color === undefined
        ? undefined
        : inferBarColorLayout(layer)
    );

    if (layer.mark.type === "bar") {
      if (isHistogram && layout !== undefined && layout !== "stack") {
        throw new Error('Histogram color layout must be "stack".');
      }
      if (isOrdinalAggregate && layout !== "group") {
        throw new Error('Ordinal aggregate bar color layout must be "group".');
      }
      if (!isHistogram && !isOrdinalAggregate) {
        throw new Error(
          "Bar color encoding requires a complete histogram encoding or a complete ordinal aggregate encoding."
        );
      }
    }
    readNominalField(dataset.values, args.field);
    const requestedScale = resolveReassignmentScaleOptions(
      layer.encoding?.color,
      args.scale ?? {}
    );
    const scale = resolveColorScaleDefinition(this, requestedScale);

    let next = this
      .editSemantic({
        property: `layer[${target}].encoding.color.field`,
        value: args.field
      })
      .editSemantic({
        property: `layer[${target}].encoding.color.fieldType`,
        value: fieldType
      })
      .editSemantic({
        property: `layer[${target}].encoding.color.scale`,
        value: scale.id
      });
    next = applyEncodingScale(next, scale, requestedScale, {
      reassignment: layer.encoding?.color?.scale === scale.id
    });

    if (isOrdinalAggregate) {
      next = next
        .editSemantic({
          property: `layer[${target}].encoding.y.stack`,
          value: null
        })
        .encodeXOffset({
          field: args.field,
          target,
          scale: {
            ...(layer.encoding?.xOffset?.scale === undefined
              ? {}
              : { id: layer.encoding.xOffset.scale }),
            domain: scale.domain
          }
        });
    }

    return applyMaterializationPlan(
      next,
      planEncodingRematerialization(next, {
        target,
        channel: "color",
        scale: scale.id
      })
    );
  }
);

export function registerColorEncodingAction(ProgramClass) {
  ProgramClass.prototype.encodeColor = encodeColor;
}
