function freeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function requireField(value, label) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value;
}

function orderedValue(value, label) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.getTime();
  }
  if (typeof value === "string" && value.length > 0) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  throw new TypeError(`${label} must contain finite numeric or temporal values.`);
}

function signOf(value) {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "zero";
}

function groupRows(rows, xField, yField, groupBy, missing) {
  const groups = [];
  const byGroup = new Map();
  for (const [sourceRowIndex, row] of rows.entries()) {
    if (row === null || typeof row !== "object" || Array.isArray(row)) {
      throw new TypeError(`Horizon row ${sourceRowIndex} must be an object.`);
    }
    const group = groupBy === undefined ? null : row[groupBy];
    if (!byGroup.has(group)) {
      const entry = { group, groupIndex: groups.length, rows: [] };
      byGroup.set(group, entry);
      groups.push(entry);
    }
    const x = orderedValue(row[xField], `Horizon x field "${xField}"`);
    const y = row[yField];
    const isMissing = !Number.isFinite(y);
    if (isMissing && missing === "error") {
      throw new Error(
        `Horizon y field "${yField}" is missing at source row ${sourceRowIndex}.`
      );
    }
    byGroup.get(group).rows.push({
      sourceRowIndex,
      sourceX: row[xField],
      x,
      y,
      missing: isMissing
    });
  }

  for (const entry of groups) {
    entry.rows.sort((left, right) =>
      left.x - right.x || left.sourceRowIndex - right.sourceRowIndex
    );
    for (let index = 1; index < entry.rows.length; index += 1) {
      if (entry.rows[index - 1].x === entry.rows[index].x) {
        throw new Error(
          `Horizon group ${JSON.stringify(entry.group)} has duplicate x value ` +
          `${JSON.stringify(entry.rows[index].sourceX)}.`
        );
      }
    }
  }
  return groups;
}

function splitValidSegments(rows, baseline) {
  const segments = [];
  let current = [];
  const flush = () => {
    if (current.length > 0) segments.push(current);
    current = [];
  };
  for (const row of rows) {
    if (row.missing) {
      flush();
      continue;
    }
    current.push({
      ...row,
      signed: row.y - baseline,
      interpolated: false
    });
  }
  flush();
  return segments;
}

function insertBaselineCrossings(points, baseline) {
  if (points.length < 2) return points.map(point => ({ ...point }));
  const output = [{ ...points[0] }];
  for (let index = 1; index < points.length; index += 1) {
    const left = points[index - 1];
    const right = points[index];
    if (left.signed * right.signed < 0) {
      const fraction = (baseline - left.y) / (right.y - left.y);
      output.push({
        sourceRowIndex: undefined,
        sourceX: undefined,
        x: left.x + (right.x - left.x) * fraction,
        y: baseline,
        missing: false,
        signed: 0,
        interpolated: true,
        leftSourceRowIndex: left.sourceRowIndex,
        rightSourceRowIndex: right.sourceRowIndex,
        fraction
      });
    }
    output.push({ ...right });
  }
  return output;
}

function runsForSign(points, desiredSign) {
  const runs = [];
  let current = [];
  let pendingZeros = [];
  const flush = () => {
    if (current.some(point => signOf(point.signed) === desiredSign)) {
      runs.push(current);
    }
    current = [];
  };

  for (const point of points) {
    const sign = signOf(point.signed);
    if (sign === desiredSign) {
      if (current.length === 0 && pendingZeros.length > 0) {
        current.push(...pendingZeros);
      }
      current.push(point);
      pendingZeros = [];
      continue;
    }
    if (sign === "zero") {
      if (current.length > 0) {
        current.push(point);
        flush();
      }
      pendingZeros = [point];
      continue;
    }
    flush();
    pendingZeros = [];
  }
  flush();
  return runs;
}

function groupMagnitude(group) {
  return Math.max(
    0,
    ...group.segments.flatMap(segment => segment.map(point =>
      Math.abs(point.signed)
    ))
  );
}

