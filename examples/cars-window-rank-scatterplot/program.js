import { chart } from "../../src/index.js";

export function createCarsWindowRankRows(cars) {
  return cars.filter(row =>
    typeof row?.Origin === "string" &&
    Number.isFinite(row?.Horsepower) &&
    Number.isFinite(row?.Miles_per_Gallon)
  );
}

export function createCarsWindowRankScatterplot(cars) {
  const rows = createCarsWindowRankRows(cars);

  return chart()
    .createCanvas({
      width: 760,
      height: 500,
      margin: { top: 85, right: 155, bottom: 80, left: 80 }
    })
    .createData({ id: "cars", values: rows })
    .createWindowData({
      id: "rankedCars",
      partitionBy: "Origin",
      sortBy: [{ field: "Horsepower", order: "descending" }],
      operations: [
        { op: "rank", as: "horsepowerRank" },
        { op: "denseRank", as: "horsepowerDenseRank" }
      ]
    })
    .filterData({
      id: "topHorsepowerCars",
      source: "rankedCars",
      field: "horsepowerRank",
      predicate: { op: "lte", value: 15 }
    })
    .createScatterPlot({
      id: "rankedCarsPlot",
      data: "topHorsepowerCars",
      x: {
        field: "horsepowerRank",
        fieldType: "quantitative",
        scale: { domain: [0.5, 15.5], nice: false, zero: false }
      },
      y: {
        field: "Miles_per_Gallon",
        fieldType: "quantitative",
        scale: { domain: [8, 35], nice: false, zero: false }
      },
      color: {
        field: "Origin",
        fieldType: "nominal",
        scale: {
          domain: ["USA", "Europe", "Japan"],
          palette: "set2"
        }
      },
      point: {
        opacity: 0.76,
        stroke: "#ffffff",
        strokeWidth: 0.8
      },
      guides: {
        axes: {
          x: {
            ticksAndLabels: { values: [1, 3, 6, 9, 12, 15] },
            title: { text: "Horsepower rank within origin" }
          },
          y: { title: { text: "Miles per gallon" } }
        },
        grid: { horizontal: true, vertical: false },
        legend: {
          title: "Origin",
          position: "right",
          symbol: {
            layers: [{
              type: "point",
              shape: "circle",
              size: 5,
              stroke: "white",
              strokeWidth: 0.8
            }]
          }
        }
      }
    })
    .encodePointRadius({ target: "rankedCarsPlot", value: 5 })
    .createTitle({
      text: "Fuel Economy among High-Horsepower Cars",
      subtitle: "Top 15 horsepower ranks within each origin",
      align: "center"
    });
}
