import assert from "node:assert/strict";
import test from "node:test";
import {
  PALETTE_NAMES,
  normalizePalette,
  paletteFamily,
  resolvePalette,
  validatePaletteName
} from "../../../../src/grammar/palettes.js";

const expectedNames = [
  "accent",
  "category10", "category20", "category20b", "category20c",
  "observable10",
  "dark2", "paired", "pastel1", "pastel2",
  "set1", "set2", "set3",
  "tableau10", "tableau20",
  "blues", "tealblues", "teals", "greens", "browns",
  "oranges", "reds", "purples", "warmgreys", "greys",
  "viridis", "magma", "inferno", "plasma", "cividis", "turbo",
  "bluegreen", "bluepurple",
  "goldgreen", "goldorange", "goldred",
  "greenblue", "orangered",
  "purplebluegreen", "purpleblue", "purplered", "redpurple",
  "yellowgreenblue", "yellowgreen", "yelloworangebrown", "yelloworangered",
  "darkblue", "darkgold", "darkgreen", "darkmulti", "darkred",
  "lightgreyred", "lightgreyteal", "lightmulti", "lightorange", "lighttealblue",
  "blueorange", "brownbluegreen", "purplegreen", "pinkyellowgreen",
  "purpleorange", "redblue", "redgrey",
  "redyellowblue", "redyellowgreen", "spectral",
  "rainbow", "sinebow"
];

function validColor(value) {
  return /^#[0-9a-f]{6}$/.test(value);
}

test("freezes the accepted 68-name palette vocabulary", () => {
  assert.deepEqual(PALETTE_NAMES, expectedNames);
  assert.equal(new Set(PALETTE_NAMES).size, 68);
  assert.equal(Object.isFrozen(PALETTE_NAMES), true);

  for (const name of PALETTE_NAMES) {
    assert.equal(validatePaletteName(name), name);
    const range = resolvePalette(name, 5);
    assert.equal(range.length > 0, true, name);
    assert.equal(range.every(validColor), true, name);
    assert.equal(Object.isFrozen(range), true, name);
  }
});

test("preserves categorical colors and samples continuous palettes", () => {
  assert.deepEqual(resolvePalette("set2", 3), [
    "#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3",
    "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"
  ]);
  assert.deepEqual(resolvePalette({ name: "set2", count: 3 }, 8), [
    "#66c2a5", "#fc8d62", "#8da0cb"
  ]);
  assert.deepEqual(resolvePalette({ name: "set2", count: 10 }, 8).slice(8), [
    "#66c2a5", "#fc8d62"
  ]);
  assert.deepEqual(resolvePalette("viridis", 3), [
    "#440154", "#21918d", "#fde725"
  ]);
  assert.deepEqual(
    resolvePalette({ name: "viridis", count: 3, extent: [1, 0] }, 5),
    ["#fde725", "#21918d", "#440154"]
  );
  assert.equal(paletteFamily("set2"), "categorical");
  assert.equal(paletteFamily("viridis"), "continuous");
});

test("validates palette objects and family-specific options", () => {
  const extent = [0.2, 0.8];
  const normalized = normalizePalette({
    name: "plasma",
    count: 4,
    extent
  });
  extent[0] = 0;
  assert.deepEqual(normalized, {
    name: "plasma",
    count: 4,
    extent: [0.2, 0.8]
  });
  assert.throws(() => validatePaletteName("Set2"), /Unknown palette/);
  assert.throws(() => normalizePalette({ name: "set2", count: 0 }), /positive integer/);
  assert.throws(() => normalizePalette({ name: "set2", extent: [0, 1] }), /does not support extent/);
  assert.throws(() => normalizePalette({ name: "viridis", extent: [0.5, 0.5] }), /distinct/);
  assert.throws(() => normalizePalette({ name: "viridis", extent: [-1, 1] }), /from 0 to 1/);
  assert.throws(() => normalizePalette({ name: "set2", extra: true }), /Unknown palette option/);
  assert.throws(() => resolvePalette("viridis", 0), /positive domain count/);
});
