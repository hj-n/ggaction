import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import {
  deriveAreaSeries,
  deriveDensityAreaSeries
} from "../../grammar/areaSeries.js";
import { mapLinearValues, mapOrdinalValues } from "../../grammar/scales.js";
import {
  assertMarkAvailable,
  resolveMarkData,
  validateMarkOptions
} from "./shared.js";
import { DEFAULT_COLORS } from "../../theme/defaults.js";
import { findDataset } from "../../selectors/datasets.js";
import { findLayer } from "../../selectors/layers.js";

const CREATE_OPTIONS = Object.freeze(["id", "data", "fill", "opacity"]);
const REMATERIALIZE_OPTIONS = Object.freeze(["id"]);

const createAreaMark = action(
  {
    op: "createAreaMark",
    description: "Create a semantic area mark and empty path collection."
  },
  function (args = {}) {
    validateMarkOptions(args, CREATE_OPTIONS, "createAreaMark");
    const id = validateUserId(args.id, "Area mark id");
    const { data } = resolveMarkData(this, args);
    const fill = args.fill ?? DEFAULT_COLORS.mark;
    const opacity = args.opacity ?? 0.2;
    if (typeof fill !== "string" || fill.length === 0) {
      throw new TypeError("Area fill must be a non-empty string.");
    }
    if (!Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
      throw new RangeError("Area opacity must be from 0 to 1.");
    }
    assertMarkAvailable(this, id);
    return this
      .editSemantic({ property: `layer[${id}].mark.type`, value: "area" })
      .editSemantic({ property: `layer[${id}].data`, value: data })
      .createGraphics({ id, type: "path", length: 0 })
      ._withMarkConfig(id, { fill, opacity });
  }
);

const rematerializeAreaMark = action(
  {
    op: "rematerializeAreaMark",
    description: "Recompute grouped closed area paths."
  },
  function (args = {}) {
    validateMarkOptions(args, REMATERIALIZE_OPTIONS, "rematerializeAreaMark");
    const id = validateUserId(args.id, "Area mark id");
    const layer = findLayer(this, id);
    const dataset = findDataset(this, layer?.data);
    if (layer?.mark?.type !== "area" || this.graphicSpec.objects[id]?.type !== "path") {
      throw new Error(`Unknown area mark "${id}".`);
    }
    if (dataset === undefined) {
      throw new Error(`Area mark "${id}" requires an existing dataset.`);
    }
    const densityTransform = dataset.transform?.length === 1 &&
      dataset.transform[0].type === "density"
      ? dataset.transform[0]
      : undefined;
    const xScaleId = layer.encoding?.x?.scale;
    const yScaleId = layer.encoding?.y?.scale;
    if (
      xScaleId === undefined ||
      yScaleId === undefined ||
      (densityTransform === undefined && layer.encoding?.y2?.scale !== yScaleId)
    ) {
      throw new Error(
        densityTransform === undefined
          ? `Area mark "${id}" requires shared x, y, and y2 scales.`
          : `Density area mark "${id}" requires x and y scales.`
      );
    }
    const derived = densityTransform === undefined
      ? deriveAreaSeries(dataset.values, layer)
      : deriveDensityAreaSeries(dataset.values, layer, densityTransform);
    let resolved = this
      .rematerializeScale({ id: xScaleId })
      .rematerializeScale({ id: yScaleId });
    const colorEncoding = layer.encoding?.color;
    if (colorEncoding?.scale !== undefined) {
      resolved = resolved.rematerializeScale({ id: colorEncoding.scale });
    }
    const xScale = resolved.resolvedScales[xScaleId];
    const yScale = resolved.resolvedScales[yScaleId];
    const paths = derived.series.map(series => {
      const x = mapLinearValues(
        series.values.map(value => value.x),
        xScale.domain,
        xScale.range,
        { clamp: xScale.clamp ?? false }
      );
      const lower = mapLinearValues(
        series.values.map(value => value.y),
        yScale.domain,
        yScale.range,
        { clamp: yScale.clamp ?? false }
      );
      if (densityTransform !== undefined) {
        const densityScale = derived.mode === "y-density" ? yScale : xScale;
        if (densityScale.domain[0] > 0 || densityScale.domain[1] < 0) {
          throw new Error(`Density area mark "${id}" requires a scale domain containing zero.`);
        }
        const baseline = mapLinearValues(
          [0],
          densityScale.domain,
          densityScale.range,
          { clamp: densityScale.clamp ?? false }
        )[0];
        return derived.mode === "y-density"
          ? [
              { x: x[0], y: baseline },
              ...x.map((value, index) => ({ x: value, y: lower[index] })),
              { x: x.at(-1), y: baseline }
            ]
          : [
              { x: baseline, y: lower[0] },
              ...x.map((value, index) => ({ x: value, y: lower[index] })),
              { x: baseline, y: lower.at(-1) }
            ];
      }
      const upper = mapLinearValues(
        series.values.map(value => value.y2),
        yScale.domain,
        yScale.range,
        { clamp: yScale.clamp ?? false }
      );
      return [
        ...x.map((value, index) => ({ x: value, y: lower[index] })),
        ...[...x].reverse().map((value, reverseIndex) => ({
          x: value,
          y: upper[upper.length - reverseIndex - 1]
        }))
      ];
    });
    const config = this.markConfigs[id];
    const fills = colorEncoding?.scale === undefined
      ? paths.map(() => config.fill)
      : mapOrdinalValues(
          derived.series.map(series => series.key[colorEncoding.field]),
          resolved.resolvedScales[colorEncoding.scale].domain,
          resolved.resolvedScales[colorEncoding.scale].range
        );
    return resolved
      .editGraphics({ target: id, property: "length", value: paths.length })
      .editGraphics({ target: id, property: "points", value: paths })
      .editGraphics({ target: id, property: "closed", value: true })
      .editGraphics({ target: id, property: "fill", value: fills })
      .editGraphics({ target: id, property: "opacity", value: config.opacity });
  }
);

export function registerAreaMarkActions(ProgramClass) {
  ProgramClass.prototype.createAreaMark = createAreaMark;
  ProgramClass.prototype.rematerializeAreaMark = rematerializeAreaMark;
}
