import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { chart, render } from "../../src/index.js";
import { renderToPNG } from "../../src/renderers/png.js";
import {
  ACTION_INDEX,
  REPOSITORY_ROOT
} from "../support/action-contracts.js";
import {
  createMockCanvasContext,
  findCanvasCalls
} from "../support/canvas.js";

const declarations = readFileSync(
  path.join(REPOSITORY_ROOT, "types/program.d.ts"),
  "utf8"
);

test("publishes distribution owner role revisions as current behavior", () => {
  assert.doesNotMatch(
    JSON.stringify(ACTION_INDEX.plannedCapabilities),
    /distribution-owner-role-revisions/
  );
  assert.match(
    declarations,
    /interface EditBoxPlotOptions \{[\s\S]*data\?: string;[\s\S]*x\?: BoxPlotPositionChannel;[\s\S]*y\?: BoxPlotPositionChannel;/
  );
  assert.match(
    declarations,
    /interface EditGradientPlotOptions \{[\s\S]*data\?: string;[\s\S]*x\?: GradientPlotPositionChannel;[\s\S]*y\?: GradientPlotPositionChannel;/
  );
});

const samples = Object.freeze([
  Object.freeze({ oldGroup: "A", oldValue: 1 }),
  Object.freeze({ oldGroup: "A", oldValue: 3 }),
  Object.freeze({ oldGroup: "B", oldValue: 2 }),
  Object.freeze({ oldGroup: "B", oldValue: 6 })
]);
const observations = Object.freeze([
  Object.freeze({ group: "North", value: 2 }),
  Object.freeze({ group: "North", value: 5 }),
  Object.freeze({ group: "South", value: 4 }),
  Object.freeze({ group: "South", value: 9 })
]);

function revisedPrograms() {
  const base = () => chart()
    .createCanvas({ width: 260, height: 200, margin: 35 })
    .createData({ id: "samples", values: samples })
    .createData({ id: "observations", values: observations });
  const box = base()
    .createBoxPlot({
      id: "box",
      data: "samples",
      x: { field: "oldGroup", fieldType: "nominal" },
      y: { field: "oldValue", fieldType: "quantitative" },
      guides: false
    })
    .editBoxPlot({
      data: "observations",
      x: { field: "value", fieldType: "quantitative" },
      y: { field: "group", fieldType: "nominal" }
    });
  const gradient = base()
    .createGradientPlot({
      id: "gradient",
      data: "samples",
      x: { field: "oldValue", fieldType: "quantitative" },
      y: { field: "oldGroup", fieldType: "nominal" },
      guides: false
    })
    .editGradientPlot({
      data: "observations",
      x: { field: "group", fieldType: "nominal" },
      y: { field: "value", fieldType: "quantitative" }
    });
  return { box, gradient };
}

test("renders revised distribution owners through Canvas and Node PNG", async () => {
  const directory = await mkdtemp(path.join(
    tmpdir(),
    "ggaction-distribution-owner-revisions-"
  ));
  try {
    for (const [name, program] of Object.entries(revisedPrograms())) {
      const context = createMockCanvasContext();
      render(program, context);
      assert.equal(
        findCanvasCalls(context, "stroke").length > 0 ||
          findCanvasCalls(context, "fill").length > 0,
        true,
        name
      );
      const result = await renderToPNG(program, {
        output: path.join(directory, `${name}.png`),
        pixelRatio: 2
      });
      assert.equal(result.width, 520, name);
      assert.equal(result.height, 400, name);
      assert.equal(result.bytes > 0, true, name);
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
