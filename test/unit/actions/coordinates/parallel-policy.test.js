import assert from "node:assert/strict";
import test from "node:test";

import { resolveParallelCoordinate } from
  "../../../../src/actions/coordinates/parallel.js";

function program({ coordinates = [], currentCoordinate } = {}) {
  return {
    semanticSpec: { coordinates },
    context: { currentCoordinate }
  };
}

test("resolves explicit, attached, current, and sole Parallel coordinates", () => {
  const parallel = { id: "parallel", type: "parallel" };
  const alternate = { id: "alternate", type: "parallel" };

  assert.deepEqual(resolveParallelCoordinate(program({ coordinates: [parallel] }), {
    layer: { id: "lines", coordinate: "parallel" },
    operation: "encodeParallelCoordinates"
  }), { id: "parallel", create: false });
  assert.deepEqual(resolveParallelCoordinate(program({ coordinates: [parallel] }), {
    requested: "newParallel",
    operation: "createParallelCoordinates"
  }), { id: "newParallel", create: true });
  assert.deepEqual(resolveParallelCoordinate(program({ coordinates: [parallel] }), {
    requested: "parallel",
    operation: "createParallelCoordinates"
  }), { id: "parallel", create: false });
  assert.deepEqual(resolveParallelCoordinate(program({
    coordinates: [parallel, alternate],
    currentCoordinate: "alternate"
  }), {
    operation: "createParallelCoordinates",
    useCurrent: true
  }), { id: "alternate", create: false });
  assert.deepEqual(resolveParallelCoordinate(program({ coordinates: [parallel] }), {
    operation: "createParallelCoordinates"
  }), { id: "parallel", create: false });
  assert.deepEqual(resolveParallelCoordinate(program(), {
    operation: "createParallelCoordinates"
  }), { id: "parallel", create: true });
});

test("rejects conflicting and ambiguous Parallel coordinate ownership", () => {
  const cartesian = { id: "main", type: "cartesian" };
  const parallel = { id: "first", type: "parallel" };
  const alternate = { id: "second", type: "parallel" };

  assert.throws(() => resolveParallelCoordinate(program({
    coordinates: [parallel, alternate]
  }), {
    operation: "encodeParallelCoordinates"
  }), /requires coordinate when multiple/);
  assert.throws(() => resolveParallelCoordinate(program({ coordinates: [cartesian] }), {
    layer: { id: "lines", coordinate: "main" },
    operation: "encodeParallelCoordinates"
  }), /is not Parallel/);
  assert.throws(() => resolveParallelCoordinate(program({ coordinates: [parallel] }), {
    requested: "second",
    layer: { id: "lines", coordinate: "first" },
    operation: "encodeParallelCoordinates"
  }), /already uses coordinate/);
  assert.throws(() => resolveParallelCoordinate(program({ coordinates: [cartesian] }), {
    requested: "main",
    operation: "createParallelCoordinates"
  }), /is not Parallel/);
  assert.throws(() => resolveParallelCoordinate(program({
    coordinates: [{ id: "parallel", type: "cartesian" }]
  }), {
    operation: "createParallelCoordinates"
  }), /already exists with a different type/);
  assert.throws(() => resolveParallelCoordinate(program(), {
    requested: "",
    operation: "createParallelCoordinates"
  }), /must not be empty/);
});
