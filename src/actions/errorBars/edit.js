import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateKeys } from "../../core/validation.js";
import { findLayer, resolveEligibleLayer } from "../../selectors/layers.js";
import { planIntervalEdit } from "../data/intervalEdit.js";
import {
  ERROR_BAR_APPEARANCE_OPTIONS,
  ERROR_BAR_EDIT_OPTIONS,
  resolveErrorBarAppearance
} from "./options.js";

const REMATERIALIZE_OPTIONS = Object.freeze(["id"]);

function resolveOwner(program, requested) {
  const target = requested === undefined
    ? undefined
    : validateUserId(requested, "Error-bar id");
  return resolveEligibleLayer(program, {
    target,
    label: "error bar",
    predicate: layer =>
      layer.mark?.type === "rule" &&
      program.markConfigs[layer.id]?.errorBar !== undefined
  });
}

function removeCap(program, id) {
  if (findLayer(program, id) === undefined) return program;
  return program
    .editSemantic({ property: `layer[${id}]`, remove: true })
    .editGraphics({ target: id, remove: true })
    ._withoutMaterializationConfig(["marks", id]);
}

function capArgs(config, id, intervalField) {
  return {
    id,
    data: config.data,
    orientation: config.orientation,
    positionField: config.positionField,
    positionFieldType: config.positionFieldType,
    intervalField,
    coordinate: config.coordinate,
    positionScale: config.positionScale,
    intervalScale: config.intervalScale,
    capSize: config.capSize,
    stroke: config.stroke,
    strokeWidth: config.strokeWidth,
    strokeDash: config.strokeDash,
    opacity: config.opacity
  };
}

function rematerializeRuleAppearance(program, id, config, fixedSpan) {
  return program
    .editSemantic({
      property: `layer[${id}].encoding.strokeDash.datum`,
      value: config.strokeDash
    })
    ._withMarkConfig(id, {
      ...program.markConfigs[id],
      stroke: config.stroke,
      strokeWidth: config.strokeWidth,
      strokeDash: config.strokeDash,
      opacity: config.opacity,
      ...(fixedSpan === undefined ? {} : { fixedSpan })
    })
    .rematerializeRuleMark({ id });
}

export const rematerializeErrorBar = action(
  {
    op: "rematerializeErrorBar",
    description: "Reconcile one error bar and its owned caps."
  },
  function (args = {}) {
    validateKeys(args, REMATERIALIZE_OPTIONS, "rematerializeErrorBar");
    const id = validateUserId(args.id, "Error-bar id");
    const layer = findLayer(this, id);
    const config = this.markConfigs[id]?.errorBar;
    if (layer?.mark?.type !== "rule" || config === undefined) {
      throw new Error(`Unknown error bar "${id}".`);
    }
    let next = rematerializeRuleAppearance(this, id, config);
    const capDefinitions = [
      [config.lowerCapId, config.lowerField],
      [config.upperCapId, config.upperField]
    ];
    if (!config.caps) {
      for (const [capId] of capDefinitions) next = removeCap(next, capId);
      return next;
    }
    const span = {
      orientation: config.orientation === "vertical" ? "horizontal" : "vertical",
      size: config.capSize
    };
    for (const [capId, field] of capDefinitions) {
      if (findLayer(next, capId) === undefined) {
        next = next.createErrorBarCap(capArgs(config, capId, field));
      } else {
        next = rematerializeRuleAppearance(next, capId, config, span);
      }
    }
    return next;
  }
);

export const editErrorBar = action(
  {
    op: "editErrorBar",
    description: "Edit one error bar and its owned cap appearance."
  },
  function (args = {}) {
    validateKeys(args, ERROR_BAR_EDIT_OPTIONS, "editErrorBar");
    const editable = ERROR_BAR_EDIT_OPTIONS.filter(option => option !== "target");
    if (!editable.some(option => Object.hasOwn(args, option))) {
      throw new Error("editErrorBar requires at least one change.");
    }
    const owner = resolveOwner(this, args.target);
    const current = this.markConfigs[owner.id].errorBar;
    const appearanceArgs = Object.fromEntries(
      ERROR_BAR_APPEARANCE_OPTIONS
        .filter(key => Object.hasOwn(args, key))
        .map(key => [key, args[key]])
    );
    const appearance = resolveErrorBarAppearance(appearanceArgs, {
      defaults: current,
      operation: "editErrorBar"
    });
    const interval = Object.hasOwn(args, "statistics")
      ? planIntervalEdit(this, {
          owner: owner.id,
          data: current.data,
          consumers: [
            owner.id,
            ...[current.lowerCapId, current.upperCapId]
              .filter(id => findLayer(this, id) !== undefined)
          ],
          statistics: args.statistics,
          operation: "editErrorBar"
        })
      : { changed: false };

    const applyEdit = program => {
      let next = program;
      if (interval.changed) {
        next = next.createIntervalData(interval.dataArgs);
        for (const rebind of interval.revision.rebinds) {
          next = next.rebindLayerData(rebind);
        }
      }
      next = next._withMarkConfig(owner.id, {
        ...next.markConfigs[owner.id],
        errorBar: {
          ...current,
          ...appearance,
          ...(interval.changed ? { data: interval.revision.id } : {})
        }
      }).rematerializeErrorBar({ id: owner.id });
      return interval.changed
        ? next.releaseDerivedData(interval.revision.release)
        : next;
    };
    if (interval.changed) applyEdit(this);
    return applyEdit(this);
  }
);
