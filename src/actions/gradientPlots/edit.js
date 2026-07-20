import { action } from "../../core/action.js";
import { isPlainObject } from "../../core/immutable.js";
import { validateKeys } from "../../core/validation.js";
import { planDerivedDataRevision } from "../../materialization/dataProvenance.js";
import { findDataset } from "../../selectors/datasets.js";
import { findLayer } from "../../selectors/layers.js";
import { removeGradientPlotLegend } from "./components.js";
import {
  resolveGradientAppearance,
  resolveGradientCenter,
  resolveGradientDensity,
  resolveGradientWidth
} from "./options.js";
import { resolveGradientOwner } from "./resolve.js";

const OPTIONS = Object.freeze([
  "target", "density", "width", "gradient", "center"
]);

function patch(value, label) {
  if (!isPlainObject(value)) {
    throw new TypeError(`editGradientPlot ${label} must be a plain object.`);
  }
  return value;
}

function removeCenter(program, id) {
  let next = program;
  if (findLayer(next, id) !== undefined) {
    next = next.editSemantic({ property: `layer[${id}]`, remove: true });
  }
  if (next.graphicSpec.objects[id] !== undefined) {
    next = next.editGraphics({ target: id, remove: true });
  }
  return next._withoutMaterializationConfig(["marks", id]);
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
    next = next.materializeGradientPlotFill({ id: owner.id });
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
