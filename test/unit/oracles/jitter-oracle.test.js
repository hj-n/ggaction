import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalJitterScalar,
  containJitterOffset,
  jitterIdentityV1,
  requestedJitterOffsetV1,
  resolveJitterMaximum,
  stableUint32HashV1
} from "../../oracles/jitter.js";

test("locks portable jitter-uniform-v1 scalar and hash vectors", () => {
  assert.equal(canonicalJitterScalar("é"), "string:2:é");
  assert.equal(canonicalJitterScalar(-0), "number:0");
  assert.equal(canonicalJitterScalar(true), "boolean:true");
  assert.equal(stableUint32HashV1(""), 2166136261);
  assert.equal(stableUint32HashV1("hello"), 1335831723);
  assert.equal(
    jitterIdentityV1({
      target: "points",
      channel: "x",
      seed: "gate-a",
      identity: 7
    }),
    "string:6:points\0string:1:x\0string:6:gate-a\0number:7"
  );
});

test("maps stable identities into a bounded signed displacement", () => {
  const options = {
    target: "points",
    channel: "x",
    seed: "gate-a",
    identity: 7
  };
  const first = requestedJitterOffsetV1(options, 12);
  assert.equal(first, 10.132016262039542);
  assert.equal(first, requestedJitterOffsetV1(options, 12));
  assert.equal(Math.abs(first) < 12, true);
  assert.notEqual(first, requestedJitterOffsetV1({ ...options, seed: "next" }, 12));
});

test("resolves pixel and effective categorical slot maxima", () => {
  assert.equal(resolveJitterMaximum({ pixels: 8 }), 8);
  assert.equal(resolveJitterMaximum({ band: 0.4 }, {
    type: "point",
    step: 50,
    bandwidth: 0
  }), 20);
  assert.equal(resolveJitterMaximum({ band: 0.4 }, {
    type: "band",
    step: 50,
    bandwidth: 40
  }), 16);
});

test("contains the complete point extent inside its slot and plot", () => {
  assert.deepEqual(containJitterOffset({
    base: 50,
    requested: 30,
    plotMinimum: 0,
    plotMaximum: 100,
    halfExtent: 5,
    slotWidth: 40
  }), {
    finalOffset: 15,
    clamped: true,
    available: true
  });
  assert.deepEqual(containJitterOffset({
    base: 2,
    requested: -10,
    plotMinimum: 0,
    plotMaximum: 100,
    halfExtent: 5
  }), {
    finalOffset: 3,
    clamped: true,
    available: true
  });
});

test("rejects invalid identities, bounds, and band usage", () => {
  assert.throws(() => canonicalJitterScalar(null), /string, finite number, or boolean/);
  assert.throws(() => resolveJitterMaximum({ pixels: 1, band: 0.2 }), /exactly one/);
  assert.throws(() => resolveJitterMaximum({ band: 0.6 }, {
    type: "point",
    step: 20,
    bandwidth: 0
  }), /at most 0.5/);
  assert.throws(() => resolveJitterMaximum({ band: 0.2 }, {
    type: "linear"
  }), /categorical/);
});
