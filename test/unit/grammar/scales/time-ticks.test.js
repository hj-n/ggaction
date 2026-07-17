import assert from "node:assert/strict";
import test from "node:test";

import {
  formatTimeTick,
  formatTimeTicks,
  niceTicks,
  timeTicks
} from "../../../../src/grammar/ticks.js";

test("includes decimal endpoints despite floating-point division", () => {
  assert.deepEqual(niceTicks([0, 0.3], 5), [0, 0.1, 0.2, 0.3]);
  assert.deepEqual(niceTicks([0.3, 0], 5), [0, 0.1, 0.2, 0.3]);
});

test("creates UTC calendar-aligned year ticks near the requested density", () => {
  const domain = [Date.UTC(1970, 0, 1), Date.UTC(1982, 0, 1)];
  const values = timeTicks(domain, 5);

  assert.deepEqual(
    values.map(value => new Date(value).getUTCFullYear()),
    [1970, 1972, 1974, 1976, 1978, 1980, 1982]
  );
  assert.deepEqual(values.map(value => formatTimeTick(value, domain)), [
    "1970",
    "1972",
    "1974",
    "1976",
    "1978",
    "1980",
    "1982"
  ]);
  assert.equal(Object.isFrozen(values), true);
});

test("creates month, day, and sub-day UTC labels", () => {
  const months = [Date.UTC(2020, 0, 1), Date.UTC(2020, 6, 1)];
  const days = [Date.UTC(2020, 0, 1), Date.UTC(2020, 0, 10)];
  const minutes = [Date.UTC(2020, 0, 1, 8), Date.UTC(2020, 0, 1, 8, 30)];

  assert.equal(formatTimeTick(timeTicks(months, 3)[0], months), "2020-01");
  assert.equal(formatTimeTick(timeTicks(days, 4)[0], days), "2020-01-01");
  assert.match(formatTimeTick(timeTicks(minutes, 3)[0], minutes), /^08:/);
});

test("raises automatic precision until distinct ticks have distinct labels", () => {
  const cases = [
    [Date.UTC(2024, 0, 1), Date.UTC(2024, 2, 1)],
    [Date.UTC(2024, 0, 1), Date.UTC(2024, 0, 3)],
    [Date.UTC(2024, 1, 28), Date.UTC(2024, 2, 1)],
    [Date.UTC(2024, 0, 1, 0), Date.UTC(2024, 0, 1, 12)],
    [Date.UTC(2024, 0, 1, 0, 0), Date.UTC(2024, 0, 1, 0, 10)],
    [Date.UTC(2024, 0, 1, 0, 0, 0), Date.UTC(2024, 0, 1, 0, 0, 10)]
  ];

  for (const domain of cases) {
    const values = timeTicks(domain, 5);
    const labels = formatTimeTicks(values, domain);
    assert.equal(new Set(labels).size, new Set(values).size);
    assert.equal(Object.isFrozen(labels), true);
  }
  assert.deepEqual(
    formatTimeTicks(timeTicks(cases[0], 5), cases[0]),
    ["2024-01-04", "2024-01-18", "2024-02-01", "2024-02-15", "2024-02-29"]
  );
  assert.throws(() => formatTimeTicks([0, NaN], [0, 1]), /finite timestamps/);
});

test("supports reversed and constant time domains", () => {
  const start = Date.UTC(2020, 0, 1);
  const end = Date.UTC(2022, 0, 1);

  assert.deepEqual(timeTicks([end, start], 2), [start, Date.UTC(2021, 0, 1), end]);
  assert.deepEqual(timeTicks([start, start], 5), [start]);
});

test("validates time tick domains, counts, and values", () => {
  assert.throws(() => timeTicks([0], 5), /two finite timestamps/);
  assert.throws(() => timeTicks([0, 1], 0), /positive integer/);
  assert.throws(() => formatTimeTick(NaN, [0, 1]), /finite timestamp/);
});
