import assert from "node:assert/strict";
import test from "node:test";

import { chart } from "../../../src/index.js";
import { assertAtomicFailures } from "../../support/program-state.js";

test("snapshots every enumerable and private own program state field", () => {
  const program = chart();
  assert.equal(Reflect.ownKeys(program).includes("_actionSequence"), true);
  assert.doesNotThrow(() => assertAtomicFailures(program, [{
    operation: () => {
      throw new Error("rejected");
    },
    error: /rejected/
  }]));
});

test("detects nested program-state mutation even when its reference is stable", () => {
  const program = { state: { nested: 1 } };
  assert.throws(
    () => assertAtomicFailures(program, [{
      operation: () => {
        program.state.nested = 2;
        throw new Error("rejected");
      },
      error: /rejected/
    }]),
    /state value changed after rejection/
  );
});

test("detects mutation of caller-owned inputs during rejection", () => {
  const program = { state: Object.freeze({}) };
  const options = { scale: { reverse: false } };
  assert.throws(
    () => assertAtomicFailures(program, [{
      operation: () => {
        options.scale.reverse = true;
        throw new Error("rejected");
      },
      error: /rejected/,
      inputs: [options]
    }]),
    /caller input 0 changed after rejection/
  );
});
