import { action } from "../../core/action.js";
import { isPlainObject } from "../../core/immutable.js";
import { validateUserId } from "../../core/identifiers.js";
import { validateKeys } from "../../core/validation.js";
import { planDerivedDataRevision } from "../../materialization/dataProvenance.js";
import { findDataset } from "../../selectors/datasets.js";
import { findLayer } from "../../selectors/layers.js";
import { GRADIENT_PROFILE_FIELDS } from "../../grammar/gradientProfile.js";
import { removeGradientPlotLegend } from "./components.js";
import {
  assertDistributionScaleHandoff,
  clearCartesianPositions,
  rebindDistributionGuides,
  resolveDistributionScalePlan,
  setCartesianPosition,
  setCartesianRange
} from "../distributions/revision.js";
import {
  resolveGradientAppearance,
  resolveGradientCenter,
  resolveGradientDensity,
  resolveGradientPosition,
  resolveGradientWidth
} from "./options.js";
import {
  normalizeGradientPositionTypes,
  resolveGradientOwner
} from "./resolve.js";

const OPTIONS = Object.freeze([
  "target", "data", "x", "y", "density", "width", "gradient", "center"
]);

function patch(value, label) {
  if (!isPlainObject(value)) {
    throw new TypeError(`editGradientPlot ${label} must be a plain object.`);
  }
  return value;
}

function removeCenter(program, id) {
  let next = program;
  const selections = Object.entries(
    program.materializationConfigs.selections ?? {}
  ).filter(([, config]) => config.target === id).map(([selection]) => selection);
  for (const [highlight, config] of Object.entries(
    program.materializationConfigs.highlights ?? {}
  )) {
    if (config.target === id || selections.includes(config.selection)) {
      next = next._withoutMaterializationConfig(["highlights", highlight]);
    }
  }
  for (const selection of selections) {
    next = next._withoutMaterializationConfig(["selections", selection]);
  }
  if (findLayer(next, id) !== undefined) {
    next = next.editSemantic({ property: `layer[${id}]`, remove: true });
  }
  if (next.graphicSpec.objects[id] !== undefined) {
    next = next.editGraphics({ target: id, remove: true });
  }
  return next
    ._withoutMaterializationConfig(["marks", id])
    ._withContext({
      ...(program.context.currentMark === id ? { currentMark: undefined } : {}),
      ...(selections.includes(program.context.currentSelection)
        ? { currentSelection: undefined }
        : {})
    });
}

function currentGradientPositions(owner, current) {
  const categoryChannel = current.orientation === "vertical" ? "x" : "y";
  const measureChannel = current.orientation === "vertical" ? "y" : "x";
  const categoryEncoding = owner.encoding[categoryChannel];
  const measureEncoding = owner.encoding[measureChannel];
  return {
    x: current.orientation === "vertical"
      ? {
          field: current.category,
          fieldType: current.categoryType,
          scale: categoryEncoding.scale
        }
      : {
          field: current.measure,
          fieldType: "quantitative",
          scale: measureEncoding.scale
        },
    y: current.orientation === "vertical"
      ? {
          field: current.measure,
          fieldType: "quantitative",
          scale: measureEncoding.scale
        }
      : {
          field: current.category,
          fieldType: current.categoryType,
          scale: categoryEncoding.scale
        },
    categoryScale: categoryEncoding.scale,
    measureScale: measureEncoding.scale
  };
}

function requirePositionField(position, label) {
  if (typeof position?.field !== "string" || position.field.length === 0) {
    throw new TypeError(`${label} field must be a non-empty string.`);
  }
  return position;
}

