import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { renderToPNG } from "ggaction/png";

import { createJobsGroupedBarXEncoding } from "../programs/jobsGroupedBarXEncoding.js";

const jobsPath = new URL("../../data/jobs.json", import.meta.url);
const outputPath = new URL(
  "../output/jobs-grouped-bar-x-encoding.png",
  import.meta.url
);

test("writes the ordinal x grouped bar progression as a PNG", async () => {
  const jobs = JSON.parse(await readFile(jobsPath, "utf8"));
  const program = createJobsGroupedBarXEncoding(jobs);
  const result = await renderToPNG(program, {
    output: fileURLToPath(outputPath),
    pixelRatio: 2
  });
  const png = await readFile(result.output);

  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1440);
  assert.equal(png.readUInt32BE(20), 920);
  assert.equal(result.pixelRatio, 2);
  assert.equal(png.length > 1_000, true);
});
