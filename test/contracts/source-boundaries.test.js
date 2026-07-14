import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../src", import.meta.url));

function sourceFiles(directory = root) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return entry.name.endsWith(".js") ? [target] : [];
  });
}

function localImports(file) {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(
    /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["'](\.[^"']+)["']/g
  )].map(match => {
    const resolved = path.resolve(path.dirname(file), match[1]);
    return path.extname(resolved) === "" ? `${resolved}.js` : resolved;
  });
}

function layer(file) {
  return path.relative(root, file).split(path.sep)[0];
}

const allowed = Object.freeze({
  actions: new Set([
    "actions", "core", "grammar", "layout", "materialization", "selectors", "theme"
  ]),
  core: new Set(["core"]),
  grammar: new Set(["core", "grammar"]),
  layout: new Set(["core", "layout"]),
  materialization: new Set([
    "core", "grammar", "layout", "materialization", "selectors", "theme"
  ]),
  renderers: new Set(["grammar", "renderers"]),
  selectors: new Set(["selectors"]),
  theme: new Set(["theme"])
});

test("keeps source imports inside their architectural boundaries", () => {
  for (const file of sourceFiles()) {
    const owner = layer(file);
    if (!(owner in allowed)) continue;
    for (const dependency of localImports(file)) {
      assert.equal(
        allowed[owner].has(layer(dependency)),
        true,
        `${path.relative(root, file)} must not import ${path.relative(root, dependency)}`
      );
    }
  }
});

test("keeps the local source import graph acyclic", () => {
  const files = sourceFiles();
  const sourceSet = new Set(files);
  const graph = new Map(files.map(file => [
    file,
    localImports(file).filter(dependency => sourceSet.has(dependency))
  ]));
  const visiting = new Set();
  const visited = new Set();

  function visit(file, stack = []) {
    if (visiting.has(file)) {
      const start = stack.indexOf(file);
      assert.fail(
        `Source import cycle: ${[...stack.slice(start), file]
          .map(item => path.relative(root, item))
          .join(" -> ")}`
      );
    }
    if (visited.has(file)) return;
    visiting.add(file);
    for (const dependency of graph.get(file)) visit(dependency, [...stack, file]);
    visiting.delete(file);
    visited.add(file);
  }

  for (const file of files) visit(file);
});

test("keeps semantic and graphic cloning inside primitive actions", () => {
  const actionRoot = path.join(root, "actions");
  for (const file of sourceFiles(actionRoot)) {
    const source = readFileSync(file, "utf8");
    if (!source.includes("._clone(")) continue;
    assert.equal(
      path.relative(actionRoot, file).split(path.sep)[0],
      "primitives",
      `${path.relative(root, file)} must compose primitive removal actions`
    );
  }
});
