import assert from "node:assert/strict";
import test from "node:test";

import {
  BAR_GRAINS,
  BAR_ORIENTATIONS,
  inferBarColorLayout,
  resolveBarChannels,
  resolveBarOrientation,
  resolveBarGrain
} from "../../../../src/grammar/bars/policy.js";

test("classifies supported bar grains and their current color layouts", () => {
  const histogram = {
    mark: { type: "bar" },
    encoding: {
      x: { fieldType: "quantitative", bin: { maxBins: 10 } },
      y: { aggregate: "count", stack: "zero" }
    }
  };
  const aggregate = {
    mark: { type: "bar" },
    encoding: {
      x: { fieldType: "ordinal" },
      y: { fieldType: "quantitative", aggregate: "mean", stack: null }
    }
  };

  assert.equal(resolveBarGrain(histogram), BAR_GRAINS.histogram);
  assert.equal(inferBarColorLayout(histogram), "stack");
  assert.equal(resolveBarGrain(aggregate), BAR_GRAINS.aggregate);
  assert.equal(resolveBarOrientation(aggregate), BAR_ORIENTATIONS.vertical);
  assert.deepEqual(resolveBarChannels(aggregate), {
    orientation: "vertical",
    category: "x",
    measure: "y"
  });
  assert.equal(inferBarColorLayout(aggregate), "group");
  assert.equal(resolveBarGrain({ mark: { type: "point" } }), undefined);
  assert.equal(resolveBarGrain({
    ...aggregate,
    encoding: { ...aggregate.encoding, y: { ...aggregate.encoding.y, stack: "zero" } }
  }), BAR_GRAINS.aggregate);

  const horizontal = {
    mark: { type: "bar" },
    encoding: {
      x: { fieldType: "quantitative", aggregate: "mean", stack: "zero" },
      y: { fieldType: "temporal" }
    }
  };
  assert.equal(resolveBarOrientation(horizontal), BAR_ORIENTATIONS.horizontal);
  assert.deepEqual(resolveBarChannels(horizontal), {
    orientation: "horizontal",
    category: "y",
    measure: "x"
  });
});
