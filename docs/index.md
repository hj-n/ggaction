---
layout: default
title: ggaction Documentation
---

# ggaction Documentation

Build charts as immutable, traceable action programs. Start with a complete
example, then use the API pages when you need to customize one part.
The main, extension, and PNG entry points include TypeScript declarations.

> **Development status:** `ggaction` is currently used directly from this
> repository and is not published to npm yet. The documented API version is
> `0.0.0-dev`.

## Start here

<div class="docs-entry-grid">
  <a href="{{ '/getting-started/' | relative_url }}">
    <strong>Build your first chart</strong>
    <span>Run a complete repository example and understand the action chain.</span>
  </a>
  <a href="{{ '/recipes/' | relative_url }}">
    <strong>Start from a chart type</strong>
    <span>Copy the shortest supported scatterplot, line, bar, or area flow.</span>
  </a>
  <a href="{{ '/reference/actions/' | relative_url }}">
    <strong>Find an action</strong>
    <span>Look up exact signatures, defaults, inference, and related guides.</span>
  </a>
</div>

## Choose a chart

<div class="docs-chart-gallery">
  <a href="{{ '/tutorials/scatterplot/' | relative_url }}">
    <img src="{{ '/assets/images/cars-scatterplot.png' | relative_url }}" alt="Cars scatterplot">
    <span>Scatterplot</span>
  </a>
  <a href="{{ '/tutorials/line-chart/' | relative_url }}">
    <img src="{{ '/assets/images/cars-line-chart.png' | relative_url }}" alt="Cars aggregate line chart">
    <span>Line chart</span>
  </a>
  <a href="{{ '/tutorials/histogram/' | relative_url }}">
    <img src="{{ '/assets/images/cars-histogram.png' | relative_url }}" alt="Cars stacked histogram">
    <span>Histogram</span>
  </a>
  <a href="{{ '/tutorials/grouped-bar/' | relative_url }}">
    <img src="{{ '/assets/images/jobs-grouped-bar.png' | relative_url }}" alt="Jobs grouped bar example">
    <span>Bar chart</span>
  </a>
  <a href="{{ '/tutorials/regression-scatterplot/' | relative_url }}">
    <img src="{{ '/assets/images/cars-regression-scatterplot.png' | relative_url }}" alt="Cars regression scatterplot with confidence bands">
    <span>Regression scatterplot</span>
  </a>
  <a href="{{ '/tutorials/density-area/' | relative_url }}">
    <img src="{{ '/assets/images/cars-density-area.png' | relative_url }}" alt="Cars density area chart">
    <span>Density area</span>
  </a>
</div>

## Go deeper

Understand [immutable ChartProgram state](./concepts/chart-program.md),
[semantic and graphical state](./concepts/semantic-and-graphics.md), and
[action trace trees](./concepts/actions-and-trace.md). Extension authors can
continue with [action authoring](./extension/action-authoring.md) and the
[primitive API](./extension/primitives.md). For boundaries and failures, see
[supported features](./supported-features.md) and
[troubleshooting](./troubleshooting.md).

Source, issues, and development history are available on
[GitHub](https://github.com/hj-n/ggaction).
