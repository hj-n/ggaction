import { action } from "../../../../core/action.js";
import { isPlainObject } from "../../../../core/immutable.js";
import { noOptions, resolveLayout, activeConfig } from "./layout.js";
import { normalizeOptions } from "./options.js";
import {
  resolveCurrentDefinition,
  resolveDefinition,
  resolveTarget,
  sameValues
} from "./resolve.js";

export const rematerializeLegend = action(
  { op: "rematerializeLegend", description: "Rematerialize every categorical legend component." },
  function (args = {}) {
    noOptions(args, "rematerializeLegend");
    if (
      this.guideConfigs.legend?.point !== undefined ||
      this.guideConfigs.legend?.size !== undefined
    ) {
      let next = this;
      if (this.guideConfigs.legend?.point !== undefined) {
        next = next.rematerializePointSeriesLegend();
      }
      if (this.guideConfigs.legend?.size !== undefined) {
        next = next.rematerializeSizeLegend();
      }
      return next;
    }
    const { kind, config } = activeConfig(this);
    const definition = resolveCurrentDefinition(this, config);
    let next = sameValues(config.domain, definition.domain)
      ? this
      : this._withLegendConfig(kind, { ...config, domain: definition.domain });
    if (config.border !== false) next = next.editLegendBackground();
    return next
      .editLegendSymbols()
      .editLegendLabels()
      .editLegendTitle();
  }
);

export const createCategoricalLegend = action(
  { op: "createCategoricalLegend", description: "Create one categorical legend block." },
  function (args = {}) {
    const layer = resolveTarget(this, args.target);
    const kind = layer.mark.type === "bar" ? "color" : "series";
    const options = normalizeOptions(args, kind);
    if (
      this.semanticSpec.guides.legend?.series !== undefined ||
      this.semanticSpec.guides.legend?.color !== undefined
    ) {
      throw new Error("createCategoricalLegend requires a missing legend.");
    }
    const definition = resolveDefinition(
      this,
      layer,
      options.channels,
      options.title
    );
    const config = {
      target: layer.id,
      ...definition,
      position: options.position,
      align: options.align,
      symbol: options.symbol,
      labels: options.labels,
      titleStyle: options.titleStyle,
      itemGap: options.itemGap,
      border: options.border
    };
    resolveLayout(this, config);
    let next = this;
    if (kind === "series") {
      next = next
        .editSemantic({
          property: "guide.legend.series.channels",
          value: definition.channels
        })
        .editSemantic({
          property: "guide.legend.series.scales",
          value: definition.scales
        })
        .editSemantic({
          property: "guide.legend.series.title",
          value: definition.title
        });
    } else {
      next = next
        .editSemantic({
          property: "guide.legend.color.scale",
          value: definition.scales[0]
        })
        .editSemantic({
          property: "guide.legend.color.title",
          value: definition.title
        });
    }
    next = next._withLegendConfig(kind, config);
    if (config.border !== false) next = next.createLegendBackground();
    return next
      .createLegendSymbols()
      .createLegendLabels()
      .createLegendTitle();
  }
);

export const createLegend = action(
  { op: "createLegend", description: "Create an inferred categorical legend." },
  function (args = {}) {
    if (!isPlainObject(args)) {
      throw new TypeError("createLegend options must be a plain object.");
    }
    const pointCandidates = this.semanticSpec.layers.filter(layer =>
      layer.mark?.type === "point" &&
      layer.encoding?.color?.scale !== undefined &&
      layer.encoding?.shape?.scale !== undefined
    );
    const requestedPoint = args.target === undefined
      ? pointCandidates.length === 1 ? pointCandidates[0] : undefined
      : pointCandidates.find(layer => layer.id === args.target);
    if (requestedPoint !== undefined) {
      const unknown = Object.keys(args).find(
        key => !["target", "count"].includes(key)
      );
      if (unknown !== undefined) {
        throw new Error(`Unknown point legend option "${unknown}".`);
      }
      let next = this.createPointSeriesLegend({ target: requestedPoint.id });
      if (requestedPoint.encoding?.size?.scale !== undefined) {
        next = next.createSizeLegend({
          target: requestedPoint.id,
          ...(args.count === undefined ? {} : { count: args.count })
        });
      }
      return next;
    }
    return this.createCategoricalLegend(args);
  }
);
