# @vanaware/buildit

Build orchestration, continuous development watcher, bundling, and AI context export utilities for Deno and Web projects.

`buildit` provides 4 modular engines for modern web development:
1. ⚡ **esbuild Engine**: Production-ready bundling with `@deno/esbuild-plugin` and asset pipelines.
2. 👀 **Watch Engine**: Real-time continuous development rebuilder based on `esbuild.context`.
3. 📦 **Deno.bundle Engine**: Native runtime bundling with zero external binary dependencies.
4. 📝 **AI Context Exporter**: Intelligent snapshot generator structuring codebase context into Markdown for LLMs.

## Installation

```bash
deno add jsr:@vanaware/buildit
```

## CLI Usage

`buildit` includes CLI runners for all four utilities. You can execute them directly via `deno run` or via JSR:

### ⚡ esbuild CLI (Production Bundling)
```bash
# Run all default targets defined in esbuild.jsonc
deno run -A jsr:@vanaware/buildit/esbuild/cli

# Run specific targets and skip version bump
deno run -A jsr:@vanaware/buildit/esbuild/cli ui --noversion
```

### 👀 Watch CLI (Continuous Development)
```bash
# Start watching targets defined in watch.jsonc
deno run -A jsr:@vanaware/buildit/watch/cli

# Watch a specific target
deno run -A jsr:@vanaware/buildit/watch/cli ui
```

### 📦 Deno.bundle CLI (Native Packaging)
```bash
# Run with default denobuild.jsonc
deno run --unstable-bundle -A jsr:@vanaware/buildit/denobuild/cli ui
```

### 📝 Export CLI (AI Context Snapshots)
```bash
# Export all default snapshots defined in export.jsonc
deno run -A jsr:@vanaware/buildit/export/cli

# Export specific snapshots
deno run -A jsr:@vanaware/buildit/export/cli ui docs
```

---

## 💡 Configuration Schemas ($schema)

All configuration files support official JSON Schemas for instant validation, autocomplete, and inline documentation in VSCode, Cursor, Zed, and Neovim.

The schemas are distributed inside the package under the `schema/` directory:
- `schema/esbuild.json` (for `esbuild.jsonc`)
- `schema/watch.json` (for `watch.jsonc`)
- `schema/denobuild.json` (for `denobuild.jsonc`)
- `schema/export.json` (for `export.jsonc`)

### How to use $schema in your files:

Add the `$schema` property pointing to the local schema or URL:

```jsonc
{
  "$schema": "./packages/utils/schema/esbuild.json",
  "version": "1.0.0",
  "targets": {
    "ui": {
      "entryPoints": ["main.tsx"],
      "distdir": "dist",
      "format": "esm"
    }
  }
}
```

---

## Programmatic API

```ts
import { esBuild } from "jsr:@vanaware/buildit/esbuild";
import { watchEngine } from "jsr:@vanaware/buildit/watch";
import { exportEngine } from "jsr:@vanaware/buildit/export";

// 1. Run esbuild compilation
await esBuild({
  config: {
    ui: {
      entryPoints: ["packages/ui/src/main.tsx"],
      distdir: "dist",
    },
  },
  noversion: true,
});

// 2. Start continuous watch mode
const handles = await watchEngine({
  config: {
    ui: {
      entryPoints: ["packages/ui/src/main.tsx"],
      distdir: "dist",
      sourcemap: "inline",
    },
  },
});

// 3. Generate AI context snapshot
await exportEngine({
  config: {
    ui: {
      arquivoSaida: "snapshots/ui.md",
      includes: ["packages/ui/{src,public}/**/*.{ts,tsx,html,css}"],
      excludes: ["**/*.test.ts"],
      incluiVersao: true,
      instrucaoCustomizada: "Contexto UI",
    },
  },
});
```

## API Exports Overview

| Export Path | Description |
| :--- | :--- |
| `.` | Root entrypoint with shared utilities, version sync, and target resolution helpers. |
| `./esbuild` | esbuild bundling engine, static asset copier, and manifest stampers. |
| `./esbuild/cli` | CLI runner for production esbuild pipelines. |
| `./watch` | Continuous development watch engine with `esbuild.context`. |
| `./watch/cli` | CLI runner for continuous watch and live rebuilds. |
| `./denobuild` | Native `Deno.bundle` packaging engine. |
| `./denobuild/cli` | CLI runner for native `Deno.bundle`. |
| `./export` | LLM context generator, path scanner, and Markdown formatter. |
| `./export/cli` | CLI runner for AI context exports. |

## License

MIT
