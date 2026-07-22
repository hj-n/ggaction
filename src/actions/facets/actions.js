import { action } from "../../core/action.js";
import { freezeOwned, isPlainObject } from "../../core/immutable.js";
import {
  validateNonEmptyString,
  validateNonNegativeFinite,
  validateOptionObject,
  validatePositiveFinite
} from "../../core/validation.js";
import { resolveFacetDefinition } from "../../grammar/facets/index.js";
import { normalizeFacetScalePolicies } from
  "../../grammar/facets/scales.js";
import { FACET_SCALE_CHANNELS } from "../../grammar/facets/scales.js";
import { resolveFacetLayout } from "../../layout/facets.js";
import { compositionChildDescriptor } from
  "../../materialization/composition.js";
import { DEFAULT_COLORS, DEFAULT_FONT_FAMILY } from "../../theme/defaults.js";
import { deriveFacetChildren } from "./derive.js";
import { replayDerivedData } from "./replay.js";
import { composeFacetGuides } from "./guides.js";

const FACET_OPTIONS = Object.freeze([
  "id", "field", "data", "columns", "gap", "align", "padding", "scales",
  "guides"
]);
const GUIDE_OPTIONS = Object.freeze(["axes", "legend"]);
const HEADER_OPTIONS = Object.freeze([
  "fontSize", "fontFamily", "fontWeight", "color", "offset"
]);
const DEFAULT_HEADERS = Object.freeze({
  fontSize: 12,
  fontFamily: DEFAULT_FONT_FAMILY,
  fontWeight: 600,
  color: DEFAULT_COLORS.strongText,
  offset: 10
});

function normalizeGuides(guides) {
  if (guides === undefined) return { axes: "each", legend: false };
  validateOptionObject(guides, GUIDE_OPTIONS, "facet.guides");
  const axes = guides.axes ?? "each";
  if (!["each", "outer"].includes(axes)) {
    throw new Error('facet guides.axes must be "each" or "outer".');
  }
  const legend = guides.legend ?? false;
  if (legend !== false && legend !== "shared") {
    throw new Error('facet guides.legend must be false or "shared".');
  }
  return { axes, legend };
}

function normalizeHeaderPatch(args, previous) {
  validateOptionObject(args, HEADER_OPTIONS, "editFacetHeaders", {
    allowEmpty: false,
    emptyMessage: "editFacetHeaders requires at least one change."
  });
  const next = { ...previous, ...args };
  validatePositiveFinite(next.fontSize, "Facet header fontSize");
  validateNonEmptyString(next.fontFamily, "Facet header fontFamily");
  validateNonEmptyString(next.color, "Facet header color");
  validateNonNegativeFinite(next.offset, "Facet header offset");
  if (!(
    (typeof next.fontWeight === "string" && next.fontWeight.length > 0) ||
    Number.isFinite(next.fontWeight)
  )) {
    throw new TypeError("Facet header fontWeight must be a non-empty string or number.");
  }
  return next;
}

function requireFacetProgram(program, operation) {
  program._assertCompositionProgram(operation);
  if (program.compositionSpec.type !== "facet") {
    throw new Error(`${operation} requires a facet composition.`);
  }
}

function currentFacetDefinition(program) {
  const current = program.compositionSpec;
  return resolveFacetDefinition(program.semanticSpec, {
    id: current.id,
    data: current.facet.data,
    field: current.facet.field,
    values: current.facet.values
  });
}

function facetUnitTemplate(program) {
  const seed = program.children[program.compositionSpec.children[0]];
  if (seed === undefined) {
    throw new Error(`Facet "${program.compositionSpec.id}" requires a retained child.`);
  }
  const { facets: _facets, ...unitConfigs } = program.materializationConfigs;
  return new program.constructor({
    semanticSpec: program.semanticSpec,
    graphicSpec: seed.graphicSpec,
    resolvedScales: program.resolvedScales,
    materializationConfigs: freezeOwned({
      ...unitConfigs,
      canvas: seed.materializationConfigs.canvas
    }),
    children: {},
    context: program.context,
    trace: program.trace,
    actionStack: program.actionStack,
    actionSequence: program._actionSequence
  });
}

function applicableScaleRequest(program, channels) {
  return Object.fromEntries(FACET_SCALE_CHANNELS.flatMap(channel =>
    program.semanticSpec.layers.some(
      layer => layer.encoding?.[channel]?.scale !== undefined
    )
      ? [[channel, channels[channel]]]
      : []
  ));
}

function rederiveFacet(program, { scales, guides }) {
  const current = program.compositionSpec;
  const definition = currentFacetDefinition(program);
  const request = applicableScaleRequest(program, scales);
  const normalized = normalizeFacetScalePolicies(program.semanticSpec, request);
  const derived = deriveFacetChildren(facetUnitTemplate(program), definition, {
    closeInheritedAction: true,
    stripTitle: true,
    scales: request
  });
  const compositionSpec = {
    ...current,
    facet: {
      ...current.facet,
      scales: normalized.channels,
      guides
    }
  };
  let next = program._withCompositionState({
    children: derived.children,
    compositionSpec
  });
  for (const id of compositionSpec.children) {
    next = next.useProgram({ id });
  }
  return next.materializeComposition();
}

