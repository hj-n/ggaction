# ggaction

`ggaction` is a JavaScript library for representing chart authoring as immutable,
traceable actions.

The first vertical slice is implemented: immutable programs, hierarchical
action traces, the three authoring primitives, and a Canvas renderer for
concrete `canvas` and `circle` graphics.

```javascript
import { chart } from "ggaction";

const program = chart();
```

See the runnable [cars scatterplot example](./examples/cars-scatterplot/),
which renders 392 rows from `data/cars.json` through the low-level extension
API. Domain-specific chart actions will be added in later steps.

## Development

```bash
npm test
```

## Documentation

- [Documentation home](./docs/index.md)
- [Core concepts](./docs/core-concepts.md)
- [Action authoring](./docs/action-authoring.md)
