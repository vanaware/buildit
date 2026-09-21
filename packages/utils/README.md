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

## Features

- ⚡ **esbuild Pipeline**: High-speed bundling with `@deno/esbuild-plugin`, asset management, and version stamping.
- 📦 **Native Deno Bundler**: Standalone packaging powered by `Deno.bundle` (`--unstable-bundle`) without external binary dependencies.
- 📝 **AI Context Snapshots**: Structured Markdown generator with recursive path scanning, token-friendly delimiters, and anti-loop safeguards.
- ⚙️ **Declarative JSONC Config**: Type-safe configuration loaders supporting `.jsonc` and fallback defaults.
- 🏷️ **Semantic Versioning**: Automated SemVer synchronization and build timestamp injection across workspaces.

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
