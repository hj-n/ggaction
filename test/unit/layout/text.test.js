import assert from "node:assert/strict";
import test from "node:test";

import { measureTextWidth, wrapText } from "../../../src/layout/text.js";

const style = Object.freeze({ fontSize: 14 });

test("measures text with deterministic code-point metrics", () => {
  assert.ok(Math.abs(measureTextWidth("abc", style) - 19.74) < 1e-12);
  assert.equal(measureTextWidth("한글", style), 28);
  assert.equal(measureTextWidth("", style), 0);
});

test("wraps words greedily and falls back for an oversized token", () => {
  assert.deepEqual(wrapText(
    "Kernel density estimates for acceleration, grouped by origin in the cars dataset",
    { maxWidth: 270, mode: "word", style }
  ), [
    "Kernel density estimates for acceleration,",
    "grouped by origin in the cars dataset"
  ]);
  assert.deepEqual(wrapText("acceleration-density-estimate", {
    maxWidth: 70,
    mode: "word",
    style
  }), ["acceleratio", "n-density-e", "stimate"]);
});

test("wraps character mode on Unicode code-point boundaries", () => {
  const lines = wrapText("차트제목ABC", {
    maxWidth: 30,
    mode: "character",
    style
  });
  assert.deepEqual(lines, ["차트", "제목", "ABC"]);
  assert.equal(lines.join(""), "차트제목ABC");
  assert.equal(lines.every(line => line.length > 0), true);
});

test("validates text measurement and wrapping inputs", () => {
  assert.throws(() => measureTextWidth(3, style), /requires a string/);
  assert.throws(() => measureTextWidth("text", { fontSize: 0 }), /positive fontSize/);
  assert.throws(() => wrapText("text", { maxWidth: 0, style }), /maxWidth/);
  assert.throws(() => wrapText("text", {
    maxWidth: 20,
    mode: "words",
    style
  }), /Unsupported text wrap mode/);
});
