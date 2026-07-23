import { gzipSync } from "node:zlib";
import { mkdir, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import { build } from "vite";

const MINIMAL_BROWSER_SOURCE = `
import { chart, render } from "ggaction";

const observations = [
  { displacement: 97, acceleration: 14.5, origin: "Japan" },
  { displacement: 140, acceleration: 15.5, origin: "USA" },
  { displacement: 86, acceleration: 16.4, origin: "Japan" }
];

const program = chart()
  .createCanvas({ width: 640, height: 400 })
  .createData({ values: observations })
  .createScatterPlot({
    x: "displacement",
    y: "acceleration",
    color: "origin"
  });

const canvas = document.querySelector("#chart");
render(program, canvas.getContext("2d"));
`;

function buildOutputs(result) {
  const results = Array.isArray(result) ? result : [result];
  return results.flatMap(item => item.output ?? []);
}

export async function measureMinimalBrowserBundle(consumerDirectory) {
  const requestedRoot = path.join(consumerDirectory, "minimal-browser-bundle");
  await mkdir(requestedRoot, { recursive: true });
  const root = await realpath(requestedRoot);
  await writeFile(path.join(root, "index.html"), `<!doctype html>
<html lang="en">
  <body>
    <canvas id="chart" aria-label="Minimal ggaction scatterplot"></canvas>
    <script type="module" src="/main.js"></script>
  </body>
</html>
`);
  await writeFile(path.join(root, "main.js"), MINIMAL_BROWSER_SOURCE);

  const result = await build({
    root,
    configFile: false,
    logLevel: "silent",
    build: {
      minify: "esbuild",
      rollupOptions: {
        input: path.join(root, "index.html")
      },
      write: false
    }
  });
  const chunks = buildOutputs(result)
    .filter(output => output.type === "chunk")
    .sort((left, right) => left.fileName.localeCompare(right.fileName));
  if (chunks.length === 0) {
    throw new Error("Minimal browser bundle produced no JavaScript chunks.");
  }

  const modules = new Set(chunks.flatMap(chunk => Object.keys(chunk.modules)));
  const minifiedBytes = chunks.reduce(
    (sum, chunk) => sum + Buffer.byteLength(chunk.code),
    0
  );
  const gzipBytes = chunks.reduce(
    (sum, chunk) => sum + gzipSync(chunk.code, { level: 9 }).byteLength,
    0
  );

  return Object.freeze({
    chunks: chunks.length,
    modules: modules.size,
    minifiedBytes,
    gzipBytes
  });
}