function roleCandidate(program, owner, current, args) {
  const previous = currentGradientPositions(owner, current);
  const positions = normalizeGradientPositionTypes(
    requirePositionField(
      Object.hasOwn(args, "x")
        ? resolveGradientPosition(args.x, "x", "editGradientPlot")
        : previous.x,
      "editGradientPlot x"
    ),
    requirePositionField(
      Object.hasOwn(args, "y")
        ? resolveGradientPosition(args.y, "y", "editGradientPlot")
        : previous.y,
      "editGradientPlot y"
    )
  );
  if (positions.orientation === undefined) {
    throw new Error(
      "editGradientPlot requires one categorical axis and one quantitative axis."
    );
  }
  const xRoleScale = positions.orientation === "vertical"
    ? previous.categoryScale
    : previous.measureScale;
  const yRoleScale = positions.orientation === "vertical"
    ? previous.measureScale
    : previous.categoryScale;
  const xScale = resolveDistributionScalePlan(program, {
    channel: "x",
    fieldType: positions.x.fieldType,
    requested: positions.x.scale,
    fallback: xRoleScale,
    defaults: ["ordinal", "nominal"].includes(positions.x.fieldType)
      ? { discreteType: "band" }
      : {}
  });
  const yScale = resolveDistributionScalePlan(program, {
    channel: "y",
    fieldType: positions.y.fieldType,
    requested: positions.y.scale,
    fallback: yRoleScale,
    defaults: ["ordinal", "nominal"].includes(positions.y.fieldType)
      ? { discreteType: "band" }
      : {}
  });
  return {
    source: Object.hasOwn(args, "data")
      ? validateUserId(args.data, "Gradient-plot data id")
      : current.source,
    orientation: positions.orientation,
    x: { ...positions.x, scale: xScale.id },
    y: { ...positions.y, scale: yScale.id },
    xScale,
    yScale,
    category: positions.orientation === "vertical"
      ? positions.x.field
      : positions.y.field,
    categoryType: positions.orientation === "vertical"
      ? positions.x.fieldType
      : positions.y.fieldType,
    measure: positions.orientation === "vertical"
      ? positions.y.field
      : positions.x.field,
    previous
  };
}

function sameRoleCandidate(current, candidate) {
  return candidate.source === current.source &&
    candidate.orientation === current.orientation &&
    candidate.category === current.category &&
    candidate.categoryType === current.categoryType &&
    candidate.measure === current.measure &&
    candidate.xScale.id === candidate.previous.x.scale &&
    candidate.yScale.id === candidate.previous.y.scale &&
    candidate.xScale.edit === undefined &&
    candidate.yScale.edit === undefined;
}

function updateGradientPositions(program, owner, current, candidate, hasCenter) {
  const owned = [owner.id, ...(hasCenter ? [current.centerId] : [])];
  assertDistributionScaleHandoff(program, {
    owned,
    oldXScale: candidate.previous.x.scale,
    oldYScale: candidate.previous.y.scale,
    newXScale: candidate.xScale.id,
    newYScale: candidate.yScale.id
  });
  let next = program;
  for (const id of owned) next = clearCartesianPositions(next, id);
  for (const scale of [candidate.xScale, candidate.yScale]) {
    if (scale.create) next = next.createScale(scale.definition);
  }
  const category = candidate.orientation === "vertical" ? candidate.x : candidate.y;
  const measure = candidate.orientation === "vertical" ? candidate.y : candidate.x;
  const categoryChannel = candidate.orientation === "vertical" ? "x" : "y";
  const measureChannel = candidate.orientation === "vertical" ? "y" : "x";
  next = setCartesianPosition(next, owner.id, categoryChannel, {
    field: candidate.category,
    fieldType: candidate.categoryType,
    scale: category.scale
  });
  next = setCartesianRange(
    next,
    owner.id,
    measureChannel,
    GRADIENT_PROFILE_FIELDS.lower,
    GRADIENT_PROFILE_FIELDS.upper,
    measure.scale
  );
  if (hasCenter) {
    next = setCartesianPosition(next, current.centerId, categoryChannel, {
      field: candidate.category,
      fieldType: candidate.categoryType,
      scale: category.scale
    });
    next = setCartesianPosition(next, current.centerId, measureChannel, {
      field: GRADIENT_PROFILE_FIELDS.center,
      fieldType: "quantitative",
      scale: measure.scale
    })._withMarkConfig(current.centerId, {
      ...next.markConfigs[current.centerId],
      fixedSpan: {
        ...next.markConfigs[current.centerId].fixedSpan,
        orientation: candidate.orientation === "vertical"
          ? "horizontal"
          : "vertical"
      }
    });
  }
  for (const id of new Set([candidate.xScale.id, candidate.yScale.id])) {
    next = next.rematerializeScale({ id, marks: false, guides: false });
  }
  next = rebindDistributionGuides(next, {
    oldXScale: candidate.previous.x.scale,
    oldYScale: candidate.previous.y.scale,
    newXScale: candidate.xScale.id,
    newYScale: candidate.yScale.id,
    oldXTitle: candidate.previous.x.field,
    oldYTitle: candidate.previous.y.field,
    newXTitle: candidate.x.field,
    newYTitle: candidate.y.field,
    oldMeasureChannel: current.orientation === "vertical" ? "y" : "x",
    newMeasureChannel: candidate.orientation === "vertical" ? "y" : "x"
  });
  for (const scale of [candidate.xScale, candidate.yScale]) {
    if (scale.edit !== undefined) next = next.editScale(scale.edit);
  }
  return next;
}

