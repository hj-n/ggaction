---
layout: default
title: ggaction Documentation
---

# ggaction Documentation

`ggaction` models chart authoring as a sequence of immutable actions while
retaining both semantic intent and fully materialized graphics.

> **Current status:** The project skeleton is in place. Runtime behavior for
> `chart()`, the primitive actions, and `render()` is not implemented yet.

## Start here

| Page | Description |
| --- | --- |
| [Core concepts](./core-concepts.md) | `ChartProgram`, actions, primitives, traces, and rendering boundaries |
| [Repository README](https://github.com/hj-n/ggaction#readme) | Project status and development commands |
| [Initial architecture](https://github.com/hj-n/ggaction/blob/main/agent_docs/INITIAL_ARCHITECTURE.md) | Historical design reference rather than the current contract |

## Documentation principles

- These pages describe behavior that exists or is explicitly marked as planned.
- Public APIs and core contracts are documented; incidental internal helpers are not.
- Documentation changes accompany the implementation changes they describe.
- Implementation plans live separately under `agent_docs/impl/` and are written
  in Korean for collaboration.
