import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

const rows = Object.freeze([
  Object.freeze({ x: 1, y: 2, value: 8 }),
  Object.freeze({ x: 2, y: 4, value: 12.2 }),
  Object.freeze({ x: 3, y: 6, value: 16.4 }),
  Object.freeze({ x: 4, y: 8, value: 20.6 }),
  Object.freeze({ x: 5, y: 10, value: 24.8 })
]);

function pointProgram({ position = "right", top = 90, right = 150, bottom = 90, left = 150 } = {}) {
  return chart()
    .createCanvas({
      width: 760,
      height: 460,
      margin: { top, right, bottom, left }
    })
    .createData({ id: "rows", values: rows })
    .createPointMark({ id: "points" })
    .encodeX({ field: "x" })
    .encodeY({ field: "y" });
}

test("creates the approved right gradient legend as concrete strips", () => {
  const program = pointProgram({ top: 30, left: 70, bottom: 60 })
    .encodeColor({ field: "value", fieldType: "quantitative" })
    .createLegend({ channels: ["color"] });
  const strips = program.graphicSpec.objects.colorGradientStrips.children;
  const labels = program.graphicSpec.objects.colorGradientLabels.children;

  assert.equal(strips.length, 60);
  assert.deepEqual(strips[0].properties, {
    x: 640,
    y: 76,
    width: 12,
    height: 2,
    fill: "#f8e722",
    stroke: "#f8e722",
    strokeWidth: 0
  });
  assert.deepEqual(labels.map(label => label.properties.text), [
    "8", "12.2", "16.4", "20.6", "24.8"
  ]);
  assert.equal(program.semanticSpec.guides.legend.color.scale, "color");
  assert.equal(program.guideConfigs.legend.gradient.position, "right");
});

test("lays gradient legends out in all four positions", () => {
  for (const position of ["right", "left", "top", "bottom"]) {
    const program = pointProgram()
      .encodeColor({ field: "value", fieldType: "quantitative" })
      .createLegend({ channels: ["color"], position });
    const strips = program.graphicSpec.objects.colorGradientStrips.children;
    const first = strips[0].properties;
    const last = strips.at(-1).properties;
    if (["right", "left"].includes(position)) {
      assert.equal(first.x, last.x);
      assert.notEqual(first.y, last.y);
    } else {
      assert.notEqual(first.x, last.x);
      assert.equal(first.y, last.y);
    }
  }
});

test("creates ascending opacity samples and removes them in constant mode", () => {
  const fieldProgram = pointProgram({ top: 30, left: 70, bottom: 60 })
    .encodeOpacity({ field: "value" })
    .createLegend({ channels: ["opacity"] });
  assert.equal(
    fieldProgram.graphicSpec.objects.opacityLegendSymbols.children.every(
      (symbol, index) =>
        Math.abs(symbol.properties.opacity - (0.2 + index * 0.2)) < 1e-12
    ),
    true
  );
  assert.deepEqual(
    fieldProgram.graphicSpec.objects.opacityLegendLabels.children.map(
      label => label.properties.text
    ),
    ["8", "12.2", "16.4", "20.6", "24.8"]
  );

  const constantProgram = fieldProgram.encodeOpacity({ value: 0.5 });
  assert.equal(constantProgram.semanticSpec.layers[0].encoding.opacity, undefined);
  assert.equal(constantProgram.semanticSpec.guides.legend.opacity, undefined);
  assert.equal(constantProgram.guideConfigs.legend.opacity, undefined);
  assert.equal(constantProgram.graphicSpec.objects.opacityLegendSymbols, undefined);
});

test("lays opacity legends out in all four positions", () => {
  for (const position of ["right", "left", "top", "bottom"]) {
    const program = pointProgram()
      .encodeOpacity({ field: "value" })
      .createLegend({ channels: ["opacity"], position });
    const symbols = program.graphicSpec.objects.opacityLegendSymbols.children;
    if (["right", "left"].includes(position)) {
      assert.equal(symbols[0].properties.x, symbols.at(-1).properties.x);
      assert.notEqual(symbols[0].properties.y, symbols.at(-1).properties.y);
    } else {
      assert.notEqual(symbols[0].properties.x, symbols.at(-1).properties.x);
      assert.equal(symbols[0].properties.y, symbols.at(-1).properties.y);
    }
  }
});

test("rematerializes continuous legends after scale and Canvas edits", () => {
  const gradient = pointProgram({ top: 30, left: 70, bottom: 60 })
    .encodeColor({ field: "value", fieldType: "quantitative" })
    .createLegend({ channels: ["color"] });
  const firstColor = gradient.graphicSpec.objects.colorGradientStrips.children[0]
    .properties.fill;
  const reversed = gradient.editScale({ id: "color", reverse: true });
  assert.notEqual(
    reversed.graphicSpec.objects.colorGradientStrips.children[0].properties.fill,
    firstColor
  );

  const opacity = pointProgram({ top: 30, left: 70, bottom: 60 })
    .encodeOpacity({ field: "value" })
    .createLegend({ channels: ["opacity"] });
  const resized = opacity.editCanvas({ width: 800, margin: { top: 30, right: 190, bottom: 60, left: 70 } });
  assert.equal(
    resized.graphicSpec.objects.opacityLegendSymbols.children[0].properties.x,
    647
  );
});

test("rejects incompatible options and insufficient margins atomically", () => {
  const color = pointProgram({ top: 30, right: 20, bottom: 60, left: 70 })
    .encodeColor({ field: "value", fieldType: "quantitative" });
  assert.throws(
    () => color.createLegend({ channels: ["color"] }),
    /more Canvas margin space/
  );
  assert.throws(
    () => color.createLegend({ channels: ["color"], columns: 2 }),
    /does not accept columns/
  );

  const opacity = pointProgram()
    .encodeOpacity({ field: "value" });
  assert.throws(
    () => opacity.createLegend({ channels: ["opacity"], gradient: {} }),
    /does not accept gradient/
  );
  assert.equal(color.graphicSpec.objects.colorGradientStrips, undefined);
});