export const facet = action(
  {
    op: "facet",
    description: "Repeat one direct-source chart by field value."
  },
  function (args = {}) {
    validateOptionObject(args, FACET_OPTIONS, "facet");
    const guides = normalizeGuides(args.guides);
    const definition = resolveFacetDefinition(this.semanticSpec, args);
    const scalePolicies = normalizeFacetScalePolicies(
      this.semanticSpec,
      args.scales ?? {}
    );
    const derived = deriveFacetChildren(this, definition, {
      closeInheritedAction: true,
      stripTitle: true,
      scales: args.scales ?? {}
    });
    const preflight = resolveFacetLayout({
      children: definition.cells.map(cell => ({
        ...compositionChildDescriptor(cell.id, derived.children[cell.id]),
        value: cell.value
      })),
      ...(Object.hasOwn(args, "columns") ? { columns: args.columns } : {}),
      ...(Object.hasOwn(args, "gap") ? { gap: args.gap } : {}),
      ...(Object.hasOwn(args, "align") ? { align: args.align } : {}),
      ...(Object.hasOwn(args, "padding") ? { padding: args.padding } : {}),
      sharedLegend: guides.legend === "shared"
    });
    const compositionSpec = {
      id: definition.id,
      type: "facet",
      children: definition.cells.map(cell => cell.id),
      columns: preflight.columns,
      gap: preflight.gap,
      align: preflight.align,
      padding: preflight.padding,
      facet: {
        data: definition.data,
        field: definition.field,
        values: definition.values,
        scales: scalePolicies.channels,
        guides
      }
    };
    let next = this
      ._withCompositionState({
        children: derived.children,
        compositionSpec
      })
      ._withMaterializationConfig(["facets", definition.id], {
        headers: DEFAULT_HEADERS
      });
    for (const id of compositionSpec.children) {
      next = next.useProgram({ id });
    }
    return next.materializeComposition();
  }
);

export const editFacetHeaders = action(
  {
    op: "editFacetHeaders",
    description: "Edit parent-owned facet header appearance.",
    scope: "composition"
  },
  function (args = {}) {
    requireFacetProgram(this, "editFacetHeaders");
    const id = this.compositionSpec.id;
    const config = this.materializationConfigs.facets?.[id];
    if (!isPlainObject(config?.headers)) {
      throw new Error(`Facet "${id}" requires header configuration.`);
    }
    const headers = normalizeHeaderPatch(args, config.headers);
    return this
      ._withMaterializationConfig(["facets", id], { ...config, headers })
      .materializeComposition();
  }
);

export const editFacetScales = action(
  {
    op: "editFacetScales",
    description: "Edit facet scale-resolution policies and rederive every cell.",
    scope: "composition"
  },
  function (args = {}) {
    requireFacetProgram(this, "editFacetScales");
    validateOptionObject(args, FACET_SCALE_CHANNELS, "editFacetScales", {
      allowEmpty: false,
      emptyMessage: "editFacetScales requires at least one channel policy change."
    });
    for (const channel of Object.keys(args)) {
      if (!this.semanticSpec.layers.some(
        layer => layer.encoding?.[channel]?.scale !== undefined
      )) {
        throw new Error(
          `Facet scale channel "${channel}" is not used by an affected layer.`
        );
      }
    }
    const current = this.compositionSpec.facet;
    const scales = { ...current.scales, ...args };
    if (FACET_SCALE_CHANNELS.every(
      channel => scales[channel] === current.scales[channel]
    )) {
      throw new Error("editFacetScales requires at least one channel policy change.");
    }
    const request = applicableScaleRequest(this, scales);
    const normalized = normalizeFacetScalePolicies(this.semanticSpec, request);
    const applyEdit = program => rederiveFacet(program, {
      scales: normalized.channels,
      guides: current.guides
    });
    applyEdit(this);
    return applyEdit(this);
  }
);

export const editFacetGuides = action(
  {
    op: "editFacetGuides",
    description: "Edit facet guide ownership and rederive every cell.",
    scope: "composition"
  },
  function (args = {}) {
    requireFacetProgram(this, "editFacetGuides");
    validateOptionObject(args, GUIDE_OPTIONS, "editFacetGuides", {
      allowEmpty: false,
      emptyMessage: "editFacetGuides requires at least one guide policy."
    });
    const current = this.compositionSpec.facet;
    const guides = normalizeGuides({ ...current.guides, ...args });
    const applyEdit = program => rederiveFacet(program, {
      scales: current.scales,
      guides
    });
    applyEdit(this);
    return applyEdit(this);
  }
);

export function registerFacetActions(ProgramClass) {
  ProgramClass.prototype.replayDerivedData = replayDerivedData;
  ProgramClass.prototype.composeFacetGuides = composeFacetGuides;
  ProgramClass.prototype.facet = facet;
  ProgramClass.prototype.editFacetHeaders = editFacetHeaders;
  ProgramClass.prototype.editFacetScales = editFacetScales;
  ProgramClass.prototype.editFacetGuides = editFacetGuides;
}
