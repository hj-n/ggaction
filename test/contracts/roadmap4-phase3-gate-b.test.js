import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { visualVariants } from "../gates/field-stroke-width/manifest.js";
import { loadCars } from "../support/data.js";

const root = fileURLToPath(new URL("../..", import.meta.url));
const read = relative => readFileSync(path.join(root, relative), "utf8");

test("locks the P3-B public declaration and current contract", () => {
  const declarations = read("types/program.d.ts");
  const contract = read("agent_docs/contract/current/ENCODINGS.md");

  assert.match(declarations, /export type StrokeWidthEncodingOptions =/);
  assert.match(
    declarations,
    /encodeStrokeWidth\(options: StrokeWidthEncodingOptions\): ChartProgram/
  );
  assert.match(contract, /Rule grain is one source row per concrete line/);
  assert.match(contract, /Line grain is one complete series path/);
  assert.match(contract, /never chooses or aggregates a/);
});

test("keeps the P3-B primitive and public programs exactly equivalent", () => {
  const variant = visualVariants[0];
  const primitive = variant.primitive();
  const publicProgram = variant.userFacing();

  assert.deepEqual(publicProgram.graphicSpec, primitive.graphicSpec);
  assert.equal(publicProgram.semanticSpec.datasets[0].values.length, 8);
  assert.equal(loadCars().length > 8, true);
  assert.deepEqual(
    publicProgram.graphicSpec.objects.cars.items.map(
      item => item.properties.strokeWidth
    ),
    primitive.graphicSpec.objects.cars.items.map(
      item => item.properties.strokeWidth
    )
  );
  assert.equal(
    publicProgram.trace.children.some(node => node.op === "encodeStrokeWidth"),
    true
  );
});
