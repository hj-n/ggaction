import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

const rows = Object.freeze([
  Object.freeze({ x: 1, y: 1, value: 10 }),
  Object.freeze({ x: 2, y: 2, value: 20 }),
  Object.freeze({ x: 3, y: 3, value: 30 })
]);

function program(scale) {
  return chart()
    .createCanvas({
      width: 200,
      height: 160,
      margin: { top: 30, right: 80, bottom: 30, left: 30 }
    })
    .createData({ values: rows })
    .createPointMark()
    .encodeX({ field: "x" })
    .encodeY({ field: "y" })
    .encodeColor({
      field: "value",
      fieldType: "quantitative",
      scale
    });
}

test("persists, resolves, and maps each discretized quantitative color type", () => {
  for (const [type, domain] of [
    ["quantize", undefined],
    ["quantile", undefined],
    ["threshold", [15, 25]]
  ]) {
    const result = program({
      type,
      ...(domain === undefined ? {} : { domain }),
      range: ["red", "green", "blue"]
    });
    const fills = result.graphicSpec.objects.point.children.map(
      child => child.properties.fill
    );

    assert.equal(result.semanticSpec.scales.find(scale => scale.id === "color").type, type);
    assert.deepEqual(fills, ["red", "green", "blue"]);
  }
});

test("reverses the resolved class colors and interval legend together", () => {
  const result = program({
    type: "threshold",
    domain: [15, 25],
    range: ["red", "green", "blue"],
    reverse: true
  }).createLegend({
    labels: { fontSize: 10 },
    titleStyle: { fontSize: 10 }
  });

  assert.deepEqual(result.resolvedScales.color.range, ["blue", "green", "red"]);
  assert.deepEqual(
    result.graphicSpec.objects.point.children.map(child => child.properties.fill),
    ["blue", "green", "red"]
  );
  assert.deepEqual(
    result.graphicSpec.objects.colorLegendSymbols.children.map(
      child => child.properties.fill
    ),
    ["blue", "green", "red"]
  );
});

test("edits an interval legend through the shared public legend action", () => {
  const original = program({
    type: "threshold",
    domain: [15, 25],
    range: ["red", "green", "blue"]
  }).createLegend({ title: "Value", labels: { fontSize: 10 } });
  const edited = original.editLegend({
    itemGap: 20,
    symbol: { width: 10 },
    title: false
  });

  assert.equal(original.graphicSpec.objects.colorLegendTitle !== undefined, true);
  assert.equal(edited.graphicSpec.objects.colorLegendTitle, undefined);
  assert.deepEqual(
    edited.graphicSpec.objects.colorLegendSymbols.children.map(
      child => child.properties.width
    ),
    [10, 10, 10]
  );
});

test("rematerializes a shared discretized scale and interval legend after Canvas edits", () => {
  const scale = {
    type: "threshold",
    domain: [15, 25],
    range: ["red", "green", "blue"]
  };
  const original = program(scale)
    .createPointMark({ id: "second" })
    .encodeColor({
      target: "second",
      field: "value",
      fieldType: "quantitative",
      scale: { id: "color", ...scale }
    });
  assert.throws(() => original.createLegend(), /requires one eligible point/);
  const withLegend = original
    .createLegend({
      target: "point",
      labels: { fontSize: 10 },
      titleStyle: { fontSize: 10 }
    });
  const edited = withLegend.editCanvas({ width: 220 });

  assert.deepEqual(
    edited.graphicSpec.objects.point.children.map(child => child.properties.fill),
    edited.graphicSpec.objects.second.children.map(child => child.properties.fill)
  );
  assert.equal(
    edited.graphicSpec.objects.colorLegendSymbols.children[0].properties.x -
      withLegend.graphicSpec.objects.colorLegendSymbols.children[0].properties.x,
    20
  );
  assert.equal(withLegend.graphicSpec.objects.canvas.properties.width, 200);
});

test("rejects unsupported and invalid discretized color options atomically", () => {
  const base = chart()
    .createCanvas({
      width: 200,
      height: 160,
      margin: { top: 30, right: 80, bottom: 30, left: 30 }
    })
    .createData({ values: rows })
    .createPointMark()
    .encodeX({ field: "x" })
    .encodeY({ field: "y" });

  assert.throws(() => base.encodeColor({
    field: "value",
    fieldType: "quantitative",
    scale: { type: "threshold", range: ["red", "blue"] }
  }), /explicit domain/);
  assert.throws(() => base.encodeColor({
    field: "value",
    fieldType: "quantitative",
    scale: {
      type: "threshold",
      domain: [20, 10],
      range: ["red", "green", "blue"]
    }
  }), /strictly increasing/);
  assert.equal(base.semanticSpec.scales.some(scale => scale.id === "color"), false);
});
