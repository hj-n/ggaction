import { action } from "../../core/action.js";
import { noOptions } from "../../core/validation.js";
import {
  normalizeTitleOptions,
  requireTitleConfig,
  resolveTitleLayout,
  validateTitleString
} from "./resolve.js";

function editText(program, id, text, style, x, y, textAlign) {
  return program
    .editGraphics({ target: id, property: "x", value: x })
    .editGraphics({ target: id, property: "y", value: y })
    .editGraphics({ target: id, property: "text", value: text })
    .editGraphics({ target: id, property: "fill", value: style.color })
    .editGraphics({ target: id, property: "fontSize", value: style.fontSize })
    .editGraphics({ target: id, property: "fontFamily", value: style.fontFamily })
    .editGraphics({ target: id, property: "fontWeight", value: style.fontWeight })
    .editGraphics({ target: id, property: "textAlign", value: textAlign })
    .editGraphics({ target: id, property: "textBaseline", value: "middle" });
}

export const editTitleText = action(
  { op: "editTitleText", description: "Rematerialize chart title text." },
  function (args = {}) {
    noOptions(args, "editTitleText");
    const config = requireTitleConfig(this);
    if (this.graphicSpec.objects.chartTitle?.type !== "text") {
      throw new Error("editTitleText requires an existing chart title graphic.");
    }
    const text = validateTitleString(
      this.semanticSpec.title.text,
      "Chart title text"
    );
    const layout = resolveTitleLayout(this, config);
    return editText(
      this,
      "chartTitle",
      text,
      config.titleStyle,
      layout.x,
      layout.titleY,
      layout.textAlign
    );
  }
);

export const createTitleText = action(
  { op: "createTitleText", description: "Create chart title text." },
  function (args = {}) {
    noOptions(args, "createTitleText");
    requireTitleConfig(this);
    if (this.graphicSpec.objects.chartTitle !== undefined) {
      throw new Error("createTitleText requires a missing chart title graphic.");
    }
    return this
      .createGraphics({ id: "chartTitle", type: "text" })
      .editTitleText();
  }
);

export const editSubtitleText = action(
  { op: "editSubtitleText", description: "Rematerialize chart subtitle text." },
  function (args = {}) {
    noOptions(args, "editSubtitleText");
    const config = requireTitleConfig(this);
    if (this.graphicSpec.objects.chartSubtitle?.type !== "text") {
      throw new Error(
        "editSubtitleText requires an existing chart subtitle graphic."
      );
    }
    const text = validateTitleString(
      this.semanticSpec.title.subtitle,
      "Chart subtitle"
    );
    const layout = resolveTitleLayout(this, config);
    return editText(
      this,
      "chartSubtitle",
      text,
      config.subtitleStyle,
      layout.x,
      layout.subtitleY,
      layout.textAlign
    );
  }
);

export const createSubtitleText = action(
  { op: "createSubtitleText", description: "Create chart subtitle text." },
  function (args = {}) {
    noOptions(args, "createSubtitleText");
    requireTitleConfig(this);
    validateTitleString(this.semanticSpec.title.subtitle, "Chart subtitle");
    if (this.graphicSpec.objects.chartSubtitle !== undefined) {
      throw new Error(
        "createSubtitleText requires a missing chart subtitle graphic."
      );
    }
    return this
      .createGraphics({ id: "chartSubtitle", type: "text" })
      .editSubtitleText();
  }
);

export const rematerializeTitle = action(
  { op: "rematerializeTitle", description: "Rematerialize chart title graphics." },
  function (args = {}) {
    noOptions(args, "rematerializeTitle");
    requireTitleConfig(this);
    let next = this.editTitleText();
    if (this.semanticSpec.title.subtitle !== undefined) {
      next = next.editSubtitleText();
    }
    return next;
  }
);

export const createTitle = action(
  { op: "createTitle", description: "Create a chart title and optional subtitle." },
  function (args = {}) {
    const options = normalizeTitleOptions(args);
    if (Object.keys(this.semanticSpec.title).length > 0) {
      throw new Error("createTitle requires missing semantic title state.");
    }
    if (
      this.graphicSpec.objects.chartTitle !== undefined ||
      this.graphicSpec.objects.chartSubtitle !== undefined
    ) {
      throw new Error("createTitle requires missing chart title graphics.");
    }

    const config = {
      position: options.position,
      align: options.align,
      offset: options.offset,
      gap: options.gap,
      titleStyle: options.titleStyle,
      subtitleStyle: options.subtitleStyle
    };
    let next = this
      .editSemantic({ property: "title.text", value: options.text });
    if (options.subtitle !== undefined) {
      next = next.editSemantic({
        property: "title.subtitle",
        value: options.subtitle
      });
    }
    next = next._withTitleConfig(config);
    resolveTitleLayout(next, config);
    next = next.createTitleText();
    if (options.subtitle !== undefined) next = next.createSubtitleText();
    return next;
  }
);
