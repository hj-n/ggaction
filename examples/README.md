# Examples

## Cars scatterplot

Serve the repository root over HTTP:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/examples/cars-scatterplot/>. The example uses
the Chart API to materialize 392 circles and the Canvas renderer to draw them.

## Primitive cars line chart

Open <http://localhost:8000/examples/cars-line-chart-primitives/>. This Phase 2
contract chart uses the explicit primitive program under `test/programs/` to
render three Origin paths, axes, a combined color/dash legend, and chart title.
