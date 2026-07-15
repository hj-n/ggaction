import {
  createSubtitleText,
  createTitle,
  createTitleText,
  editTitle,
  editSubtitleText,
  editTitleText,
  rematerializeTitle
} from "./actions.js";

export function registerTitleActions(ProgramClass) {
  ProgramClass.prototype.createTitle = createTitle;
  ProgramClass.prototype.editTitle = editTitle;
  ProgramClass.prototype.createTitleText = createTitleText;
  ProgramClass.prototype.editTitleText = editTitleText;
  ProgramClass.prototype.createSubtitleText = createSubtitleText;
  ProgramClass.prototype.editSubtitleText = editSubtitleText;
  ProgramClass.prototype.rematerializeTitle = rematerializeTitle;
}
