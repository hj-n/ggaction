import { action } from "../../../core/action.js";
import { validateKeys } from "../../../core/validation.js";

const OPTIONS = Object.freeze(["coordinate", "scale"]);

function makeRemoveAxis(channel) {
  const prefix = channel === "x" ? "X" : "Y";
  const operation = `remove${prefix}Axis`;
  const graphicIds = [
    `${channel}AxisLine`,
    `${channel}AxisTicks`,
    `${channel}AxisLabels`,
    `${channel}AxisTitle`
  ];
  return action(
    {
      op: operation,
      description: `Remove the complete ${channel}-axis resource.`
    },
    function (args = {}) {
      validateKeys(args, OPTIONS, operation);
      const semantic = this.semanticSpec.guides.axis?.[channel];
      const config = this.guideConfigs.axis?.[channel];
      const hasGraphic = graphicIds.some(
        id => this.graphicSpec.objects[id] !== undefined
      );
      if (semantic === undefined && config === undefined && !hasGraphic) {
        throw new Error(`${operation} requires an existing ${channel}-axis.`);
      }
      if (args.scale !== undefined && semantic?.scale !== args.scale) {
        throw new Error(`${operation} found no axis for scale "${args.scale}".`);
      }
      if (args.coordinate !== undefined && semantic?.coordinate !== args.coordinate) {
        throw new Error(
          `${operation} found no axis for coordinate "${args.coordinate}".`
        );
      }
      let next = semantic === undefined
        ? this
        : this.editSemantic({
            property: `guide.axis.${channel}`,
            remove: true
          });
      for (const id of graphicIds) {
        if (next.graphicSpec.objects[id] !== undefined) {
          next = next.editGraphics({ target: id, remove: true });
        }
      }
      return next._withoutMaterializationConfig(["guides", "axis", channel]);
    }
  );
}

export const removeXAxis = makeRemoveAxis("x");
export const removeYAxis = makeRemoveAxis("y");
