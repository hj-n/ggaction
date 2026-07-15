---
layout: default
title: Chart Recipes
---

# Chart Recipes

Use a recipe when you already know the chart type and want the shortest
supported action flow. Tutorials explain one complete dataset; recipes separate
required author decisions from library inference.

| Chart | Required decisions | Main inference | Recipe |
| --- | --- | --- | --- |
| Scatterplot | x field, y field | quantitative scales and Cartesian guides | [Scatterplot](./scatterplot.md) |
| Line chart | temporal x, quantitative y | mean aggregation, sorted paths, guides | [Line chart](./line-chart.md) |
| Histogram | quantitative field | bins, count y, zero stack, guides | [Histogram](./histogram.md) |
| Bar chart | ordinal x, quantitative y | mean y and band geometry | [Bar chart](./bar-chart.md) |
| Regression scatterplot | point x/y and optional group | grouped OLS, confidence bands, shared guides | [Regression scatterplot](./regression-scatterplot.md) |
| Density area | quantitative value and optional group | KDE data, scales, closed paths | [Density area](./density-area.md) |
| Error bar | independent x and quantitative y | mean 95% CI, rules, caps, guides | [Error bar](./error-bar.md) |
| Error band | independent position, quantitative interval, optional group | mean 95% CI, ranged area paths, guides | [Error band](./error-band.md) |

Every flow begins with `createCanvas`, `createData`, and a semantic mark. Add
explicit IDs only when the current program state contains multiple compatible
resources.
