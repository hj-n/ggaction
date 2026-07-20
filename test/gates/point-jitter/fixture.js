export const CARS_JITTER_LAYOUT = Object.freeze({
  width: 640,
  height: 440,
  margin: Object.freeze({ top: 40, right: 30, bottom: 70, left: 70 }),
  plot: Object.freeze({ left: 70, top: 40, right: 610, bottom: 370 }),
  radius: 3.4,
  seed: "cars-origin-strip",
  band: 0.42
});

export const GAPMINDER_JITTER_LAYOUT = Object.freeze({
  width: 680,
  height: 460,
  margin: Object.freeze({ top: 40, right: 30, bottom: 70, left: 80 }),
  plot: Object.freeze({ left: 80, top: 40, right: 650, bottom: 390 }),
  radius: 3.4,
  seed: "gapminder-cluster-strip",
  band: 0.4
});

export function createCarsJitterRows(cars) {
  const limits = new Map([
    ["USA", 26],
    ["Europe", 26],
    ["Japan", 26]
  ]);
  const counts = new Map([...limits.keys()].map(key => [key, 0]));
  const names = new Set();
  const rows = [];
  for (const row of cars) {
    if (
      !limits.has(row?.Origin) ||
      typeof row?.Name !== "string" ||
      names.has(row.Name) ||
      !Number.isFinite(row?.Acceleration) ||
      counts.get(row.Origin) >= limits.get(row.Origin)
    ) {
      continue;
    }
    rows.push(row);
    names.add(row.Name);
    counts.set(row.Origin, counts.get(row.Origin) + 1);
  }
  if (rows.length !== 78) {
    throw new Error("Cars jitter fixture requires 26 unique rows per Origin.");
  }
  return Object.freeze(rows);
}

export function createGapminderJitterRows(gapminder) {
  const rows = gapminder.filter(row =>
    row?.year === 2005 &&
    typeof row?.country === "string" &&
    Number.isFinite(row?.cluster) &&
    Number.isFinite(row?.life_expect)
  );
  if (rows.length !== 62 || new Set(rows.map(row => row.country)).size !== 62) {
    throw new Error("Gapminder jitter fixture requires 62 unique 2005 countries.");
  }
  return Object.freeze(rows);
}
