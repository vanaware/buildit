# buildit

Build orchestration, bundling, and AI context export utilities for Deno and Web projects.

`buildit` provides modular engines to bundle web applications using esbuild or native `Deno.bundle`, alongside an intelligent snapshot generator that formats codebase context into structured Markdown for LLMs.

## Installation

```bash
deno add jsr:@vanaware/buildit
```

## Basic Usage

Exporting codebase context for AI workflows:

```ts
import { runExport } from "jsr:@vanaware/buildit/export";

// Generate an AI context snapshot for the UI target
const result = await runExport({
  target: "ui",
  configPath: "./export.jsonc",
});

console.log(`Snapshot generated at ${result.outputPath}`);
console.log(`Included ${result.filesCount} files in ${result.durationMs}ms`);
```

## CLI Usage

`buildit` includes CLI runners for all three engines. You can run them directly via `deno run`:

### ⚡ esbuild CLI
Bundle your application using the esbuild engine.
```bash
# Run with default esbuild.jsonc
deno run -A jsr:@vanaware/buildit/esbuild/cli

# Specify targets and skip version bump
deno run -A jsr:@vanaware/buildit/esbuild/cli ui --noversion
```

### 📦 Deno.bundle CLI
Package your application using the native Deno.bundle engine.
```bash
# Run with default denobuild.jsonc
deno run -A jsr:@vanaware/buildit/denobuild/cli

# Run specific targets
deno run -A jsr:@vanaware/buildit/denobuild/cli ui
```

### 📝 Export CLI
Generate AI context snapshots.
```bash
# Run with default export.jsonc
deno run -A jsr:@vanaware/buildit/export/cli

# Run specific modes
deno run -A jsr:@vanaware/buildit/export/cli ui docs
```

## Features

- ⚡ **esbuild Pipeline**: High-speed bundling with `@deno/esbuild-plugin`, asset management, and version stamping.
- 📦 **Native Deno Bundler**: Standalone packaging powered by `Deno.bundle` (`--unstable-bundle`) without external binary dependencies.
- 📝 **AI Context Snapshots**: Structured Markdown generator with recursive path scanning, token-friendly delimiters, and anti-loop safeguards.
- ⚙️ **Declarative JSONC Config**: Type-safe configuration loaders supporting `.jsonc` and JSON Schemas.
- 🏷️ **Semantic Versioning**: Automated SemVer synchronization and build timestamp injection across workspaces.

## Configuration Schemas

The configuration files support JSON Schemas for improved editor experience. You can find them in the `schema/` directory:

- `packages/utils/schema/esbuild.json`
- `packages/utils/schema/denobuild.json`
- `packages/utils/schema/export.json`

To use them, add the `$schema` property to your config files:

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/vanaware/buildit/main/packages/utils/schema/esbuild.json",
  "targets": { ... }
}
```

## API Overview

| Export Path | Description |
| :--- | :--- |
| `.` | Root entrypoint re-exporting core types, configuration loaders, and version helpers. |
| `./esbuild` | esbuild bundling engine, file watchers, asset copy, and manifest stampers. |
| `./esbuild/cli` | CLI runner for esbuild pipelines. |
| `./denobuild` | Native `Deno.bundle` packaging engine and defines injector. |
| `./denobuild/cli` | CLI runner for native `Deno.bundle`. |
| `./export` | LLM context generator, AST/file scanner, and Markdown formatter. |
| `./export/cli` | CLI runner for AI context exports. |
| `./config` | JSONC configuration parsers and CLI flag utilities. |
| `./interfaces` | TypeScript interfaces, target configuration types, and contracts. |

## Examples

### Bundling with esbuild

```ts
import { runEsbuild } from "jsr:@vanaware/buildit/esbuild";

await runEsbuild({
  targets: ["ui"],
  configPath: "./esbuild.jsonc",
  noversion: true,
});
```

### Packaging with Native Deno.bundle

```ts
import { runDenoBuild } from "jsr:@vanaware/buildit/denobuild";

await runDenoBuild({
  targets: ["ui"],
  configPath: "./denobuild.jsonc",
  noversion: true,
});
```

## Documentation

For full API references, type definitions, and generated docs, visit the
[package page on JSR](https://jsr.io/@vanaware/buildit).
