import { action } from "../../core/action.js";
import { isPlainObject } from "../../core/immutable.js";
import { validateUserId } from "../../core/identifiers.js";
import {
  validateOptionObject,
  validateNonEmptyString,
  validateUnitInterval
} from "../../core/validation.js";
import { validateCurveInterpolation } from "../../grammar/curveCommands.js";
import { findLayer, resolveEligibleLayer } from "../../selectors/layers.js";
import { DEFAULT_COLORS } from "../../theme/defaults.js";
import { planIntervalEdit } from "../data/intervalEdit.js";
import {
  ERROR_BAND_BOUNDARY_OPTIONS,
  resolveBoundaryAppearance
} from "./options.js";

const EDIT_OPTIONS = Object.freeze([
  "target", "fill", "opacity", "curve", "statistics", "boundaries"
]);
const BOUNDARY_EDIT_OPTIONS = Object.freeze([
  "target", "boundary", ...ERROR_BAND_BOUNDARY_OPTIONS
]);
const REMATERIALIZE_OPTIONS = Object.freeze([
  "id", ...ERROR_BAND_BOUNDARY_OPTIONS
]);

function resolveOwner(program, requested) {
  const target = requested === undefined
    ? undefined
    : validateUserId(requested, "Error-band id");
  return resolveEligibleLayer(program, {
    target,
    label: "error band",
    predicate: layer =>
      layer.mark?.type === "area" &&
      program.markConfigs[layer.id]?.errorBand !== undefined
  });
}

function currentBoundaryAppearance(program, id) {
  const config = program.markConfigs[id];
  if (findLayer(program, id)?.mark?.type !== "line" || config === undefined) {
    throw new Error(`Unknown error-band boundary "${id}".`);
  }
  return {
    stroke: config.stroke,
    strokeWidth: config.strokeWidth,
    strokeDash: config.strokeDash,
    opacity: config.opacity,
    curve: config.curve ?? "linear"
  };
}

function defaultBoundaryAppearance(program, owner) {
  return resolveBoundaryAppearance({}, {
    defaults: {
      stroke: DEFAULT_COLORS.mark,
      strokeWidth: 1,
      strokeDash: "solid",
      opacity: 1,
      curve: program.markConfigs[owner]?.curve ?? "linear"
    },
    operation: "editErrorBand boundaries"
  });
}

function createBoundary(program, owner, id, bound, appearance) {
  const config = program.markConfigs[owner].errorBand;
  const next = program.createErrorBandBoundary({
    id,
    data: config.data,
    orientation: config.orientation,
    bound,
    position: config.position,
    coordinate: config.coordinate,
    intervalScale: config.intervalScale,
    positionScale: config.positionScale,
    groupBy: config.groupBy,
    ...appearance
  });
  return next._withMarkConfig(id, {
    ...next.markConfigs[id],
    ...appearance,
    errorBandBoundary: {
      owner,
      bound: id === config.lowerBoundaryId ? "lower" : "upper"
    }
  });
}

function removeBoundary(program, id) {
  if (findLayer(program, id) === undefined) return program;
  const selectionIds = Object.entries(
    program.materializationConfigs.selections ?? {}
  ).filter(([, config]) => config.target === id).map(([selection]) => selection);
  let next = program;
  for (const [highlight, config] of Object.entries(
    program.materializationConfigs.highlights ?? {}
  )) {
    if (config.target === id || selectionIds.includes(config.selection)) {
      next = next._withoutMaterializationConfig(["highlights", highlight]);
    }
  }
  for (const selection of selectionIds) {
    next = next._withoutMaterializationConfig(["selections", selection]);
  }
  return next
    .editSemantic({ property: `layer[${id}]`, remove: true })
    .editGraphics({ target: id, remove: true })
    ._withoutMaterializationConfig(["marks", id])
    ._withContext({
      ...(program.context.currentMark === id ? { currentMark: undefined } : {}),
      ...(selectionIds.includes(program.context.currentSelection)
        ? { currentSelection: undefined }
        : {})
    });
}

export const rematerializeErrorBandBoundary = action(
  {
    op: "rematerializeErrorBandBoundary",
    description: "Rematerialize one owned error-band boundary."
  },
  function (args = {}) {
    validateOptionObject(
      args,
      REMATERIALIZE_OPTIONS,
      "rematerializeErrorBandBoundary"
    );
    const id = validateUserId(args.id, "Error-band boundary id");
    currentBoundaryAppearance(this, id);
    const graphic = this.graphicSpec.objects[id];
    const next = this
      ._withMarkConfig(id, {
        ...this.markConfigs[id],
        stroke: args.stroke,
        strokeWidth: args.strokeWidth,
        strokeDash: args.strokeDash,
        opacity: args.opacity,
        curve: args.curve
      })
      .editGraphics({
        target: id,
        property: "strokeDash",
        value: graphic.items.map(() => args.strokeDash)
      });
    return next.rematerializeLineMark({ id });
  }
);

