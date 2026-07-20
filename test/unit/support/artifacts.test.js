import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  PNG_ARTIFACT_ROOT,
  createVariantMetadata,
  resolvePngArtifactPath
} from "../../support/artifact-paths.js";
import { ensureVariantMetadata } from "../../support/artifact-metadata.js";
import { resetPngArtifacts } from "../../support/artifacts.js";
import {
  collectArtifactVariants,
  generateArtifactGallery,
  renderArtifactGallery
} from "../../../scripts/generate-artifact-gallery.js";
import { artifactScopeConfig, artifactScopeNames } from "../../support/artifact-schema.js";

async function temporaryDirectory(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ggaction-artifacts-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

function artifact(scope = "charts") {
  return {
    scope,
    ...(scope === "charts" ? { capability: "point-marks" } : {}),
    chart: "cars-scatterplot",
    variant: "baseline",
    kind: "primitive",
    title: "Cars scatterplot",
    userFacingCallChain: "chart().createScatterPlot({ x: \"Horsepower\", y: \"Acceleration\" });"
  };
}

async function createArtifact(root, value, kind) {
  const config = artifactScopeConfig(value.scope);
  const directory = path.join(root, ...config.pathKeys.map(key => value[key]));
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "variant.json"),
    `${JSON.stringify(createVariantMetadata(value), null, 2)}\n`
  );
  await writeFile(path.join(directory, `${kind}.png`), "png");
}

test("owns approved and active-review artifact scopes in one registry", () => {
  assert.deepEqual(artifactScopeNames(), ["charts", "review"]);
  assert.deepEqual(
    artifactScopeConfig("charts").pathKeys,
    ["capability", "chart", "variant"]
  );
  assert.deepEqual(artifactScopeConfig("review").pathKeys, ["chart", "variant"]);
  assert.throws(() => artifactScopeConfig("roadmap4"), /Unknown artifact scope/);
});

test("resolves capability-owned and review PNG paths", () => {
  assert.equal(
    resolvePngArtifactPath({ artifact: artifact() }),
    path.join(PNG_ARTIFACT_ROOT, "charts", "point-marks", "cars-scatterplot", "baseline", "primitive.png")
  );
  assert.equal(
    resolvePngArtifactPath({ artifact: { ...artifact("review"), kind: "user-facing" } }),
    path.join(PNG_ARTIFACT_ROOT, "review", "cars-scatterplot", "baseline", "user-facing.png")
  );
  assert.equal(
    resolvePngArtifactPath({ name: "legacy-flat" }),
    path.join(PNG_ARTIFACT_ROOT, "legacy-flat.png")
  );
});

test("rejects ambiguous, historical, unknown, and unsafe artifact paths", () => {
  assert.throws(() => resolvePngArtifactPath({ name: "flat", artifact: artifact() }), /either/);
  assert.throws(() => resolvePngArtifactPath({
    artifact: { ...artifact(), roadmap: "roadmap4" }
  }), /Unknown artifact option/);
  assert.throws(() => resolvePngArtifactPath({
    artifact: { ...artifact(), chart: "../chart" }
  }), /kebab-case/);
  assert.throws(() => resolvePngArtifactPath({
    artifact: { ...artifact(), kind: "public" }
  }), /artifact.kind/);
});

test("creates exact metadata without roadmap or phase identity", () => {
  assert.deepEqual(createVariantMetadata(artifact()), {
    version: 1,
    capability: "point-marks",
    chart: "cars-scatterplot",
    variant: "baseline",
    title: "Cars scatterplot",
    userFacingCallChain: "chart().createScatterPlot({ x: \"Horsepower\", y: \"Acceleration\" });"
  });
});

test("writes immutable metadata and rejects conflicts", async t => {
  const root = await temporaryDirectory(t);
  const value = artifact();
  const first = await ensureVariantMetadata(value, { root });
  const repeated = await ensureVariantMetadata(value, { root });
  assert.deepEqual(repeated, first);
  await assert.rejects(
    ensureVariantMetadata({ ...value, title: "Conflicting title" }, { root }),
    /Conflicting artifact metadata/
  );
  assert.deepEqual(JSON.parse(await readFile(first.file, "utf8")), first.metadata);
});

test("collects and renders a capability-grouped gallery", async t => {
  const root = await temporaryDirectory(t);
  const value = artifact();
  await createArtifact(root, value, "primitive");
  await createArtifact(root, value, "user-facing");
  const variants = await collectArtifactVariants({ scope: "charts", root });
  assert.equal(variants.length, 1);
  assert.equal(variants[0].capability, "point-marks");
  assert.equal(variants[0].status, "Ready for review");
  const html = renderArtifactGallery(variants, { scope: "charts" });
  assert.match(html, /Approved Charts Gallery/);
  assert.match(html, /point-marks\/cars-scatterplot\/baseline/);
  assert.doesNotMatch(html, /Roadmap|Phase/);
  const output = path.join(root, "index.html");
  const generated = await generateArtifactGallery({ scope: "charts", root, output });
  assert.equal(generated.variants.length, 1);
  assert.match(await readFile(output, "utf8"), /Cars scatterplot/);
});

test("requires metadata and primitive-first artifact pairs", async t => {
  const root = await temporaryDirectory(t);
  const value = artifact();
  const directory = path.join(root, "point-marks", value.chart, value.variant);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "user-facing.png"), "png");
  await assert.rejects(
    collectArtifactVariants({ scope: "charts", root }),
    /without primitive/
  );
});

test("resets only the requested generated artifact root", async t => {
  const root = await temporaryDirectory(t);
  await mkdir(path.join(root, "nested"));
  await writeFile(path.join(root, "nested", "artifact.png"), "png");
  await resetPngArtifacts(root);
  assert.deepEqual(await readdir(root), []);
});
