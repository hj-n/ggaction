---
layout: default
title: Tutorials
---

# Tutorials

Build complete charts before exploring individual API options.

| Chart | Semantic mark | Core actions | Example result |
| --- | --- | --- | --- |
| Scatterplot | point | `encodeX`, `encodeY`, `encodeColor` | Quantitative points |
| Line chart | line | temporal `encodeX`, aggregate `encodeY` | Mean series over time |
| Histogram | bar | `encodeHistogram`, stacked `encodeColor` | Binned counts |
| Bar chart | bar | ordinal `encodeX`, aggregate `encodeY`, grouped `encodeColor` | Side-by-side aggregate bars |
| Regression scatterplot | point + area + line | `filterData`, appearance encodings, `createRegression` | Grouped fits and confidence bands |
| Density area | area | `encodeDensity`, grouped `encodeColor` | Overlaid probability densities |
| Error bar | rule | `createErrorBar` | Grouped mean confidence intervals |
| Error band | area | `createErrorBand` | Grouped confidence ribbons over an independent position |
| Mark selection | point, bar, line | `selectMarks`, `highlightMarks`, `filterMarks` | Selected-item filtering and emphasis |

Choose the chart whose semantic relationship matches the question you want to
answer. The bar tutorial uses grouped bars as its current example; grouping is
a layout choice, not a separate top-level chart type.

## Scatterplot

Create quantitative x/y positions, nominal color, constant point radius, and
Cartesian axes from the cars dataset.

[Build the cars scatterplot](./scatterplot.md)

## Aggregate line chart

Create temporal mean-aggregate series, combine color and stroke dash in one
legend, and add a chart title.

[Build the cars line chart](./line-chart.md)

## Stacked histogram

Bin a quantitative field, count and stack rows by category, infer histogram
guides, and center a chart title.

[Build the cars histogram](./histogram.md)

## Bar chart

Aggregate an ordinal x category and build a bar chart. The current example uses
a nominal color field to place groups side by side.

[Build a bar chart with grouped bars](./grouped-bar.md)

## Regression scatterplot

Filter rows, vary point size and shape, and layer grouped linear fits with 95%
mean-response confidence bands.

[Build the cars regression scatterplot](./regression-scatterplot.md)

## Density area chart

Derive grouped kernel-density values and overlay translucent,
zero-baseline areas with a top multi-column legend.

[Build the cars density area chart](./density-area.md)

## Error-bar chart

Derive grouped mean confidence intervals and materialize vertical rules with
fixed-width caps.

[Build the cars error-bar chart](./error-bar.md)

## Error-band chart

Derive grouped confidence intervals over time and materialize one closed area
path per series.

[Build the Gapminder error-band chart](./error-band.md)

## Mark selection and highlighting

Select grouped point extrema, complete histogram stacks, and categorical line
series through the same final-item selector grammar.

[Select, filter, and highlight marks](./mark-selection.md)
