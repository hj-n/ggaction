import { registerTextMarkActions as registerTextCoreActions } from "./actions.js";
import { registerTextLabelLayoutActions } from "./layout.js";

export function registerTextMarkActions(ProgramClass) {
  registerTextCoreActions(ProgramClass);
  registerTextLabelLayoutActions(ProgramClass);
}
