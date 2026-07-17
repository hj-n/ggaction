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
  width: 528,
  height: 224,
  colors: ["#4c78a8", "#54a24b"],
  regions: [
    { name: "main", x: 12, y: 12, width: 260, height: 200 },
    { name: "detail", x: 296, y: 12, width: 220, height: 200 }
  ],
  artifact: false
}]);
