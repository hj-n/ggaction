export const WINDOW_RANK_LAYOUT = Object.freeze({
  width: 760,
  height: 500,
  margin: Object.freeze({ top: 85, right: 155, bottom: 80, left: 80 })
});

export const WINDOW_RANK_TRANSFORM = Object.freeze({
  type: "window",
  partitionBy: Object.freeze(["Origin"]),
  sortBy: Object.freeze([
    Object.freeze({ field: "Horsepower", order: "descending" })
  ]),
  operations: Object.freeze([
    Object.freeze({ op: "rank", as: "horsepowerRank" }),
    Object.freeze({ op: "denseRank", as: "horsepowerDenseRank" })
  ])
});

export function createWindowRankSourceRows(cars) {
  const rows = cars.filter(row =>
    typeof row?.Origin === "string" &&
    Number.isFinite(row?.Horsepower) &&
    Number.isFinite(row?.Miles_per_Gallon)
  );
  if (rows.length !== 392) {
    throw new Error("Cars window-rank fixture requires 392 valid rows.");
  }
  return Object.freeze(rows);
}