function resolveExtent(groups, requested, resolve) {
  if (requested !== "auto") {
    return groups.map(() => requested);
  }
  if (resolve === "shared") {
    const shared = Math.max(0, ...groups.map(groupMagnitude));
    return groups.map(() => shared);
  }
  return groups.map(groupMagnitude);
}

function bandSeries(group, extent, options) {
  if (extent === 0) return [];
  const bandHeight = extent / options.bands;
  const output = [];
  for (const sign of ["negative", "positive"]) {
    let signSegmentIndex = 0;
    const runs = [];
    for (const sourceSegment of group.segments) {
      for (const run of runsForSign(sourceSegment, sign)) {
        runs.push({
          points: run,
          segmentId: `${group.groupIndex}:${sign}:${signSegmentIndex}`
        });
        signSegmentIndex += 1;
      }
    }
    for (let bandIndex = 0; bandIndex < options.bands; bandIndex += 1) {
      for (const run of runs) {
          const points = run.points.map(point => {
            const rawMagnitude = Math.abs(point.signed);
            const overflowed = rawMagnitude > extent;
            if (overflowed && options.overflow === "error") {
              throw new RangeError(
                `Horizon magnitude ${rawMagnitude} exceeds extent ${extent}.`
              );
            }
            const magnitude = Math.min(rawMagnitude, extent);
            const amplitude = Math.min(
              bandHeight,
              Math.max(0, magnitude - bandIndex * bandHeight)
            );
            return {
              ...point,
              sign,
              magnitude,
              rawMagnitude,
              amplitude,
              lower: 0,
              upper: amplitude,
              overflowed
            };
          });
          if (points.some(point => point.amplitude > 0)) {
            output.push({
              group: group.group,
              groupIndex: group.groupIndex,
              sign,
              bandIndex,
              segmentId: run.segmentId,
              bandHeight,
              points
            });
          }
      }
    }
  }
  return output;
}

export function calculateHorizon(rows, {
  xField,
  yField,
  groupBy,
  bands = 3,
  baseline = 0,
  extent = "auto",
  resolve = "shared",
  missing = "break",
  overflow = "clip"
} = {}) {
  if (!Array.isArray(rows)) throw new TypeError("Horizon rows must be an array.");
  requireField(xField, "Horizon xField");
  requireField(yField, "Horizon yField");
  if (groupBy !== undefined) requireField(groupBy, "Horizon groupBy");
  if (!Number.isInteger(bands) || bands <= 0) {
    throw new RangeError("Horizon bands must be a positive integer.");
  }
  if (!Number.isFinite(baseline)) {
    throw new TypeError("Horizon baseline must be finite.");
  }
  if (extent !== "auto" && (!Number.isFinite(extent) || extent <= 0)) {
    throw new RangeError('Horizon extent must be "auto" or a positive number.');
  }
  if (!new Set(["shared", "independent"]).has(resolve)) {
    throw new Error(`Unknown Horizon resolve "${resolve}".`);
  }
  if (!new Set(["break", "error"]).has(missing)) {
    throw new Error(`Unknown Horizon missing policy "${missing}".`);
  }
  if (!new Set(["clip", "error"]).has(overflow)) {
    throw new Error(`Unknown Horizon overflow policy "${overflow}".`);
  }

  const grouped = groupRows(rows, xField, yField, groupBy, missing).map(entry => ({
    ...entry,
    segments: splitValidSegments(entry.rows, baseline).map(segment =>
      insertBaselineCrossings(segment, baseline)
    )
  }));
  const extents = resolveExtent(grouped, extent, resolve);
  const groups = grouped.map((group, index) => ({
    group: group.group,
    groupIndex: group.groupIndex,
    extent: extents[index],
    bandHeight: extents[index] === 0 ? 0 : extents[index] / bands,
    segments: group.segments
  }));
  const series = groups.flatMap((group, index) => bandSeries(
    grouped[index],
    extents[index],
    { bands, overflow }
  ));

  return freeze({
    bands,
    baseline,
    extent,
    resolve,
    missing,
    overflow,
    groups,
    series
  });
}
