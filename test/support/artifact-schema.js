import path from "node:path";
import { fileURLToPath } from "node:url";

export const PNG_ARTIFACT_ROOT = fileURLToPath(
  new URL("../../.artifacts/test/png/", import.meta.url)
);

const SCOPES = Object.freeze({
  charts: Object.freeze({
    id: "charts",
    label: "Approved Charts",
    root: path.join(PNG_ARTIFACT_ROOT, "charts"),
    scopeKeys: Object.freeze(["capability"]),
    pathKeys: Object.freeze(["capability", "chart", "variant"]),
    groupKeys: Object.freeze(["capability", "chart"]),
    metadataKeys: Object.freeze([
      "version", "capability", "chart", "variant", "title",
      "userFacingCallChain"
    ])
  }),
  review: Object.freeze({
    id: "review",
    label: "Active Review",
    root: path.join(PNG_ARTIFACT_ROOT, "review"),
    scopeKeys: Object.freeze([]),
    pathKeys: Object.freeze(["chart", "variant"]),
    groupKeys: Object.freeze(["chart"]),
    metadataKeys: Object.freeze([
      "version", "chart", "variant", "title", "userFacingCallChain"
    ])
  })
});

export const ARTIFACT_SCOPES = SCOPES;

export function artifactScopeNames() {
  return Object.freeze(Object.keys(SCOPES));
}

export function artifactScopeConfig(scope) {
  const config = SCOPES[scope];
  if (config === undefined) {
    throw new TypeError(
      `Unknown artifact scope "${scope}"; expected ${Object.keys(SCOPES).join(", ")}.`
    );
  }
  return config;
}
