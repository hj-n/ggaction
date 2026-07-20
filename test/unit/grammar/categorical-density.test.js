import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveKernelDensity,
  normalizeDensityPlacement,
  validateDensityTransform
} from "../../../src/grammar/density.js";
import {
  buildCategoricalDensityPaths,
  deriveCategoricalDensitySeries
} from "../../../src/grammar/categoricalDensity.js";

const categoryScale = Object.freeze({
  type: "band",
  domain: ["A", "B"],
  range: [0, 200],
  step: 100,
  start: 0,
  bandwidth: 100,
  paddingInner: 0,
  paddingOuter: 0,
  align: 0.5
});
const valueScale = Object.freeze({
  type: "linear",
  domain: [0, 4],
  range: [200, 0]
});

function commandsFor(rows, rawPlacement = { type: "category" }) {
  const placement = normalizeDensityPlacement(rawPlacement, {
    densityChannel: "x",
    groupBy: "category"
  });
  const result = deriveKernelDensity(rows, {
    field: "value",
    groupBy: "category",
    bandwidth: 1,
    extent: [0, 4],
    steps: 5,
    placement
  });
  const transform = {
    type: "density",
    field: "value",
    groupBy: "category",
    bandwidth: 1,
    extent: [0, 4],
    steps: 5,
    kernel: "gaussian",
    normalization: "unit",
    as: ["value_value", "value_density"],
    resolve: "shared",
    placement,
    resolved: {
      bandwidth: result.bandwidth,
      extent: result.extent,
      ...(result.splitDomain === undefined
        ? {}
        : { splitDomain: result.splitDomain })
    }
  };
  const layer = {
    id: "violins",
    mark: { type: "area" },
    encoding: {
      x: { field: "category", fieldType: "nominal", scale: "x" },
      y: { field: "value_value", fieldType: "quantitative", scale: "y" },
      group: { field: "category", fieldType: "nominal" }
    }
  };
  const series = deriveCategoricalDensitySeries(result.values, layer, transform);
  return {
    result,
    series,
    commands: buildCategoricalDensityPaths(series, {
      categoryScale,
      valueScale
    })
  };
}

test("normalizes categorical placement defaults and validates stored provenance", () => {
  const placement = normalizeDensityPlacement({ type: "category" }, {
    densityChannel: "x",
    groupBy: "category"
  });

  assert.deepEqual(placement, {
    type: "category",
    channel: "x",
    categoryField: "category",
    side: "both",
    width: { band: 0.8, resolve: "shared" }
  });
  assert.doesNotThrow(() => validateDensityTransform({
    type: "density",
    field: "value",
    groupBy: "category",
    bandwidth: 1,
    extent: [0, 4],
    steps: 5,
    as: ["sample", "estimate"],
    resolve: "shared",
    placement
  }));
  assert.throws(
    () => normalizeDensityPlacement({ type: "category", side: "top" }, {
      densityChannel: "x",
      groupBy: "category"
    }),
    /does not support side/
  );
  assert.throws(
    () => normalizeDensityPlacement({
      type: "category",
      side: "left",
      split: { field: "side" }
    }, {
      densityChannel: "x",
      groupBy: "category"
    }),
    /cannot also specify side/
  );
});

test("builds symmetric paths and resolves shared versus independent widths", () => {
  const rows = [
    { category: "A", value: 1 },
    { category: "A", value: 1.5 },
    { category: "A", value: 2 },
    { category: "B", value: 3 },
    { category: "B", value: 4 }
  ];
  const shared = commandsFor(rows);
  const independent = commandsFor(rows, {
    type: "category",
    width: { band: 0.8, resolve: "independent" }
  });

  assert.equal(shared.commands.length, 2);
  assert.equal(shared.commands.every(commands =>
    commands[0].op === "M" && commands.at(-1).op === "Z"
  ), true);
  for (const [index, commands] of independent.commands.entries()) {
    const center = index === 0 ? 50 : 150;
    const xs = commands.filter(command => "x" in command).map(command => command.x);
    assert.ok(Math.abs(Math.max(...xs.map(x => Math.abs(x - center))) - 40) < 1e-9);
  }
  const sharedSecond = shared.commands[1]
    .filter(command => "x" in command)
    .map(command => Math.abs(command.x - 150));
  assert.ok(Math.max(...sharedSecond) < 40);
});

test("infers exactly two split values and keeps halves on deterministic sides", () => {
  const rows = [
    { category: "A", side: "early", value: 1 },
    { category: "A", side: "late", value: 2 },
    { category: "B", side: "early", value: 3 },
    { category: "B", side: "late", value: 4 }
  ];
  const split = commandsFor(rows, {
    type: "category",
    split: { field: "side" }
  });

  assert.deepEqual(split.result.splitDomain, ["early", "late"]);
  assert.deepEqual(split.series.series.map(series => series.side), [
    "left", "right", "left", "right"
  ]);
  split.commands.forEach((commands, index) => {
    const center = index < 2 ? 50 : 150;
    const xs = commands.filter(command => "x" in command).map(command => command.x);
    assert.equal(xs.every(x => index % 2 === 0 ? x <= center : x >= center), true);
  });

  assert.throws(
    () => commandsFor([...rows, { category: "A", side: "middle", value: 2.5 }], {
      type: "category",
      split: { field: "side" }
    }),
    /exactly two observed values/
  );
});
