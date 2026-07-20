import {
  createCarsOriginJitter,
  createGapminderClusterJitter
} from "../../../examples/point-jitter/program.js";
export function createCarsOriginJitterProgram(cars) {
  return createCarsOriginJitter(cars);
}

export function createGapminderClusterJitterProgram(gapminder) {
  return createGapminderClusterJitter(gapminder);
}
