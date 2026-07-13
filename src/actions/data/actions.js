import { action } from "../../core/action.js";
import { validateUserId } from "../../core/identifiers.js";
import { isPlainObject } from "../../core/immutable.js";
import { validateKeys } from "../../core/validation.js";
import { deriveLinearRegression } from "../../grammar/regression.js";

const DATA_OPTIONS = Object.freeze(["id", "values"]);

function validateOptions(args) {
  for (const key of Object.keys(args)) {
    if (!DATA_OPTIONS.includes(key)) {
      throw new Error(`Unknown createData option "${key}".`);
    }
  }
}

function validateValues(values) {
  if (!Array.isArray(values)) {
    throw new TypeError("createData requires values to be an array.");
  }

  if (!values.every(isPlainObject)) {
    throw new TypeError("createData requires every row to be a plain object.");
  }
}

export const createData = action(
  {
    op: "createData",
    description: "Create an immutable named dataset."
  },
  function (args = {}) {
    validateOptions(args);
    const id = validateUserId(args.id, "Dataset id");
    validateValues(args.values);

    if (this.semanticSpec.datasets.some(dataset => dataset.id === id)) {
      throw new Error(`Dataset "${id}" already exists.`);
    }

    return this.editSemantic({
      property: `dataset[${id}].values`,
      value: args.values
    });
  }
);

const DERIVED_DATA_OPTIONS = Object.freeze(["id", "source", "transform"]);
const FILTER_DATA_OPTIONS = Object.freeze(["id", "source", "field", "oneOf"]);
const REGRESSION_DATA_OPTIONS = Object.freeze([
  "id", "source", "x", "y", "groupBy", "method", "confidence", "interval"
]);
const MATERIALIZE_OPTIONS = Object.freeze(["id"]);

export const createDerivedData = action(
  {
    op: "createDerivedData",
    description: "Create an immutable derived dataset definition."
  },
  function (args = {}) {
    validateKeys(args, DERIVED_DATA_OPTIONS, "createDerivedData");
    const id = validateUserId(args.id, "Derived dataset id");
    const source = validateUserId(args.source, "Source dataset id");

    if (this.semanticSpec.datasets.some(dataset => dataset.id === id)) {
      throw new Error(`Dataset "${id}" already exists.`);
    }
    if (!this.semanticSpec.datasets.some(dataset => dataset.id === source)) {
      throw new Error(`Unknown source dataset "${source}".`);
    }

    return this
      .editSemantic({ property: `dataset[${id}].source`, value: source })
      .editSemantic({ property: `dataset[${id}].transform`, value: args.transform });
  }
);

export const materializeFilteredData = action(
  {
    op: "materializeFilteredData",
    description: "Materialize one filtered derived dataset."
  },
  function ({ id } = {}) {
    const validatedId = validateUserId(id, "Derived dataset id");
    const dataset = this.semanticSpec.datasets.find(
      item => item.id === validatedId
    );
    if (dataset === undefined || dataset.source === undefined) {
      throw new Error(`Unknown derived dataset "${validatedId}".`);
    }
    if (dataset.values !== undefined) {
      throw new Error(`Derived dataset "${validatedId}" is already materialized.`);
    }
    const source = this.semanticSpec.datasets.find(
      item => item.id === dataset.source
    );
    if (source?.values === undefined) {
      throw new Error(`Source dataset "${dataset.source}" has no values.`);
    }
    if (dataset.transform?.length !== 1 || dataset.transform[0].type !== "filter") {
      throw new Error(
        `Derived dataset "${validatedId}" requires one filter transform.`
      );
    }
    const { field, oneOf } = dataset.transform[0];
    const accepted = new Set(oneOf);
    const values = source.values.filter(row => accepted.has(row[field]));

    return this.editSemantic({
      property: `dataset[${validatedId}].values`,
      value: values
    });
  }
);

export const filterData = action(
  {
    op: "filterData",
    description: "Create a named dataset filtered by accepted field values."
  },
  function (args = {}) {
    validateKeys(args, FILTER_DATA_OPTIONS, "filterData");
    const id = validateUserId(args.id, "Filtered dataset id");
    const source = validateUserId(
      args.source ?? this.context.currentData,
      "Source dataset id"
    );
    if (typeof args.field !== "string" || args.field.length === 0) {
      throw new TypeError("filterData requires a non-empty field string.");
    }

    return this
      .createDerivedData({
        id,
        source,
        transform: [{ type: "filter", field: args.field, oneOf: args.oneOf }]
      })
      .materializeFilteredData({ id });
  }
);

export const materializeRegressionData = action(
  {
    op: "materializeRegressionData",
    description: "Materialize one linear-regression derived dataset."
  },
  function (args = {}) {
    validateKeys(args, MATERIALIZE_OPTIONS, "materializeRegressionData");
    const id = validateUserId(args.id, "Derived dataset id");
    const dataset = this.semanticSpec.datasets.find(item => item.id === id);
    if (dataset === undefined || dataset.source === undefined) {
      throw new Error(`Unknown derived dataset "${id}".`);
    }
    if (dataset.values !== undefined) {
      throw new Error(`Derived dataset "${id}" is already materialized.`);
    }
    const source = this.semanticSpec.datasets.find(item => item.id === dataset.source);
    if (source?.values === undefined) {
      throw new Error(`Source dataset "${dataset.source}" has no values.`);
    }
    if (
      dataset.transform?.length !== 1 ||
      dataset.transform[0].type !== "regression"
    ) {
      throw new Error(`Derived dataset "${id}" requires one regression transform.`);
    }
    const transform = dataset.transform[0];
    const result = deriveLinearRegression(source.values, {
      x: transform.x,
      y: transform.y,
      groupBy: transform.groupBy,
      confidence: transform.confidence
    });
    return this.editSemantic({
      property: `dataset[${id}].values`,
      value: result.values
    });
  }
);

export const createRegressionData = action(
  {
    op: "createRegressionData",
    description: "Create grouped linear-regression values and confidence bounds."
  },
  function (args = {}) {
    validateKeys(args, REGRESSION_DATA_OPTIONS, "createRegressionData");
    const id = validateUserId(args.id, "Regression dataset id");
    const source = validateUserId(
      args.source ?? this.context.currentData,
      "Source dataset id"
    );
    const method = args.method ?? "linear";
    const confidence = args.confidence ?? 0.95;
    const interval = args.interval ?? "mean";
    const transform = {
      type: "regression",
      method,
      x: args.x,
      y: args.y,
      ...(args.groupBy === undefined ? {} : { groupBy: args.groupBy }),
      confidence,
      interval
    };

    return this
      .createDerivedData({ id, source, transform: [transform] })
      .materializeRegressionData({ id });
  }
);
