import { createCarsRegressionScatterplotPrimitives } from
  "../primitive.program.js";

export function createComponentEditPrimitives(cars) {
  return createCarsRegressionScatterplotPrimitives(cars)
    .editGraphics({
      target: "pointsRegressionBands",
      property: "fill",
      value: "#475569"
    })
    .editGraphics({
      target: "pointsRegressionBands",
      property: "opacity",
      value: 0.12
    })
    .editGraphics({
      target: "pointsRegressionBands",
      property: "stroke",
      value: "#111827"
    })
    .editGraphics({
      target: "pointsRegressionBands",
      property: "strokeWidth",
      value: 1.5
    })
    .editGraphics({
      target: "pointsRegressionLines",
      property: "strokeWidth",
      value: 5
    });
}

export function createComparisonFilterPrimitives(cars) {
  return createCarsRegressionScatterplotPrimitives(cars, {
    filter: {
      field: "Horsepower",
      predicate: { op: "gte", value: 150 }
    }
  });
}

export function createRangeFilterPrimitives(cars) {
  return createCarsRegressionScatterplotPrimitives(cars, {
    filter: {
      field: "Displacement",
      range: { min: 100, max: 300, inclusive: true }
    }
  });
}

export function createPolynomialRegressionPrimitives(cars) {
  return createCarsRegressionScatterplotPrimitives(cars, {
    regression: { method: "polynomial", degree: 2 }
  });
}

export function createLoessRegressionPrimitives(cars) {
  return createCarsRegressionScatterplotPrimitives(cars, {
    regression: { method: "loess", span: 0.55 }
  });
}

export function createPredictionIntervalPrimitives(cars) {
  return createCarsRegressionScatterplotPrimitives(cars, {
    regression: { interval: "prediction" }
  });
}
