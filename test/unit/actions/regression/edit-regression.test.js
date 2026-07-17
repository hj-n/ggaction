import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../../src/ChartProgram.js";
import { loadCars } from "../../../support/data.js";

function regressionProgram(options = {}) {
  return chart()
    .createCanvas({
      width: 760,
      height: 480,
      margin: { top: 40, right: 190, bottom: 70, left: 80 }
    })
    .createData({ id: "cars", values: loadCars() })
    .createPointMark({ id: "points" })
    .encodeX({ field: "Displacement", scale: { nice: true, zero: false } })
    .encodeY({ field: "Acceleration", scale: { nice: true, zero: false } })
    .encodeColor({ field: "Origin" })
    .filterMarks({ field: "Origin", op: "oneOf", values: ["Japan", "USA"] })
    .createRegression(options);
}

test("revises regression statistics once and rebinds every owned consumer", () => {
  const before = regressionProgram();
  const edited = before.editRegression({
    method: "polynomial",
    degree: 2,
    band: { color: "#a78bfa", opacity: 0.16 },
    line: { strokeWidth: 4 }
  });
  const direct = regressionProgram({
    method: "polynomial",
    degree: 2,
    band: { color: "#a78bfa", opacity: 0.16 },
    line: { strokeWidth: 4 }
  });
  const revision = edited.semanticSpec.datasets.find(
    dataset => dataset.id === "pointsRegressionDataRevision1"
  );

  assert.ok(revision);
  assert.deepEqual(revision.values, direct.semanticSpec.datasets.at(-1).values);
  assert.equal(
    edited.semanticSpec.datasets.some(dataset => dataset.id === "pointsRegressionData"),
    false
  );
  assert.equal(
    edited.semanticSpec.layers.find(layer => layer.id === "pointsRegressionBands").data,
    revision.id
  );
  assert.equal(
    edited.semanticSpec.layers.find(layer => layer.id === "pointsRegressionLines").data,
    revision.id
  );
  assert.deepEqual(
    edited.graphicSpec.objects.pointsRegressionBands,
    direct.graphicSpec.objects.pointsRegressionBands
  );
  assert.deepEqual(
    edited.graphicSpec.objects.pointsRegressionLines,
    direct.graphicSpec.objects.pointsRegressionLines
  );
  assert.equal(before.semanticSpec.datasets.at(-1).id, "pointsRegressionData");
});

test("keeps data for appearance-only edits and reconciles optional bands", () => {
  const before = regressionProgram();
  const styled = before.editRegression({
    band: { opacity: 0.12 },
    line: { strokeWidth: 5 }
  });
  assert.equal(styled.semanticSpec.datasets.at(-1).id, "pointsRegressionData");
  assert.equal(
    styled.graphicSpec.objects.pointsRegressionBands.items[0].properties.opacity,
    0.12
  );

  const loess = styled.editRegression({ method: "loess", span: 0.55 });
  assert.equal(loess.graphicSpec.objects.pointsRegressionBands, undefined);
  assert.equal(
    loess.semanticSpec.layers.some(layer => layer.id === "pointsRegressionBands"),
    false
  );
  const restored = loess.editRegression({ method: "linear", band: {} });
  assert.ok(restored.graphicSpec.objects.pointsRegressionBands);
  assert.equal(
    restored.semanticSpec.layers.find(layer => layer.id === "pointsRegressionBands").data,
    "pointsRegressionDataRevision2"
  );
});

test("resolves owners and rejects invalid composite edits atomically", () => {
  const program = regressionProgram();
  assert.throws(
    () => program.editRegression({ method: "loess", band: { opacity: 0.2 } }),
    /does not support a band/
  );
  assert.throws(
    () => program.editRegression({ line: { strokeWidth: -1 } }),
    /strokeWidth/
  );
  assert.throws(
    () => program.editRegression({ target: "missing", line: { strokeWidth: 2 } }),
    /Unknown regression owner/
  );
  assert.equal(program.semanticSpec.datasets.at(-1).id, "pointsRegressionData");
});
