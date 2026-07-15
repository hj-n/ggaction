import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import {
  mapLinearValues,
  mapOrdinalPositionValues,
  mapOrdinalValues,
  normalizeStrokeDashPattern
} from "../../grammar/scales.js";
import { deriveRuleValues, resolveRuleMode } from "../../grammar/rules.js";
import { resolveGraphicBounds } from "../../layout/canvas.js";
import { findDataset } from "../../selectors/datasets.js";
import { findLayer } from "../../selectors/layers.js";
import { DEFAULT_COLORS } from "../../theme/defaults.js";
import {
  assertMarkAvailable,
  resolveMarkData,
  resolveMarkId,
  validateMarkOptions
} from "./shared.js";

const CREATE_OPTIONS = Object.freeze(["id", "data"]);
const REMATERIALIZE_OPTIONS = Object.freeze(["id"]);
const DEFAULT_RULE_CONFIG = Object.freeze({
  stroke: DEFAULT_COLORS.mark,
  strokeWidth: 2,
  strokeDash: Object.freeze([]),
  opacity: 1
});

function mapPosition(values, scale) {
  return scale.type === "ordinal"
    ? mapOrdinalPositionValues(values, scale)
    : mapLinearValues(values, scale.domain, scale.range, {
        clamp: scale.clamp ?? false
      });
}

function requireRule(program, id) {
  const layer = findLayer(program, id);
  if (layer?.mark?.type !== "rule") {
    throw new Error(`Unknown rule mark "${id}".`);
  }
  const dataset = findDataset(program, layer.data);
  if (dataset === undefined) {
    throw new Error(`Rule mark "${id}" requires an existing dataset.`);
  }
  const graphic = program.graphicSpec.objects[id];
  if (graphic?.type !== "line" || graphic.children === undefined) {
    throw new Error(`Rule mark "${id}" requires line collection graphics.`);
  }
  return { dataset, graphic, layer };
}

function validateEndpointBindings(layer) {
  if (
    layer.encoding?.x2 !== undefined &&
    layer.encoding.x2.scale !== layer.encoding?.x?.scale
  ) {
    throw new Error(`Rule mark "${layer.id}" requires x and x2 to share one scale.`);
  }
  if (
    layer.encoding?.y2 !== undefined &&
    layer.encoding.y2.scale !== layer.encoding?.y?.scale
  ) {
    throw new Error(`Rule mark "${layer.id}" requires y and y2 to share one scale.`);
  }
}

const createRuleMark = action(
  {
    op: "createRuleMark",
    description: "Create a semantic rule mark and empty line collection."
  },
  function (args = {}) {
    validateMarkOptions(args, CREATE_OPTIONS, "createRuleMark");
    const id = resolveMarkId(this, args.id, {
      defaultId: "rule",
      label: "Rule mark id",
      markType: "rule",
      operation: "createRuleMark"
    });
    const { data } = resolveMarkData(this, args);
    assertMarkAvailable(this, id);

    return this
      .editSemantic({ property: `layer[${id}].mark.type`, value: "rule" })
      .editSemantic({ property: `layer[${id}].data`, value: data })
      .createGraphics({ id, type: "line", length: 0 })
      ._withMarkConfig(id, DEFAULT_RULE_CONFIG);
  }
);

