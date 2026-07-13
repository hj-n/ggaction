import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createMockCanvasContext } from "../helpers/mockCanvasContext.js";
import { createJobsGroupedBarPrimitives } from "../programs/jobsGroupedBarPrimitives.js";
import {
  createJobsGroupedBarYEncoding,
  renderJobsGroupedBarYEncoding
} from "../programs/jobsGroupedBarYEncoding.js";

const jobs = JSON.parse(
  readFileSync(new URL("../../data/jobs.json", import.meta.url), "utf8")
);

test("replaces primitive aggregate y semantics with encodeY", () => {
  const primitive = createJobsGroupedBarPrimitives(jobs);
  const program = createJobsGroupedBarYEncoding(jobs);

  assert.deepEqual(program.semanticSpec, primitive.semanticSpec);
  assert.deepEqual(program.graphicSpec, primitive.graphicSpec);
  assert.equal(program.resolvedScales.y.type, "linear");
  assert.deepEqual(program.resolvedScales.y.range, [390, 40]);
  assert.equal(
    program.resolvedScales.y.domain[0],
    program.resolvedScales.y.domain[1]
  );
  assert.equal(
    Math.abs(program.resolvedScales.y.domain[0] - 1 / 510) < 1e-15,
    true
  );

  const node = program.trace.children.find(child => child.op === "encodeY");
  assert.deepEqual(node.args, {
    field: "perc",
    aggregate: "mean",
    scale: { nice: true, zero: false }
  });
  assert.deepEqual(node.children.map(child => child.op), [
    "createCoordinate",
    "editSemantic",
    "editSemantic",
    "editSemantic",
    "editSemantic",
    "editSemantic",
    "createScale",
    "rematerializeBarMark"
  ]);
  assert.deepEqual(node.children.at(-1).children.map(child => child.op), [
    "rematerializeScale",
    "rematerializeScale",
    "editGraphics"
  ]);

  const replacedPaths = new Set([
    "layer[bars].encoding.y.field",
    "layer[bars].encoding.y.fieldType",
    "layer[bars].encoding.y.aggregate",
    "layer[bars].encoding.y.stack",
    "layer[bars].encoding.y.scale",
    "scale[y].type",
    "scale[y].domain",
    "scale[y].range",
    "scale[y].nice",
    "scale[y].zero"
  ]);
  assert.equal(program.trace.children.some(child =>
    child.op === "editSemantic" && replacedPaths.has(child.args.property)
  ), false);
  assert.equal(program.graphicSpec.objects.bars.children.length, 30);
});

test("keeps the aggregate y progression render equivalent to primitives", () => {
  const primitive = createJobsGroupedBarPrimitives(jobs);
  const program = createJobsGroupedBarYEncoding(jobs);
  const primitiveContext = createMockCanvasContext();
  const context = createMockCanvasContext();

  renderJobsGroupedBarYEncoding(primitive, primitiveContext);
  renderJobsGroupedBarYEncoding(program, context);

  assert.deepEqual(context.calls, primitiveContext.calls);
});
