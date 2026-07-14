import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const chartRoot = fileURLToPath(new URL("../charts/", import.meta.url));

test("keeps every chart vertical slice structurally complete", () => {
  const charts = readdirSync(chartRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  assert.equal(charts.length > 0, true);
  for (const chart of charts) {
    const directory = path.join(chartRoot, chart);
    for (const file of [
      "primitive.program.js",
      "primitive.test.js",
      "public.test.js",
      "png.render.js"
    ]) {
      assert.equal(
        existsSync(path.join(directory, file)),
        true,
        `${chart} is missing ${file}`
      );
    }

    const publicTest = readFileSync(
      path.join(directory, "public.test.js"),
      "utf8"
    );
    assert.match(
      publicTest,
      /assertChartProgramsEquivalent\s*\(/,
      `${chart} must enforce complete primitive/public equivalence`
    );
  }
});
