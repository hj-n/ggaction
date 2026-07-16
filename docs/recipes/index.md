---
layout: default
title: Chart Recipes
---

# Chart Recipes

Use a recipe when you know the chart type and want the shortest supported
action flow. Each recipe separates the decisions you must provide from the
resources, defaults, and guides that ggaction can infer.

<div class="docs-chart-index">
  {% include chart-card.html id="scatterplot" title="Scatterplot" url="/recipes/scatterplot/" summary="Choose two quantitative fields; infer scales and Cartesian guides." actions="createPointMark · encodeX · encodeY" %}
  {% include chart-card.html id="line" title="Line chart" url="/recipes/line-chart/" summary="Choose temporal x and quantitative y; infer aggregation and series paths." actions="createLineMark · encodeX · encodeY" %}
  {% include chart-card.html id="histogram" title="Histogram" url="/recipes/histogram/" summary="Choose one quantitative field; infer bins, count y, and zero baseline." actions="createBarMark · encodeHistogram" %}
  {% include chart-card.html id="bar" title="Bar chart" url="/recipes/bar-chart/" summary="Choose category and measure fields; infer aggregate band geometry." actions="createBarMark · encodeBarWidth" %}
  {% include chart-card.html id="regression" title="Regression scatterplot" url="/recipes/regression-scatterplot/" summary="Layer observations, grouped fits, and confidence bands." actions="createPointMark · createRegression" %}
  {% include chart-card.html id="density" title="Density area" url="/recipes/density-area/" summary="Derive density values and create grouped baseline-closed paths." actions="createAreaMark · encodeDensity" %}
  {% include chart-card.html id="error-bar" title="Error bar" url="/recipes/error-bar/" summary="Summarize grouped centers and intervals over existing observations." actions="createErrorBar" %}
  {% include chart-card.html id="error-band" title="Error band" url="/recipes/error-band/" summary="Derive intervals over an independent position and close one ribbon per series." actions="createErrorBand" %}
</div>

Every flow begins with `createCanvas`, `createData`, and a semantic mark or
composite action. Add explicit IDs only when the current program contains more
than one compatible resource.
