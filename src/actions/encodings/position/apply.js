function replaceAlternateBinding(program, target, channel, previous, usesField) {
  if (previous === undefined) return program;
  const alternate = usesField ? "datum" : "field";
  return Object.hasOwn(previous, alternate)
    ? program.editSemantic({
        property: `layer[${target}].encoding.${channel}.${alternate}`,
        remove: true
      })
    : program;
}

function applyBin(program, target, channel, previous, bin) {
  if (bin === undefined) return program;
  const [mode] = Object.keys(bin);
  let next = program;
  for (const previousMode of Object.keys(previous?.bin ?? {})) {
    if (previousMode === mode) continue;
    next = next.editSemantic({
      property: `layer[${target}].encoding.${channel}.bin.${previousMode}`,
      remove: true
    });
  }
  return next.editSemantic({
    property: `layer[${target}].encoding.${channel}.bin.${mode}`,
    value: bin[mode]
  });
}

export function applyPositionSemantics(program, {
  target,
  channel,
  previous,
  field,
  datum,
  hasField,
  fieldType,
  bin,
  aggregate,
  stack
}) {
  let next = replaceAlternateBinding(
    program,
    target,
    channel,
    previous,
    hasField
  )
    .editSemantic({
      property: `layer[${target}].encoding.${channel}.${hasField ? "field" : "datum"}`,
      value: hasField ? field : datum
    })
    .editSemantic({
      property: `layer[${target}].encoding.${channel}.fieldType`,
      value: fieldType
    });

  next = applyBin(next, target, channel, previous, bin);
  for (const [property, value] of Object.entries({ aggregate, stack })) {
    if (value === undefined) continue;
    next = next.editSemantic({
      property: `layer[${target}].encoding.${channel}.${property}`,
      value
    });
  }
  return next;
}
