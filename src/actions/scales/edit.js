import { action } from "../../core/action.js";
import { isPlainObject } from "../../core/immutable.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateKeys } from "../../core/validation.js";
import {
  validateColorRange,
  validateOrdinalDomain,
  validateScaleDomain,
  validateScaleRange,
  validateShapeRange,
  validateSizeRange,
  validateStrokeDashRange
} from "../../grammar/scales.js";
import { getMarkMaterializationStep } from "../../materialization/marks.js";
import {
  applyMaterializationPlan
} from "../../materialization/dependencies.js";
import { requireSemanticScale } from "../../selectors/scales.js";
import { findScaleConsumers } from "./consumers.js";

const OPTIONS = Object.freeze([
  "id", "domain", "range", "nice", "zero", "clamp", "reverse"
]);
const EDITABLE = Object.freeze(OPTIONS.filter(option => option !== "id"));

function resolveScaleId(program, requested) {
  if (requested !== undefined) {
    const id = validateUserId(requested, "Scale id");
    requireSemanticScale(program, id);
    return id;
  }

  const current = program.context.currentScale;
  if (
    typeof current === "string" &&
    program.semanticSpec.scales.some(scale => scale.id === current)
  ) {
    return current;
  }
  if (program.semanticSpec.scales.length === 1) {
    return program.semanticSpec.scales[0].id;
  }
  throw new Error(
    "editScale requires id when no unique current scale can be inferred."
  );
}

function normalizeChannel(channel) {
  return channel === "x2" ? "x" : channel === "y2" ? "y" : channel;
}

function resolveChannel(consumers, id) {
  const channels = new Set(
    consumers.map(consumer => normalizeChannel(consumer.channel))
  );
  if (channels.size > 1) {
    throw new Error(`Scale "${id}" cannot be shared across channels.`);
  }
  return channels.values().next().value;
}

function validateRangeForChannel(scale, channel, value) {
  if (value === "auto") return value;
  if (scale.type !== "ordinal") return validateScaleRange(value);
  if (channel === "color") return validateColorRange(value);
  if (channel === "shape") return validateShapeRange(value);
  if (channel === "strokeDash") return validateStrokeDashRange(value);
  if (channel === "size") return validateSizeRange(value);
  return validateScaleRange(value);
}

function normalizePatch(scale, channel, args) {
  const patch = {};
  if (Object.hasOwn(args, "domain")) {
    patch.domain = scale.type === "ordinal"
      ? validateOrdinalDomain(args.domain)
      : validateScaleDomain(args.domain);
  }
  if (Object.hasOwn(args, "range")) {
    patch.range = validateRangeForChannel(scale, channel, args.range);
  }
  for (const property of ["nice", "zero", "clamp", "reverse"]) {
    if (!Object.hasOwn(args, property)) continue;
    if (typeof args[property] !== "boolean") {
      throw new TypeError(`Scale ${property} must be a boolean.`);
    }
    patch[property] = args[property];
  }
  if (scale.type === "ordinal") {
    for (const property of ["nice", "zero", "clamp"]) {
      if (Object.hasOwn(patch, property)) {
        throw new Error(`Scale type "ordinal" does not support ${property}.`);
      }
    }
  }
  if (scale.type === "time" && Object.hasOwn(patch, "zero")) {
    throw new Error('Scale type "time" does not support zero.');
  }
  return patch;
}

function planMarkRematerialization(program, consumers) {
  const plan = [];
  const seen = new Set();
  for (const consumer of consumers) {
    const step = getMarkMaterializationStep(program, consumer.layer);
    if (step === undefined || seen.has(consumer.layer.id)) continue;
    const pointHandledByScale =
      consumer.layer.mark?.type === "point" &&
      !["size", "shape"].includes(consumer.channel) &&
      program.graphicSpec.objects[consumer.layer.id]?.type !== "collection";
    if (pointHandledByScale) continue;
    seen.add(consumer.layer.id);
    plan.push(step);
  }
  return plan;
}

export const editScale = action(
  {
    op: "editScale",
    description: "Edit an existing scale and rematerialize its consumers."
  },
  function (args = {}) {
    if (!isPlainObject(args)) {
      throw new TypeError("editScale options must be a plain object.");
    }
    validateKeys(args, OPTIONS, "editScale");
    if (!EDITABLE.some(property => Object.hasOwn(args, property))) {
      throw new Error("editScale requires at least one editable property.");
    }

    const id = resolveScaleId(this, args.id);
    const scale = requireSemanticScale(this, id);
    const consumers = findScaleConsumers(this, id);
    const channel = resolveChannel(consumers, id);
    const patch = normalizePatch(scale, channel, args);

    let next = this;
    for (const property of EDITABLE) {
      if (!Object.hasOwn(patch, property)) continue;
      next = next.editSemantic({
        property: `scale[${id}].${property}`,
        value: patch[property]
      });
    }
    if (consumers.length === 0) return next;

    next = next.rematerializeScale({ id });
    return applyMaterializationPlan(
      next,
      planMarkRematerialization(next, consumers)
    );
  }
);