export const editErrorBand = action(
  {
    op: "editErrorBand",
    description: "Edit one error-band body appearance."
  },
  function (args = {}) {
    validateOptionObject(args, EDIT_OPTIONS, "editErrorBand");
    if (!["fill", "opacity", "curve", "statistics", "boundaries"]
      .some(key => Object.hasOwn(args, key))) {
      throw new Error("editErrorBand requires at least one change.");
    }
    const owner = resolveOwner(this, args.target);
    const config = { ...this.markConfigs[owner.id] };
    const errorBand = { ...config.errorBand };
    if (Object.hasOwn(args, "fill")) {
      errorBand.fill = validateNonEmptyString(args.fill, "Error-band fill");
    }
    if (Object.hasOwn(args, "opacity")) {
      config.opacity = validateUnitInterval(args.opacity, "Error-band opacity");
    }
    if (Object.hasOwn(args, "curve")) {
      config.curve = validateCurveInterpolation(args.curve);
    }
    const interval = Object.hasOwn(args, "statistics")
      ? planIntervalEdit(this, {
          owner: owner.id,
          data: errorBand.data,
          consumers: [
            owner.id,
            ...[errorBand.lowerBoundaryId, errorBand.upperBoundaryId]
              .filter(id => findLayer(this, id) !== undefined)
          ],
          statistics: args.statistics,
          operation: "editErrorBand"
        })
      : { changed: false };
    if (
      Object.hasOwn(args, "boundaries") &&
      args.boundaries !== false &&
      !isPlainObject(args.boundaries)
    ) {
      throw new TypeError(
        "editErrorBand boundaries must be false or a plain object."
      );
    }

    const applyEdit = program => {
      let next = program;
      if (interval.changed) {
        next = next.createIntervalData(interval.dataArgs);
        for (const rebind of interval.revision.rebinds) {
          next = next.rebindLayerData(rebind);
        }
        errorBand.data = interval.revision.id;
      }
      next = next
        ._withMarkConfig(owner.id, { ...config, errorBand })
        .rematerializeAreaMark({ id: owner.id });
      if (Object.hasOwn(args, "boundaries")) {
        if (args.boundaries === false) {
          next = removeBoundary(next, errorBand.lowerBoundaryId);
          next = removeBoundary(next, errorBand.upperBoundaryId);
        } else if (Object.keys(args.boundaries).length === 0) {
          for (const [id, bound] of [
            [errorBand.lowerBoundaryId, errorBand.lowerField],
            [errorBand.upperBoundaryId, errorBand.upperField]
          ]) {
            next = findLayer(next, id) === undefined
              ? createBoundary(
                  next,
                  owner.id,
                  id,
                  bound,
                  defaultBoundaryAppearance(next, owner.id)
                )
              : interval.changed
                ? next.rematerializeLineMark({ id })
                : next;
          }
        } else {
          next = next.editErrorBandBoundary({
            target: owner.id,
            ...args.boundaries
          });
        }
      } else if (interval.changed) {
        for (const id of [errorBand.lowerBoundaryId, errorBand.upperBoundaryId]) {
          if (findLayer(next, id) !== undefined) {
            next = next.rematerializeLineMark({ id });
          }
        }
      }
      return interval.changed
        ? next.releaseDerivedData(interval.revision.release)
        : next;
    };
    if (interval.changed || Object.hasOwn(args, "boundaries")) applyEdit(this);
    return applyEdit(this);
  }
);

export const editErrorBandBoundary = action(
  {
    op: "editErrorBandBoundary",
    description: "Edit one or both owned error-band boundaries."
  },
  function (args = {}) {
    validateOptionObject(
      args,
      BOUNDARY_EDIT_OPTIONS,
      "editErrorBandBoundary"
    );
    if (!ERROR_BAND_BOUNDARY_OPTIONS.some(key => Object.hasOwn(args, key))) {
      throw new Error("editErrorBandBoundary requires an appearance change.");
    }
    const boundary = args.boundary ?? "both";
    if (!["both", "lower", "upper"].includes(boundary)) {
      throw new Error(`Unsupported error-band boundary "${boundary}".`);
    }
    const owner = resolveOwner(this, args.target);
    const config = this.markConfigs[owner.id].errorBand;
    const patch = Object.fromEntries(
      ERROR_BAND_BOUNDARY_OPTIONS
        .filter(key => Object.hasOwn(args, key))
        .map(key => [key, args[key]])
    );
    const ids = boundary === "both"
      ? [config.lowerBoundaryId, config.upperBoundaryId]
      : [boundary === "lower" ? config.lowerBoundaryId : config.upperBoundaryId];
    const plans = ids.map(id => {
      const existing = findLayer(this, id) !== undefined;
      return {
        id,
        existing,
        bound: id === config.lowerBoundaryId
          ? config.lowerField
          : config.upperField,
        appearance: resolveBoundaryAppearance(patch, {
          defaults: existing
            ? currentBoundaryAppearance(this, id)
            : defaultBoundaryAppearance(this, owner.id),
          operation: "editErrorBandBoundary"
        })
      };
    });
    let next = this;
    for (const plan of plans) {
      next = plan.existing
        ? next.rematerializeErrorBandBoundary({
            id: plan.id,
            ...plan.appearance
          })
        : createBoundary(
            next,
            owner.id,
            plan.id,
            plan.bound,
            plan.appearance
          );
    }
    return next;
  }
);
