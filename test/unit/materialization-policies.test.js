import assert from "node:assert/strict";
import test from "node:test";

import {
  canMaterializeArea,
  canMaterializeBar,
  canMaterializeLine,
  canMaterializePoint,
  getMarkMaterializationStep
} from "../../src/actions/marks/materialization.js";
import {
  applyMaterializationPlan
} from "../../src/materialization/dependencies.js";

function programWith({ datasets = [], marks = {} } = {}) {
  return {
    semanticSpec: { datasets },
    markConfigs: marks
  };
}

test("keeps mark completeness policies beside mark actions", () => {
  const point = {
    id: "points",
    mark: { type: "point" },
    encoding: { x: { scale: "x" }, y: { scale: "y" } }
  };
  const line = {
    id: "lines",
    mark: { type: "line" },
    encoding: {
      x: { scale: "x", fieldType: "temporal" },
      y: { scale: "y", aggregate: "mean" }
    }
  };
  const area = {
    id: "areas",
    data: "density",
    mark: { type: "area" },
    encoding: {
      x: { scale: "x" },
      y: { scale: "y" },
      group: { field: "Origin" }
    }
  };
  const bar = {
    id: "bars",
    mark: { type: "bar" },
    encoding: {
      x: { scale: "x", bin: { maxBins: 10 } },
      y: { scale: "y", aggregate: "count", stack: "zero" }
    }
  };
  const program = programWith({
    datasets: [{
      id: "density",
      transform: [{ type: "density", groupBy: "Origin" }]
    }]
  });

  assert.equal(canMaterializePoint(program, point), true);
  assert.equal(canMaterializeLine(program, line), true);
  assert.equal(canMaterializeArea(program, area), true);
  assert.equal(canMaterializeBar(program, bar), true);
  assert.deepEqual(getMarkMaterializationStep(program, point), {
    op: "rematerializePointMark",
    args: { id: "points" }
  });

  assert.equal(
    canMaterializePoint(program, {
      ...point,
      encoding: { x: { scale: "x" } }
    }),
    false
  );
});

test("deduplicates identical materialization steps while preserving order", () => {
  const calls = [];
  const program = {
    materialize(args) {
      calls.push(args.id);
      return this;
    }
  };

  const result = applyMaterializationPlan(program, [
    { op: "materialize", args: { id: "x" } },
    { op: "materialize", args: { id: "x" } },
    { op: "materialize", args: { id: "y" } }
  ]);

  assert.equal(result, program);
  assert.deepEqual(calls, ["x", "y"]);
});
