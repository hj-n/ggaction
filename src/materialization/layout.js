const LAYOUT_CONSUMER_POLICIES = Object.freeze([
  Object.freeze({
    applies(program) {
      return program.semanticSpec.title.text !== undefined &&
        program.titleConfig !== undefined;
    },
    step: Object.freeze({ op: "rematerializeTitle" })
  })
]);

export function planLayoutRematerialization(program) {
  return LAYOUT_CONSUMER_POLICIES.flatMap(policy =>
    policy.applies(program) ? [policy.step] : []
  );
}
