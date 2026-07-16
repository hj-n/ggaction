import { createGapminderErrorBandPrimitives } from
  "../primitive.program.js";
import {
  ERROR_BAND_FIELDS
} from "../reference-values.js";
import { createCurvedBoundaryReferenceValues } from
  "./curved-boundary.reference-values.js";

function addBoundaryLayer(program, { id, field }) {
  return program
    .editSemantic({ property: `layer[${id}].mark.type`, value: "line" })
    .editSemantic({
      property: `layer[${id}].data`,
      value: "errorBandIntervalData"
    })
    .editSemantic({ property: `layer[${id}].coordinate`, value: "main" })
    .editSemantic({
      property: `layer[${id}].encoding.x.field`,
      value: "year"
    })
    .editSemantic({
      property: `layer[${id}].encoding.x.fieldType`,
      value: "temporal"
    })
    .editSemantic({ property: `layer[${id}].encoding.x.scale`, value: "x" })
    .editSemantic({
      property: `layer[${id}].encoding.y.field`,
      value: field
    })
    .editSemantic({
      property: `layer[${id}].encoding.y.fieldType`,
      value: "quantitative"
    })
    .editSemantic({ property: `layer[${id}].encoding.y.scale`, value: "y" })
    .editSemantic({
      property: `layer[${id}].encoding.group.field`,
      value: "cluster"
    })
    .editSemantic({
      property: `layer[${id}].encoding.group.fieldType`,
      value: "nominal"
    });
}

function addBoundaryGraphics(program, {
  id,
  after,
  commands,
  style
}) {
  return program
    .createGraphics({
      id,
      parent: "plot-main",
      type: "path",
      length: commands.length,
      after
    })
    .editGraphics({ target: id, property: "commands", value: commands })
    .editGraphics({ target: id, property: "stroke", value: style.stroke })
    .editGraphics({
      target: id,
      property: "strokeWidth",
      value: style.strokeWidth
    })
    .editGraphics({
      target: id,
      property: "strokeDash",
      value: commands.map(() => style.strokeDash)
    })
    .editGraphics({ target: id, property: "opacity", value: style.opacity });
}

export function createGapminderCurvedBoundaryPrimitives(
  gapminder,
  { boundaryCurve = "cardinal" } = {}
) {
  const values = createCurvedBoundaryReferenceValues(gapminder, {
    boundaryCurve
  });
  let program = createGapminderErrorBandPrimitives(gapminder)
    .editGraphics({
      target: "errorBand",
      property: "commands",
      value: values.series.map(series => series.areaCommands)
    });

  program = addBoundaryLayer(program, {
    id: "errorBandLowerBoundary",
    field: ERROR_BAND_FIELDS.lower
  });
  program = addBoundaryLayer(program, {
    id: "errorBandUpperBoundary",
    field: ERROR_BAND_FIELDS.upper
  });
  program = addBoundaryGraphics(program, {
    id: "errorBandLowerBoundary",
    after: "errorBand",
    commands: values.series.map(series => series.lowerCommands),
    style: values.style
  });
  return addBoundaryGraphics(program, {
    id: "errorBandUpperBoundary",
    after: "errorBandLowerBoundary",
    commands: values.series.map(series => series.upperCommands),
    style: values.style
  });
}