export const editGradientPlot = action(
  {
    op: "editGradientPlot",
    description: "Edit one stable categorical gradient plot."
  },
  function (args = {}) {
    validateKeys(args, OPTIONS, "editGradientPlot");
    if (!OPTIONS.slice(1).some(key => Object.hasOwn(args, key))) {
      throw new Error("editGradientPlot requires at least one gradient-plot option.");
    }
    const owner = resolveGradientOwner(this, args.target, "editGradientPlot");
    const current = this.markConfigs[owner.id].gradientPlot;
    const density = Object.hasOwn(args, "density")
      ? resolveGradientDensity(patch(args.density, "density"), current.density, "editGradientPlot")
      : current.density;
    const width = Object.hasOwn(args, "width")
      ? resolveGradientWidth(patch(args.width, "width"), current.width, "editGradientPlot")
      : current.width;
    const gradient = Object.hasOwn(args, "gradient")
      ? resolveGradientAppearance(
          patch(args.gradient, "gradient"),
          current.gradient,
          "editGradientPlot"
        )
      : current.gradient;
    const center = Object.hasOwn(args, "center")
      ? resolveGradientCenter(
          args.center === false ? false : patch(args.center, "center"),
          current.center === false ? undefined : current.center,
          "editGradientPlot"
        )
      : current.center;
    const candidate = roleCandidate(this, owner, current, args);
    const sourceDataset = findDataset(this, candidate.source);
    if (sourceDataset === undefined) {
      throw new Error(`Unknown gradient-plot data "${candidate.source}".`);
    }
    const roleRequested = ["data", "x", "y"].some(
      key => Object.hasOwn(args, key)
    );
    const changesRoles = !sameRoleCandidate(current, candidate);
    if (changesRoles) {
      const hadCenter = findLayer(this, current.centerId) !== undefined;
      const revision = planDerivedDataRevision(this, {
        owner: owner.id,
        role: "ProfileData",
        previous: current.profileId,
        consumers: [owner.id, ...(hadCenter ? [current.centerId] : [])]
      });
      const applyEdit = program => {
        let next = program.createGradientProfileData({
          id: revision.id,
          source: candidate.source,
          category: candidate.category,
          field: candidate.measure,
          ...density,
          center: center === false ? "median" : center.type
        });
        for (const rebind of revision.rebinds) {
          next = next.rebindLayerData(rebind);
        }
        const profile = findDataset(next, revision.id);
        next = next._withMarkConfig(owner.id, {
          ...next.markConfigs[owner.id],
          gradientPlot: {
            ...current,
            source: candidate.source,
            orientation: candidate.orientation,
            category: candidate.category,
            categoryType: candidate.categoryType,
            measure: candidate.measure,
            density,
            width,
            gradient,
            center,
            profileId: revision.id,
            intensityDomain: profile.transform[0].resolved.intensityDomain
          }
        });
        if (center === false && hadCenter) {
          next = removeCenter(next, current.centerId);
        }
        const retainedCenter = center !== false && hadCenter;
        next = updateGradientPositions(
          next,
          owner,
          current,
          candidate,
          retainedCenter
        ).rematerializeRectMark({ id: owner.id });
        const category = candidate.orientation === "vertical"
          ? candidate.x
          : candidate.y;
        const measure = candidate.orientation === "vertical"
          ? candidate.y
          : candidate.x;
        const categoryScale = next.resolvedScales[category.scale];
        const spanSize = Math.max(
          1,
          categoryScale.bandwidth * width.band - 16
        );
        if (center !== false && !hadCenter) {
          next = next.createGradientPlotCenter({
            id: current.centerId,
            owner: owner.id,
            data: revision.id,
            category: candidate.category,
            categoryType: candidate.categoryType,
            coordinate: owner.coordinate,
            categoryScale: category.scale,
            measureScale: measure.scale,
            orientation: candidate.orientation,
            size: spanSize,
            stroke: center.stroke,
            strokeWidth: center.strokeWidth
          });
        } else if (retainedCenter) {
          next = next
            .encodeStroke({ target: current.centerId, value: center.stroke })
            .encodeStrokeWidth({
              target: current.centerId,
              value: center.strokeWidth
            })
            .materializeRuleSpan({
              id: current.centerId,
              orientation: candidate.orientation === "vertical"
                ? "horizontal"
                : "vertical",
              size: spanSize
            });
        }
        if (current.guides?.legend !== false && current.guides?.legend !== undefined) {
          next = removeGradientPlotLegend(next, owner.id)
            .createGradientPlotLegend({
              owner: owner.id,
              ...current.guides.legend
            });
        }
        next = next.releaseDerivedData(revision.release);
        return next._withContext({
          currentMark: owner.id,
          currentData: candidate.source
        });
      };
      applyEdit(this);
      return applyEdit(this);
    }
    if (roleRequested && !OPTIONS.slice(4).some(
      key => Object.hasOwn(args, key)
    )) {
      return this._withContext({
        currentMark: owner.id,
        currentData: current.source
      });
    }
    const densityChanged = JSON.stringify(density) !== JSON.stringify(current.density);
    const centerTypeChanged = center !== false && current.center !== false &&
      center.type !== current.center.type;
    const statistical = densityChanged || centerTypeChanged;
    let next = this;
    let profileId = current.profileId;
    if (statistical) {
      const consumers = [owner.id, ...(findLayer(next, current.centerId) ? [current.centerId] : [])];
      const revision = planDerivedDataRevision(next, {
        owner: owner.id,
        role: "ProfileData",
        previous: current.profileId,
        consumers
      });
      profileId = revision.id;
      next = next.createGradientProfileData({
        id: profileId,
        source: current.source,
        category: current.category,
        field: current.measure,
        ...density,
        center: center === false ? "median" : center.type
      });
      for (const rebind of revision.rebinds) next = next.rebindLayerData(rebind);
      next = next.releaseDerivedData(revision.release);
    }
    const profile = findDataset(next, profileId);
    next = next._withMarkConfig(owner.id, {
      ...next.markConfigs[owner.id],
      gradientPlot: {
        ...current,
        density,
        width,
        gradient,
        center,
        profileId,
        intensityDomain: profile.transform[0].resolved.intensityDomain
      }
    });
    const hadCenter = findLayer(next, current.centerId) !== undefined;
    if (center === false && hadCenter) {
      next = removeCenter(next, current.centerId);
    } else if (center !== false && !hadCenter) {
      const categoryEncoding = owner.encoding[current.orientation === "vertical" ? "x" : "y"];
      const measureEncoding = owner.encoding[current.orientation === "vertical" ? "y" : "x"];
      next = next.createGradientPlotCenter({
        id: current.centerId,
        owner: owner.id,
        data: profileId,
        category: current.category,
        categoryType: current.categoryType,
        coordinate: owner.coordinate,
        categoryScale: categoryEncoding.scale,
        measureScale: measureEncoding.scale,
        orientation: current.orientation,
        size: 1,
        stroke: center.stroke,
        strokeWidth: center.strokeWidth
      });
    } else if (center !== false) {
      next = next
        .encodeStroke({ target: current.centerId, value: center.stroke })
        .encodeStrokeWidth({ target: current.centerId, value: center.strokeWidth });
    }
    next = next.rematerializeRectMark({ id: owner.id });
    if (center !== false && findLayer(next, current.centerId) !== undefined) {
      const categoryChannel = current.orientation === "vertical" ? "x" : "y";
      const categoryScale = next.resolvedScales[owner.encoding[categoryChannel].scale];
      next = next.materializeRuleSpan({
        id: current.centerId,
        orientation: current.orientation === "vertical" ? "horizontal" : "vertical",
        size: Math.max(1, categoryScale.bandwidth * width.band - 16)
      });
    }
    if (current.guides?.legend !== false && current.guides?.legend !== undefined) {
      next = removeGradientPlotLegend(next, owner.id)
        .createGradientPlotLegend({
          owner: owner.id,
          ...current.guides.legend
        });
    }
    return next._withContext({ currentMark: owner.id, currentData: current.source });
  }
);
