import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/index.js";

const rows = Object.freeze([
  Object.freeze({ angle: 180, radius: 8, group: "a" }),
  Object.freeze({ angle: 0, radius: 2, group: "a" }),
  Object.freeze({ angle: 90, radius: 6, group: "a" }),
  Object.freeze({ angle: 180, radius: 4, group: "b" }),
  Object.freeze({ angle: 0, radius: 7, group: "b" }),
  Object.freeze({ angle: 90, radius: 3, group: "b" })
]);

function base(mark = {}) {
  return chart()
    .createCanvas({ width: 320, height: 320, margin: 40 })
    .createData({ values: rows })
    .createLineMark(mark);
}

function openPolar() {
  return base()
    .encodeTheta({
      field: "angle",
      scale: { domain: [0, 180], range: [0, 180] }
    })
    .encodeR({ field: "radius", scale: { domain: [0, 10] } })
    .encodeGroup({ field: "group" });
}

test("materializes an incomplete Polar line only after both position encodings", () => {
  const thetaOnly = base().encodeTheta({ field: "angle" });
  const complete = thetaOnly.encodeR({ field: "radius" });

  assert.equal(thetaOnly.graphicSpec.objects.line.items.length, 0);
  assert.equal(complete.graphicSpec.objects.line.items.length, 1);
  assert.equal(complete.semanticSpec.layers[0].coordinate, "polar");
  assert.deepEqual(
    complete.graphicSpec.objects.line.items[0].properties.commands.map(
      command => command.op
    ),
    ["M", "L", "L", "L", "L", "L"]
  );
});

test("converges when radius and theta are encoded in either order", () => {
  const thetaFirst = base()
    .encodeTheta({ field: "angle" })
    .encodeR({ field: "radius" });
  const radiusFirst = base()
    .encodeR({ field: "radius" })
    .encodeTheta({ field: "angle" });

  assert.deepEqual(radiusFirst.semanticSpec.layers, thetaFirst.semanticSpec.layers);
  assert.deepEqual(radiusFirst.semanticSpec.coordinates, thetaFirst.semanticSpec.coordinates);
  assert.deepEqual(
    radiusFirst.semanticSpec.scales.slice().sort((left, right) =>
      left.id.localeCompare(right.id)
    ),
    thetaFirst.semanticSpec.scales.slice().sort((left, right) =>
      left.id.localeCompare(right.id)
    )
  );
  assert.deepEqual(radiusFirst.graphicSpec, thetaFirst.graphicSpec);
});

test("creates and edits one closing command per Polar series", () => {
  const open = openPolar();
  const closed = open.editLineMark({ closed: true });
  const reopened = closed.editLineMark({ closed: false });

  assert.equal(open.graphicSpec.objects.line.items.length, 2);
  assert.equal(open.graphicSpec.objects.line.items.every(item =>
    item.properties.commands.at(-1).op !== "Z"
  ), true);
  assert.equal(closed.graphicSpec.objects.line.items.every(item =>
    item.properties.commands.at(-1).op === "Z" &&
    item.properties.commands.filter(command => command.op === "Z").length === 1
  ), true);
  assert.deepEqual(reopened.graphicSpec, open.graphicSpec);
  assert.equal(open.markConfigs.line.closed, undefined);
  assert.equal(closed.markConfigs.line.closed, true);
});

test("persists creation-time closed state through grouping and color", () => {
  const program = base({ closed: true })
    .encodeR({ field: "radius", scale: { domain: [0, 10] } })
    .encodeTheta({ field: "angle", scale: { domain: [0, 180] } })
    .encodeGroup({ field: "group" })
    .encodeColor({ field: "group" });

  assert.equal(program.graphicSpec.objects.line.items.length, 2);
  assert.deepEqual(program.graphicSpec.objects.line.items.map(item =>
    item.properties.stroke
  ), ["#4c78a8", "#f58518"]);
  assert.equal(program.graphicSpec.objects.line.items.every(item =>
    item.properties.commands.at(-1).op === "Z"
  ), true);
});

test("inherits complete Polar positions when adding a line layer", () => {
  const source = chart()
    .createCanvas({ width: 320, height: 320, margin: 40 })
    .createData({ values: rows })
    .createPointMark()
    .encodeTheta({ field: "angle" })
    .encodeR({ field: "radius" });
  const layered = source.createLineMark({ id: "overlay" });
  const line = layered.semanticSpec.layers.find(layer => layer.id === "overlay");

  assert.equal(line.coordinate, "polar");
  assert.deepEqual(line.encoding, source.semanticSpec.layers[0].encoding);
  assert.equal(layered.graphicSpec.objects.overlay.items.length, 1);
});

test("rejects non-linear Polar curves and closed Cartesian lines atomically", () => {
  const stepped = base().editLineMark({ curve: "step" });
  assert.throws(
    () => stepped.encodeTheta({ field: "angle" }),
    /requires curve "linear"/
  );
  assert.equal(stepped.semanticSpec.coordinates.length, 0);

  const polar = base().encodeTheta({ field: "angle" });
  assert.throws(
    () => polar.editLineMark({ curve: "basis" }),
    /requires curve "linear"/
  );
  assert.throws(
    () => base().editLineMark({ closed: "yes" }),
    /must be a boolean/
  );
  const cartesianPending = base().editLineMark({ closed: true });
  assert.throws(
    () => cartesianPending.encodeX({ field: "angle", fieldType: "temporal" }),
    /closed requires theta\/radius/
  );
});
