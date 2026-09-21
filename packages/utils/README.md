# 🛠️ @vanaware/buildit

**Build orchestration, bundling, and AI context export utilities for Deno & Web projects.**

This package contains the core engine and CLI utilities for BuildIt:
- **`esbuild`**: Pipeline for web asset bundling with `@deno/esbuild-plugin`.
- **`denobuild`**: Native `Deno.bundle` packager for standalone scripts and libraries.
- **`export`**: Workspace scanner and Markdown context generator for LLM prompts.

## Quick Start

```ts
import { runExport } from "jsr:@vanaware/buildit/export";
import { runEsbuild } from "jsr:@vanaware/buildit/esbuild";
import { runDenoBuild } from "jsr:@vanaware/buildit/denobuild";
```

Refer to the main [README.md](../../README.md) for full workspace documentation and examples.
