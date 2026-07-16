import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/ChartProgram.js";
import { createCarsDensityAreaValues } from
  "../../../charts/cars-density-area/reference-values.js";
import { loadCars } from "../../../support/data.js";

function densityArea() {
  return chart()
    .createCanvas({
      width: 720,
      height: 500,
      margin: { top: 130, right: 40, bottom: 70, left: 80 }
    })
    .createData({ id: "cars", values: loadCars() })
    .createAreaMark({ id: "densities", opacity: 0.5 })
    .encodeDensity({
      field: "Acceleration",
      groupBy: "Origin",
      bandwidth: 0.6
    });
}

test("colors density paths in the group domain order", () => {
  const before = densityArea();
  const program = before.encodeColor({
    field: "Origin",
    scale: { palette: "tableau10" }
  });
  const expected = createCarsDensityAreaValues(loadCars());

  assert.deepEqual(program.semanticSpec.layers[0].encoding.color, {
    field: "Origin",
    fieldType: "nominal",
    scale: "color",
    layout: "overlay"
  });
  assert.equal(program.semanticSpec.layers[0].encoding.y.stack, null);
  assert.deepEqual(program.resolvedScales.color.domain, expected.groupDomain);
  assert.deepEqual(
    program.graphicSpec.objects.densities.items.map(child => child.properties.fill),
    expected.areas.map(area => area.fill)
  );
  assert.deepEqual(
    program.graphicSpec.objects.densities.items.map(child => child.properties.commands),
    before.graphicSpec.objects.densities.items.map(child => child.properties.commands)
  );
});

test("supports explicit area color domains and ranges", () => {
  const program = densityArea().encodeColor({
    field: "Origin",
    scale: {
      domain: ["Japan", "USA", "Europe"],
      range: ["red", "blue", "green"]
    }
  });

  assert.deepEqual(
    program.graphicSpec.objects.densities.items.map(child => child.properties.fill),
    ["blue", "green", "red"]
  );
});

test("materializes stacked and normalized vertical density areas", () => {
  const stacked = densityArea().encodeColor({
    field: "Origin",
    layout: "stack"
  });
  const filled = densityArea().encodeColor({
    field: "Origin",
    layout: "fill"
  });

  assert.equal(stacked.semanticSpec.layers[0].encoding.y.stack, "zero");
  assert.equal(stacked.resolvedScales.y.domain[1] > 0.25, true);
  assert.equal(filled.semanticSpec.layers[0].encoding.y.stack, "normalize");
  assert.deepEqual(filled.resolvedScales.y.domain, [0, 1]);
  assert.equal(stacked.graphicSpec.objects.densities.items.length, 3);
  assert.equal(filled.graphicSpec.objects.densities.items.length, 3);
});

test("rejects unsupported area layouts and layout transitions atomically", () => {
  const before = densityArea();
  assert.throws(
    () => before.encodeColor({ field: "Origin", layout: "group" }),
    /does not support "group"/
  );
  const overlay = before.encodeColor({ field: "Origin" });
  assert.throws(
    () => overlay.encodeColor({ field: "Origin", layout: "stack" }),
    /transition from "overlay" to "stack"/
  );
  assert.equal(before.semanticSpec.layers[0].encoding.color, undefined);
  assert.equal(overlay.semanticSpec.layers[0].encoding.color.layout, "overlay");
});

test("rematerializes colored area paths after Canvas edits", () => {
  const before = densityArea().encodeColor({ field: "Origin" });
  const after = before.editCanvas({ width: 820, height: 540 });

  assert.notDeepEqual(
    after.graphicSpec.objects.densities.items[0].properties.commands,
    before.graphicSpec.objects.densities.items[0].properties.commands
  );
  assert.deepEqual(
    after.graphicSpec.objects.densities.items.map(child => child.properties.fill),
    ["#4c78a8", "#f58518", "#e45756"]
  );
});

test("rematerializes every area consumer of a shared color scale", () => {
  const program = chart()
    .createCanvas({ width: 300, height: 200, margin: 20 })
    .createData({ id: "first", values: [
      { value: 1, group: "A" }, { value: 2, group: "A" }
    ] })
    .createAreaMark({ id: "firstArea" })
    .encodeDensity({ field: "value", groupBy: "group", bandwidth: 1 })
    .encodeColor({ field: "group" })
    .createData({ id: "second", values: [
      { value: 1, group: "B" }, { value: 2, group: "B" }
    ] })
    .createAreaMark({ id: "secondArea" })
    .encodeDensity({ field: "value", groupBy: "group", bandwidth: 1 })
    .encodeColor({ field: "group" });

  assert.deepEqual(program.resolvedScales.color.domain, ["A", "B"]);
  assert.equal(
    program.graphicSpec.objects.firstArea.items[0].properties.fill,
    "#4c78a8"
  );
  assert.equal(
    program.graphicSpec.objects.secondArea.items[0].properties.fill,
    "#f58518"
  );
});

test("requires area color to match existing grouping", () => {
  const area = densityArea();
  assert.throws(
    () => area.encodeColor({ field: "Acceleration_value" }),
    /must match an existing group encoding/
  );
  const ungrouped = chart()
    .createCanvas()
    .createData({ id: "data", values: [{ value: 1 }, { value: 2 }] })
    .createAreaMark({ id: "area" })
    .encodeDensity({ field: "value", bandwidth: 1 });
  assert.throws(
    () => ungrouped.encodeColor({ field: "value_value" }),
    /must match an existing group encoding/
  );
});
