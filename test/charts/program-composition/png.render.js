import { registerVisualVariantTests } from "../../support/visual-variants.js";

import { createProgramCompositionExample } from
  "../../../examples/program-composition/program.js";
import { createProgramCompositionPrimitives } from "./primitive.program.js";

registerVisualVariantTests([{
  chart: "program-composition",
  variant: "example",
  title: "Program Composition",
  callChain: `hconcat({ programs: [main, detail] })
  .editCompositionLayout({ gap: 24, align: "start", padding: 12 })
  .replaceCompositionChild({ target: "detail", program: replacement });`,
  primitive: createProgramCompositionPrimitives,
  userFacing: createProgramCompositionExample,
  width: 588,
  height: 244,
  colors: ["#eff6ff", "#fff7ed", "#4c78a8", "#f58518", "#0f172a"],
  regions: [
    { name: "main", x: 12, y: 12, width: 280, height: 220 },
    { name: "detail", x: 316, y: 12, width: 260, height: 220 }
  ],
  artifact: false
}]);
