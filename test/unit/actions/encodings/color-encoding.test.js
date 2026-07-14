import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/core/ChartProgram.js";

function createPointProgram(
  id = "points",
  data = "cars",
  values = [
    { origin: "USA" },
    { origin: "Japan" },
    { origin: "USA" }
  ]
) {
  return chart()
    .createData({ id: data, values })
    .createPointMark({ id });
}

test("encodes nominal values with an automatic ordinal color scale", () => {
  const before = createPointProgram();
  const program = before.encodeColor({ field: "origin" });

  assert.deepEqual(program.semanticSpec.layers[0].encoding.color, {
    field: "origin",
    fieldType: "nominal",
    scale: "color"
  });
  assert.deepEqual(program.semanticSpec.scales, [
    { id: "color", type: "ordinal", domain: "auto", range: "auto" }
  ]);
  assert.deepEqual(program.resolvedScales.color.domain, ["USA", "Japan"]);
  assert.deepEqual(
    program.graphicSpec.objects.points.children.map(child => child.properties.fill),
    ["#4c78a8", "#f58518", "#4c78a8"]
  );
  assert.equal(before.semanticSpec.layers[0].encoding, undefined);
});

test("records color encoding through explicit nested actions", () => {
  const program = createPointProgram().encodeColor({ field: "origin" });
  const node = program.trace.children.at(-1);

  assert.equal(node.op, "encodeColor");
  assert.deepEqual(
    node.children.map(child => child.op),
    [
      "editSemantic",
      "editSemantic",
      "editSemantic",
      "createScale",
      "rematerializeScale",
      "rematerializePointMark"
    ]
  );
  assert.deepEqual(
    node.children.at(-1).children.map(child => child.op),
    ["editGraphics"]
  );
});

test("supports explicit color domains, ranges, and palette descriptors", () => {
  const explicit = createPointProgram().encodeColor({
    field: "origin",
    scale: {
      domain: ["USA", "Japan"],
      range: ["navy", "green"]
    }
  });
  const palette = createPointProgram().encodeColor({
    field: "origin",
    scale: { range: { palette: "tableau10" } }
  });
  const paletteAlias = createPointProgram().encodeColor({
    field: "origin",
    scale: { palette: "tableau10" }
  });

  assert.deepEqual(explicit.resolvedScales.color.range, ["navy", "green"]);
  assert.deepEqual(palette.semanticSpec.scales[0].range, {
    palette: "tableau10"
  });
  assert.deepEqual(paletteAlias.semanticSpec.scales[0].range, {
    palette: "tableau10"
  });
});

test("resolves named palettes for marks and connected legends", () => {
  const program = chart()
    .createCanvas({
      width: 400,
      height: 220,
      margin: { top: 20, right: 120, bottom: 20, left: 20 }
    })
    .createData({
      id: "cars",
      values: [
        { origin: "USA" },
        { origin: "Japan" },
        { origin: "Europe" }
      ]
    })
    .createPointMark({ id: "points" })
    .encodeColor({
      field: "origin",
      scale: { palette: { name: "set2", count: 3 } }
    })
    .createLegend({ channels: ["color"] });

  assert.deepEqual(program.semanticSpec.scales[0].range, {
    palette: { name: "set2", count: 3 }
  });
  assert.deepEqual(program.resolvedScales.color.range, [
    "#66c2a5", "#fc8d62", "#8da0cb"
  ]);
  assert.deepEqual(
    program.graphicSpec.objects.points.children.map(child => child.properties.fill),
    ["#66c2a5", "#fc8d62", "#8da0cb"]
  );
  assert.deepEqual(
    program.graphicSpec.objects.seriesLegendSymbols.children.map(
      child => child.properties.stroke
    ),
    ["#66c2a5", "#fc8d62", "#8da0cb"]
  );

  const reversed = program.editScale({ id: "color", reverse: true });
  assert.deepEqual(reversed.resolvedScales.color.range, [
    "#8da0cb", "#fc8d62", "#66c2a5"
  ]);
  assert.deepEqual(
    reversed.graphicSpec.objects.points.children.map(child => child.properties.fill),
    ["#8da0cb", "#fc8d62", "#66c2a5"]
  );
  assert.deepEqual(
    reversed.graphicSpec.objects.seriesLegendSymbols.children.map(
      child => child.properties.stroke
    ),
    ["#8da0cb", "#fc8d62", "#66c2a5"]
  );
  assert.deepEqual(program.resolvedScales.color.range, [
    "#66c2a5", "#fc8d62", "#8da0cb"
  ]);
});

test("structurally owns palette sampling options", () => {
  const extent = [0.15, 0.85];
  const program = createPointProgram().encodeColor({
    field: "origin",
    scale: { palette: { name: "viridis", count: 2, extent } }
  });
  extent[0] = 0.75;

  assert.deepEqual(program.semanticSpec.scales[0].range, {
    palette: { name: "viridis", count: 2, extent: [0.15, 0.85] }
  });
  assert.equal(Object.isFrozen(
    program.semanticSpec.scales[0].range.palette.extent
  ), true);
});

test("combines every consumer of a shared color scale", () => {
  const first = createPointProgram("points", "cars", [{ origin: "USA" }])
    .encodeColor({ field: "origin" })
    .createData({ id: "other", values: [{ origin: "Europe" }] })
    .createPointMark({ id: "otherPoints" });
  const program = first.encodeColor({ field: "origin" });

  assert.deepEqual(program.resolvedScales.color.domain, ["USA", "Europe"]);
  assert.equal(
    program.graphicSpec.objects.points.children[0].properties.fill,
    "#4c78a8"
  );
  assert.equal(
    program.graphicSpec.objects.otherPoints.children[0].properties.fill,
    "#f58518"
  );
});

test("validates color encoding inputs", () => {
  const program = createPointProgram();

  assert.throws(() => program.encodeColor(), /field must be a non-empty string/i);
  assert.throws(
    () => program.encodeColor({ field: "missing" }),
    /nominal value/
  );
  assert.throws(
    () => program.encodeColor({ field: "origin", fieldType: "quantitative" }),
    /Unsupported color field type/
  );
  assert.throws(
    () => program.encodeColor({ field: "origin", scale: { type: "linear" } }),
    /Unsupported color scale type/
  );
  assert.throws(
    () => program.encodeColor({
      field: "origin",
      scale: { palette: "tableau10", range: ["red"] }
    }),
    /both palette and range/
  );
});
