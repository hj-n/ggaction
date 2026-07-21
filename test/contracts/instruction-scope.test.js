import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const instructionRoots = ["src", "test", "docs", "agent_docs"];
const expected = Object.freeze([
  "AGENTS.md",
  "agent_docs/AGENTS.md",
  "agent_docs/contract/AGENTS.md",
  "agent_docs/impl/AGENTS.md",
  "docs/AGENTS.md",
  "docs/assets/AGENTS.md",
  "src/AGENTS.md",
  "src/actions/AGENTS.md",
  "src/grammar/AGENTS.md",
  "src/layout/AGENTS.md",
  "src/materialization/AGENTS.md",
  "src/renderers/AGENTS.md",
  "test/AGENTS.md",
  "test/browser/AGENTS.md",
  "test/charts/AGENTS.md",
  "test/contracts/AGENTS.md"
]);
const maxInstructionBytes = 10_000;

function agentFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return agentFiles(target);
    return entry.name === "AGENTS.md" ? [target] : [];
  });
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function instructionReferences(source) {
  return [...source.matchAll(/`([^`]*AGENTS\.md)`/gu)].map(match => match[1]);
}

function bullets(source) {
  return source.split("\n")
    .filter(line => line.startsWith("- "))
    .map(line => line.slice(2).trim().replaceAll(/\s+/gu, " "));
}

test("keeps the scoped instruction hierarchy explicit and bounded", () => {
  const files = [
    path.join(root, "AGENTS.md"),
    ...instructionRoots.flatMap(directory => agentFiles(path.join(root, directory)))
  ].sort();
  assert.deepEqual(files.map(relative), [...expected]);

  for (const file of files) {
    assert.equal(
      statSync(file).size <= maxInstructionBytes,
      true,
      `${relative(file)} exceeds the ${maxInstructionBytes}-byte instruction budget`
    );
    const source = readFileSync(file, "utf8");
    assert.match(source, /^# [^\n]+ Instructions\n/u, relative(file));
    for (const reference of instructionReferences(source)) {
      assert.equal(
        statSync(path.join(root, reference)).isFile(),
        true,
        `${relative(file)} references missing ${reference}`
      );
    }
  }
});

test("keeps durable instruction bullets owned by one scope", () => {
  const owners = new Map();
  const files = [
    path.join(root, "AGENTS.md"),
    ...instructionRoots.flatMap(directory => agentFiles(path.join(root, directory)))
  ];
  for (const file of files) {
    for (const bullet of bullets(readFileSync(file, "utf8"))) {
      const previous = owners.get(bullet);
      assert.equal(
        previous,
        undefined,
        `${relative(file)} duplicates an instruction owned by ${previous}: ${bullet}`
      );
      owners.set(bullet, relative(file));
    }
  }
});
