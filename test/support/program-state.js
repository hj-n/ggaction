import assert from "node:assert/strict";

function requireNamed(items, id, label) {
  const value = items.find(item => item.id === id);
  assert.ok(value, `Expected ${label} "${id}" to exist.`);
  return value;
}

export function requireTestDataset(program, id) {
  return requireNamed(program.semanticSpec.datasets, id, "dataset");
}

export function requireTestLayer(program, id) {
  return requireNamed(program.semanticSpec.layers, id, "layer");
}

export function requireTestScale(program, id) {
  return requireNamed(program.semanticSpec.scales, id, "scale");
}

export function requireTestCoordinate(program, id) {
  return requireNamed(program.semanticSpec.coordinates, id, "coordinate");
}

export function requireTestGraphic(program, id) {
  const graphic = program.graphicSpec.objects[id];
  assert.ok(graphic, `Expected graphic "${id}" to exist.`);
  return graphic;
}

function snapshotProgram(program) {
  return new Map(Reflect.ownKeys(program).map(property => [
    property,
    {
      reference: program[property],
      value: structuredClone(program[property])
    }
  ]));
}

function assertProgramSnapshot(program, snapshot) {
  assert.deepEqual(
    Reflect.ownKeys(program),
    [...snapshot.keys()],
    "Program state keys changed after rejection"
  );
  for (const [property, value] of snapshot) {
    const label = String(property);
    assert.strictEqual(
      program[property],
      value.reference,
      `${label} reference changed after rejection`
    );
    assert.deepEqual(
      program[property],
      value.value,
      `${label} value changed after rejection`
    );
  }
}

export function assertAtomicFailures(program, cases) {
  const snapshot = snapshotProgram(program);
  for (const { operation, error, inputs = [] } of cases) {
    const inputSnapshots = inputs.map(input => structuredClone(input));
    assert.throws(operation, error);
    assertProgramSnapshot(program, snapshot);
    for (const [index, input] of inputs.entries()) {
      assert.deepEqual(
        input,
        inputSnapshots[index],
        `caller input ${index} changed after rejection`
      );
    }
  }
}
