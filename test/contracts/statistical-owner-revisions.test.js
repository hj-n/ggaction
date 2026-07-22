import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  ACTION_INDEX,
  REPOSITORY_ROOT
} from "../support/action-contracts.js";

const declarations = readFileSync(
  path.join(REPOSITORY_ROOT, "types/program.d.ts"),
  "utf8"
);

test("publishes statistical-owner revision options as current behavior", () => {
  assert.doesNotMatch(
    JSON.stringify(ACTION_INDEX.plannedCapabilities),
    /statistical-owner-revisions/
  );
  assert.match(
    declarations,
    /interface EditErrorBarOptions \{[\s\S]*statistics\?: \{[\s\S]*center\?: IntervalCenter;[\s\S]*extent\?: IntervalExtent;[\s\S]*level\?: number;/
  );
  assert.match(
    declarations,
    /interface EditErrorBandOptions \{[\s\S]*statistics\?: \{[\s\S]*boundaries\?: false \| \{/
  );
  assert.match(
    declarations,
    /interface EditDensityOptions \{[\s\S]*source\?: string;[\s\S]*field\?: string;[\s\S]*groupBy\?: string \| false;/
  );
  assert.match(
    declarations,
    /interface EditRegressionOptions \{[\s\S]*data\?: string;[\s\S]*x\?: string;[\s\S]*y\?: string;[\s\S]*groupBy\?: string \| false;/
  );
});