const rematerializeRuleMark = action(
  {
    op: "rematerializeRuleMark",
    description: "Recompute concrete rule endpoints and appearance."
  },
  function (args = {}) {
    validateMarkOptions(args, REMATERIALIZE_OPTIONS, "rematerializeRuleMark");
    const id = validateUserId(args.id, "Rule mark id");
    const { dataset, graphic, layer } = requireRule(this, id);
    validateEndpointBindings(layer);
    const mode = resolveRuleMode(layer);
    if (mode === undefined) {
      return graphic.children.length === 0
        ? this
        : this.editGraphics({ target: id, property: "length", value: 0 });
    }

    const scaleIds = [...new Set(
      ["x", "y", "x2", "y2", "strokeDash", "opacity"]
        .map(channel => layer.encoding?.[channel]?.scale)
        .filter(scale => scale !== undefined)
    )];
    let resolved = this;
    for (const scaleId of scaleIds) {
      resolved = resolved.rematerializeScale({ id: scaleId });
    }

    const derived = deriveRuleValues(dataset.values, layer);
    const mapped = {};
    for (const channel of ["x", "y", "x2", "y2"]) {
      const encoding = layer.encoding?.[channel];
      if (encoding === undefined) continue;
      mapped[channel] = mapPosition(
        derived.values[channel],
        resolved.resolvedScales[encoding.scale]
      );
    }
    const bounds = resolveGraphicBounds(resolved);
    const x1 = [];
    const y1 = [];
    const x2 = [];
    const y2 = [];
    for (let index = 0; index < derived.length; index += 1) {
      if (mode === "vertical-span") {
        x1.push(mapped.x[index]);
        y1.push(bounds.y);
        x2.push(mapped.x[index]);
        y2.push(bounds.y + bounds.height);
      } else if (mode === "horizontal-span") {
        x1.push(bounds.x);
        y1.push(mapped.y[index]);
        x2.push(bounds.x + bounds.width);
        y2.push(mapped.y[index]);
      } else if (mode === "vertical-interval") {
        x1.push(mapped.x[index]);
        y1.push(mapped.y[index]);
        x2.push(mapped.x[index]);
        y2.push(mapped.y2[index]);
      } else if (mode === "horizontal-interval") {
        x1.push(mapped.x[index]);
        y1.push(mapped.y[index]);
        x2.push(mapped.x2[index]);
        y2.push(mapped.y[index]);
      } else {
        x1.push(mapped.x[index]);
        y1.push(mapped.y[index]);
        x2.push(mapped.x2[index]);
        y2.push(mapped.y2[index]);
      }
    }

    const config = resolved.markConfigs[id] ?? DEFAULT_RULE_CONFIG;
    const dashEncoding = layer.encoding?.strokeDash;
    const opacityEncoding = layer.encoding?.opacity;
    const strokeDash = dashEncoding?.scale === undefined
      ? Array.from(
          { length: derived.length },
          () => normalizeStrokeDashPattern(
            dashEncoding?.datum ?? config.strokeDash
          )
        )
      : mapOrdinalValues(
          derived.values.strokeDash,
          resolved.resolvedScales[dashEncoding.scale].domain,
          resolved.resolvedScales[dashEncoding.scale].range
        );
    const opacity = opacityEncoding?.scale === undefined
      ? config.opacity
      : mapLinearValues(
          derived.values.opacity,
          resolved.resolvedScales[opacityEncoding.scale].domain,
          resolved.resolvedScales[opacityEncoding.scale].range,
          { clamp: resolved.resolvedScales[opacityEncoding.scale].clamp ?? false }
        );

    return resolved
      .editGraphics({ target: id, property: "length", value: derived.length })
      .editGraphics({ target: id, property: "x1", value: x1 })
      .editGraphics({ target: id, property: "y1", value: y1 })
      .editGraphics({ target: id, property: "x2", value: x2 })
      .editGraphics({ target: id, property: "y2", value: y2 })
      .editGraphics({ target: id, property: "stroke", value: config.stroke })
      .editGraphics({
        target: id,
        property: "strokeWidth",
        value: config.strokeWidth
      })
      .editGraphics({ target: id, property: "strokeDash", value: strokeDash })
      .editGraphics({ target: id, property: "opacity", value: opacity });
  }
);

export function registerRuleMarkActions(ProgramClass) {
  ProgramClass.prototype.createRuleMark = createRuleMark;
  ProgramClass.prototype.rematerializeRuleMark = rematerializeRuleMark;
}
