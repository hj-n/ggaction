import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../src/index.js";

import { assertRenderedPNG } from "./png.js";

const DATA_ALIASES = Object.freeze([
  "rows",
  "cars",
  "jobs",
  "gapminder",
  "shapeRows",
  "namedDashRows",
  "originAccelerationIntervals",
  "ruleRows"
]);
const VALUE_ALIASES = Object.freeze(["pointShapes"]);

export function defineVisualVariant({
  chart,
  variant,
  title,
  callChain,
  primitive,
  userFacing,
  width,
  height,
  colors,
  regions,
  artifact = true
}) {
  if (typeof chart !== "string" || chart.length === 0) {
    throw new TypeError("Visual variant chart must be a non-empty string.");
  }
  if (typeof variant !== "string" || variant.length === 0) {
    throw new TypeError("Visual variant id must be a non-empty string.");
  }
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new RangeError(`${chart}/${variant} requires positive dimensions.`);
  }
  if (!Array.isArray(regions) || regions.length === 0) {
    throw new TypeError(`${chart}/${variant} requires visual regions.`);
  }
  for (const region of regions) {
    if (
      region === null ||
      typeof region !== "object" ||
      typeof region.name !== "string" ||
      ![region.x, region.y, region.width, region.height].every(Number.isFinite) ||
      region.x < 0 ||
      region.y < 0 ||
      region.width <= 0 ||
      region.height <= 0 ||
      region.x + region.width > width ||
      region.y + region.height > height
    ) {
      throw new RangeError(`${chart}/${variant} has an invalid visual region.`);
    }
  }
  if (typeof primitive !== "function") {
    throw new TypeError(`${chart}/${variant} primitive must be a program factory.`);
  }
  if (userFacing !== undefined && typeof userFacing !== "function") {
    throw new TypeError(`${chart}/${variant} userFacing must be a program factory.`);
  }
  return Object.freeze({
    chart,
    variant,
    title,
    callChain,
    primitive,
    userFacing,
    width,
    height,
    colors,
    regions,
    artifact
  });
}

function replayDisplayedCallChain(source, program) {
  const expression = source.trim().replace(/;$/, "");
  const values = program.semanticSpec.datasets[0]?.values;
  const pointShapes = program.semanticSpec.scales.find(
    scale => scale.id === "shape"
  )?.range;
  const evaluate = new Function(
    "chart",
    ...DATA_ALIASES,
    ...VALUE_ALIASES,
    `"use strict"; return (${expression});`
  );
  return evaluate(
    chart,
    ...DATA_ALIASES.map(() => structuredClone(values)),
    structuredClone(pointShapes)
  );
}

function assertDisplayedProgram(variant, program) {
  const replayed = replayDisplayedCallChain(variant.callChain, program);
  assert.deepEqual(replayed.semanticSpec, program.semanticSpec);
  assert.deepEqual(replayed.graphicSpec, program.graphicSpec);
  assert.deepEqual(replayed.trace, program.trace);
}

function renderOptions(variant, kind) {
  const shared = {
    width: variant.width,
    height: variant.height,
    colors: variant.colors,
    regions: variant.regions
  };
  if (variant.artifact) {
    return {
      ...shared,
      artifact: {
        roadmap: "roadmap2",
        chart: variant.chart,
        variant: variant.variant,
        kind,
        title: variant.title,
        userFacingCallChain: variant.callChain
      }
    };
  }
  return {
    ...shared,
    name: kind === "primitive"
      ? `${variant.chart}-primitives`
      : variant.chart
  };
}

export function registerVisualVariantTests(variants) {
  for (const variant of variants) {
    test(`renders ${variant.chart}/${variant.variant}`, async () => {
      const primitive = variant.primitive();
      if (variant.userFacing !== undefined) {
        const userFacing = variant.userFacing();
        if (variant.artifact) assertDisplayedProgram(variant, userFacing);
        const [primitiveResult, userFacingResult] = await Promise.all([
          assertRenderedPNG(
            primitive,
            renderOptions(variant, "primitive")
          ),
          assertRenderedPNG(
            userFacing,
            renderOptions(variant, "user-facing")
          )
        ]);
        assert.equal(userFacingResult.pixelHash, primitiveResult.pixelHash);
      } else {
        await assertRenderedPNG(
          primitive,
          renderOptions(variant, "primitive")
        );
      }
    });
  }
}
