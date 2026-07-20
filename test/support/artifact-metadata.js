import { randomUUID } from "node:crypto";
import { link, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { createVariantMetadata, validateVariantMetadata } from "./artifact-paths.js";
import { artifactScopeConfig } from "./artifact-schema.js";

function identityFor(artifact) {
  const config = artifactScopeConfig(artifact.scope);
  return {
    scope: artifact.scope,
    ...Object.fromEntries(config.pathKeys.map(key => [key, artifact[key]]))
  };
}

function directoryFor(root, artifact) {
  const config = artifactScopeConfig(artifact.scope);
  return path.join(root, ...config.pathKeys.map(key => artifact[key]));
}

async function readMetadata(file, identity) {
  try {
    return validateVariantMetadata(
      JSON.parse(await readFile(file, "utf8")),
      identity
    );
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(
      `Cannot read ${artifactScopeConfig(identity.scope).label} metadata.`,
      { cause: error }
    );
  }
}

export async function ensureVariantMetadata(artifact, { root } = {}) {
  const expected = createVariantMetadata(artifact);
  const artifactRoot = root ?? artifactScopeConfig(artifact.scope).root;
  const identity = identityFor(artifact);
  const identityLabel = Object.values(identity).slice(1).join("/");
  const directory = directoryFor(artifactRoot, artifact);
  const file = path.join(directory, "variant.json");
  await mkdir(directory, { recursive: true });

  const existing = await readMetadata(file, identity);
  if (existing !== null) {
    if (JSON.stringify(existing) !== JSON.stringify(expected)) {
      throw new Error(`Conflicting artifact metadata for ${identityLabel}.`);
    }
    return Object.freeze({ file, metadata: existing });
  }

  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(expected, null, 2)}\n`, { flag: "wx" });
  try {
    await link(temporary, file);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const raced = await readMetadata(file, identity);
    if (JSON.stringify(raced) !== JSON.stringify(expected)) {
      throw new Error(`Conflicting artifact metadata for ${identityLabel}.`);
    }
  } finally {
    await unlink(temporary);
  }
  return Object.freeze({ file, metadata: expected });
}
