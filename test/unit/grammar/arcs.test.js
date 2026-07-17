import assert from "node:assert/strict";
import test from "node:test";

import { deriveArcSectors } from "../../../src/grammar/arcs.js";

const frame = Object.freeze({ centerX: 100, centerY: 100, availableRadius: 80 });

test("derives stable larger-first radial sectors at final item grain", () => {
  const rows = [
    { month: "A", value: 2, cause: "small" },
    { month: "A", value: 6, cause: "large" },
    { month: "B", value: 0, cause: "small" }
  ];
  const layer = {
    id: "arc",
    mark: { type: "arc" },
    encoding: {
      theta: { field: "month", fieldType: "ordinal", scale: "theta" },
      radius: { field: "value", fieldType: "quantitative", scale: "radius" },
      color: { field: "cause", fieldType: "nominal", scale: "color", layout: "overlay" }
    }
  };
  const derived = deriveArcSectors(rows, layer, {
    thetaScale: {
      type: "band",
      domain: ["A", "B"],
      range: [-90, 270],
      step: 180,
      start: -90,
      bandwidth: 180,
      paddingInner: 0,
      paddingOuter: 0,
      align: 0.5
    },
    radiusScale: { type: "linear", domain: [0, 8], range: [0, 80] },
    frame
  });

  assert.equal(Object.isFrozen(derived), true);
  assert.deepEqual(derived.sectors.map(sector => sector.color), ["large", "small"]);
  assert.deepEqual(derived.sectors.map(sector => sector.outerRadius), [60, 20]);
  assert.deepEqual(derived.sectors.map(sector => sector.sourceIndices), [[1], [0]]);
});
