import {
  createCarsDensityAreaPrimitiveProgram,
  createCarsDensityAreaPrimitives
} from "../primitive.program.js";

export function createAreaOutlineEditPrimitives(cars) {
  return createCarsDensityAreaPrimitives(cars)
    .editGraphics({
      target: "densities",
      property: "opacity",
      value: 0.35
    })
    .editGraphics({
      target: "densities",
      property: "stroke",
      value: "#334155"
    })
    .editGraphics({
      target: "densities",
      property: "strokeWidth",
      value: 1.5
    });
}

export function createEpanechnikovKernelPrimitives(cars) {
  return createCarsDensityAreaPrimitiveProgram(cars, {
    kernel: "epanechnikov"
  });
}

export function createCountNormalizationPrimitives(cars) {
  return createCarsDensityAreaPrimitiveProgram(cars, {
    normalization: "count"
  });
}

export function createDensityRevisionPrimitives(cars) {
  return createCarsDensityAreaPrimitiveProgram(cars, {
    datasetId: "densitiesDensityDataRevision1",
    bandwidth: 0.9,
    kernel: "triangular",
    normalization: "count"
  });
}
