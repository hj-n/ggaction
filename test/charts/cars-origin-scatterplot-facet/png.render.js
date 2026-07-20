import { registerVisualVariantTests } from "../../support/visual-variants.js";
import { visualVariants as facetVariants } from "./manifest.js";

registerVisualVariantTests(facetVariants.filter(
  variant => variant.chart === "cars-origin-scatterplot-facet"
));
