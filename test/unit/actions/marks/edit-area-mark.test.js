import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/ChartProgram.js";
import { createCarsDensityArea } from
  "../../../../examples/cars-density-area/program.js";
import { loadCars } from "../../../support/data.js";
import { CURVE_INTERPOLATIONS } from
  "../../../../src/grammar/curveCommands.js";

const cars = loadCars();

test("creates, edits, and removes a concrete area outline immutably", () => {
  const baseline = createCarsDensityArea(cars);
  const outlined = baseline.editAreaMark({
    stroke: "#334155",
    strokeWidth: 1.5,
    opacity: 0.35
  });
  const widened = outlined.editAreaMark({ strokeWidth: 3 });
  const removed = widened.editAreaMark({ stroke: false });

  assert.deepEqual(outlined.markConfigs.densities, {
    fill: "#4c78a8",
    opacity: 0.35,
    stroke: "#334155",
    strokeWidth: 1.5
  });
  assert.ok(outlined.graphicSpec.objects.densities.children.every(
    child => child.properties.stroke === "#334155" &&
      child.properties.strokeWidth === 1.5 &&
      child.properties.opacity === 0.35
  ));
  assert.ok(widened.graphicSpec.objects.densities.children.every(
    child => child.properties.strokeWidth === 3
  ));
  assert.equal(removed.markConfigs.densities.stroke, undefined);
  assert.equal(removed.markConfigs.densities.strokeWidth, undefined);
  assert.ok(removed.graphicSpec.objects.densities.children.every(
    child => child.properties.stroke === undefined &&
      child.properties.strokeWidth === undefined
  ));
  assert.ok(baseline.graphicSpec.objects.densities.children.every(
    child => child.properties.stroke === undefined
  ));
});

test("stores an outline on an incomplete area and materializes it later", () => {
  const incomplete = chart()
    .createData({ id: "rows", values: [
      { x: 0, low: 0, high: 1 },
      { x: 1, low: 0, high: 2 }
    ] })
    .createAreaMark({
      id: "band",
      stroke: "black"
    });

  assert.deepEqual(incomplete.markConfigs.band, {
    fill: "#4c78a8",
    opacity: 0.2,
    stroke: "black",
    strokeWidth: 1
  });
  assert.deepEqual(incomplete.graphicSpec.objects.band.children, []);
});

test("validates area appearance, targeting, and encoded fill conflicts", () => {
  const baseline = createCarsDensityArea(cars);
  assert.throws(() => baseline.editAreaMark({}), /requires fill, opacity, stroke/);
  assert.throws(
    () => baseline.editAreaMark({ fill: "red" }),
    /cannot be combined with a color encoding/
  );
  assert.throws(
    () => baseline.editAreaMark({ strokeWidth: 2 }),
    /requires an active stroke/
  );
  assert.throws(
    () => baseline.editAreaMark({ stroke: false, strokeWidth: 2 }),
    /while removing stroke/
  );
  assert.throws(
    () => baseline.editAreaMark({ stroke: "" }),
    /non-empty string/
  );
  assert.throws(
    () => baseline.editAreaMark({ opacity: 2 }),
    /from 0 to 1/
  );
  assert.throws(
    () => baseline.editAreaMark({ target: "missing", opacity: 0.5 }),
    /Unknown area mark target/
  );
  assert.throws(
    () => chart()
      .createData({ id: "rows", values: [] })
      .createAreaMark({ id: "first" })
      .createAreaMark({ id: "second" })
      ._withContext({ currentMark: undefined })
      .editAreaMark({ opacity: 0.5 }),
    /target is ambiguous/
  );
  assert.throws(
    () => chart()
      .createData({ id: "rows", values: [] })
      .createAreaMark({ id: "area", strokeWidth: 2 }),
    /strokeWidth requires stroke/
  );
});

test("creates and edits every area curve without mutating earlier programs", () => {
  const base = chart()
    .createCanvas({ width: 200, height: 160, margin: 20 })
    .createData({ values: [
      { x: 0, low: 1, high: 3 },
      { x: 1, low: 2, high: 5 },
      { x: 2, low: 1, high: 4 }
    ] })
    .createAreaMark({ id: "band" })
    .encodeX({ target: "band", field: "x" })
    .encodeYRange({ target: "band", lower: "low", upper: "high" });

  for (const curve of CURVE_INTERPOLATIONS) {
    const edited = base.editAreaMark({ target: "band", curve });
    assert.equal(edited.markConfigs.band.curve, curve);
    assert.equal(
      edited.graphicSpec.objects.band.children[0].properties.commands.at(-1).op,
      "Z"
    );
    if (["basis", "cardinal", "monotone", "natural"].includes(curve)) {
      assert.equal(
        edited.graphicSpec.objects.band.children[0].properties.commands.some(
          command => command.op === "C"
        ),
        true
      );
    }
  }

  assert.equal(base.markConfigs.band.curve, undefined);
  assert.throws(
    () => base.editAreaMark({ target: "band", curve: "smooth" }),
    /Unsupported curve interpolation/
  );
});
