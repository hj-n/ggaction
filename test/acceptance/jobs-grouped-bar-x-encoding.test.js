import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createMockCanvasContext } from "../helpers/mockCanvasContext.js";
import { createJobsGroupedBarPrimitives } from "../programs/jobsGroupedBarPrimitives.js";
import {
  createJobsGroupedBarXEncoding,
  renderJobsGroupedBarXEncoding
} from "../programs/jobsGroupedBarXEncoding.js";

const jobs = JSON.parse(
  readFileSync(new URL("../../data/jobs.json", import.meta.url), "utf8")
);

test("replaces primitive ordinal x semantics with encodeX", () => {
  const primitive = createJobsGroupedBarPrimitives(jobs);
  const program = createJobsGroupedBarXEncoding(jobs);

  assert.deepEqual(program.semanticSpec, primitive.semanticSpec);
  assert.deepEqual(program.graphicSpec, primitive.graphicSpec);
  assert.deepEqual(program.resolvedScales.x, {
    type: "ordinal",
    domain: [
      1850, 1860, 1870, 1880, 1900,
      1910, 1920, 1930, 1940, 1950,
      1960, 1970, 1980, 1990, 2000
    ],
    range: [80, 580],
    step: 500 / 15,
    bandwidth: 500 / 15
  });

  const node = program.trace.children.find(child => child.op === "encodeX");
  assert.deepEqual(node.args, { field: "year", fieldType: "ordinal" });
  assert.deepEqual(node.children.map(child => child.op), [
    "createCoordinate",
    "editSemantic",
    "editSemantic",
    "editSemantic",
    "createScale",
    "rematerializeScale"
  ]);

  const replacedPaths = new Set([
    "layer[bars].coordinate",
    "layer[bars].encoding.x.field",
    "layer[bars].encoding.x.fieldType",
    "layer[bars].encoding.x.scale",
    "scale[x].type",
    "scale[x].domain",
    "scale[x].range",
    "coordinate[main].type"
  ]);
  assert.equal(program.trace.children.some(child =>
    child.op === "editSemantic" && replacedPaths.has(child.args.property)
  ), false);
  assert.equal(program.graphicSpec.objects.bars.children.length, 30);
});

test("keeps the ordinal x progression render equivalent to the primitive chart", () => {
  const primitive = createJobsGroupedBarPrimitives(jobs);
  const program = createJobsGroupedBarXEncoding(jobs);
  const primitiveContext = createMockCanvasContext();
  const context = createMockCanvasContext();

  renderJobsGroupedBarXEncoding(primitive, primitiveContext);
  renderJobsGroupedBarXEncoding(program, context);

  assert.deepEqual(context.calls, primitiveContext.calls);
});
