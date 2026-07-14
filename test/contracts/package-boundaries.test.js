import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

import { chart, render } from "../../src/index.js";

test("exports the public module boundaries", () => {
  assert.equal(typeof chart, "function");
  assert.equal(typeof render, "function");
});

test("maps every public entry point to a declaration file", () => {
  const packageJson = JSON.parse(readFileSync(
    new URL("../../package.json", import.meta.url),
    "utf8"
  ));
  assert.equal(packageJson.types, "./types/index.d.ts");
  assert.deepEqual(
    Object.values(packageJson.exports).map(entry => entry.types),
    [
      "./types/index.d.ts",
      "./types/extension.d.ts",
      "./types/png.d.ts"
    ]
  );
});

const TEXT_EXTENSIONS = new Set([
  ".css", ".html", ".js", ".json", ".md", ".scss", ".ts", ".yaml", ".yml"
]);

function sourceFiles(url) {
  const entries = readdirSync(url, { withFileTypes: true });
  return entries.flatMap(entry => {
    const child = new URL(entry.name + (entry.isDirectory() ? "/" : ""), url);
    if (entry.isDirectory()) return sourceFiles(child);
    const extension = entry.name.slice(entry.name.lastIndexOf("."));
    return TEXT_EXTENSIONS.has(extension) ? [child] : [];
  });
}

test("keeps library terminology source-neutral", () => {
  const root = new URL("../../", import.meta.url);
  const directories = [
    "src", "types", "docs", "agent_docs", "test", "examples", "scripts"
  ];
  const files = directories.flatMap(directory =>
    sourceFiles(new URL(`${directory}/`, root))
  ).concat([
    new URL("AGENTS.md", root),
    new URL("README.md", root),
    new URL("package.json", root)
  ]);
  const forbiddenBrand = ["ve", "ga"].join("");

  for (const file of files) {
    const source = readFileSync(file, "utf8").toLowerCase();
    assert.equal(source.includes(forbiddenBrand), false, file.pathname);
  }
});
