# 🛠️ BuildIt

**Build orchestration, bundling, and AI context export utilities for Deno & Web projects.**

BuildIt is a modular, high-performance toolkit tailored for modern Deno 2.x workspaces. It provides automated bundling pipelines (via esbuild and native `Deno.bundle`), semantic version stamping, and intelligent source-code consolidation for AI model context windows (LLM snapshots).

[![Deno 2.x](https://img.shields.io/badge/Deno-2.x-black?logo=deno)](https://deno.com/)
[![JSR Package](https://jsr.io/badges/@vanaware/buildit)](https://jsr.io/@vanaware/buildit)
[![Preact Signals](https://img.shields.io/badge/UI-Preact%20%2B%20Signals-673ab8?logo=preact)](https://preactjs.com/)
[![BeerCSS](https://img.shields.io/badge/Style-BeerCSS%20(MD3)-orange)](https://www.beercss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Core Engines

BuildIt consolidates three specialized developer tools, all driven by declarative `.jsonc` configuration files:

### 1. ⚡ `esbuild` Pipeline (`esbuild.ts` & `esbuild.jsonc`)
- **Lightning-Fast Bundling:** Uses esbuild with `@deno/esbuild-plugin` to resolve remote imports, NPM specifiers, and JSR packages.
- **Declarative Targets:** Define multiple build targets in `esbuild.jsonc` (e.g., `ui`, `server`, `standalone`).
- **Automated Asset Management:** Cleans distribution directories, copies static files from `public/`, and automatically injects semantic release versions and hash timestamps into `manifest.json` and generated scripts.
- **Continuous Watch Mode:** Automatically watches file trees and recompiles instantly.

### 2. 📦 `denobuild` Engine (`build.ts` & `denobuild.jsonc`)
- **Native Deno Bundler:** Built on top of Deno's native `Deno.bundle` API (`--unstable-bundle`).
- **Zero External Binaries:** Produces standalone ECMAScript modules without requiring third-party native bundlers or external binaries.
- **Compile-Time Defines:** Injects dynamic compile-time constants and environment flags directly into the output code.

### 3. 📝 `export` Context Exporter (`export.ts` & `export.jsonc`)
- **AI-Ready Snapshots:** Consolidates source code into structured Markdown documents optimized for LLMs (such as Gemini, Claude, and GPT).
- **Intelligent Filtering:** Enforces allowed extensions, subdirectories, root files, and ignore patterns.
- **Anti-Loop Protection:** Prevents infinite directory traversals, symlink traps, and output file self-inclusion.
- **Dynamic Markdown Escaping:** Automatically escapes backticks inside source files to guarantee valid, uncorrupted code fences in generated snapshots.

---

## 📦 Monorepo Architecture

```
buildit/
├── packages/
│   ├── utils/          # 📦 @vanaware/buildit (Core library with all 3 engines & CLI runners)
│   ├── ui/             # 🖥️ @buildit/ui (Reactive dashboard built with Preact, Signals & BeerCSS)
│   └── server/         # 🌐 @buildit/server (High-performance static file server on port 3000)
├── snapshots/          # 📄 Generated Markdown AI context snapshots (ui.md, server.md, docs.md, utils.md)
├── esbuild.jsonc       # ⚙️ Configuration for esbuild pipeline
├── denobuild.jsonc     # ⚙️ Configuration for Deno.bundle engine
├── export.jsonc        # ⚙️ Configuration for AI context export targets
├── esbuild.ts          # 🚀 CLI entrypoint for esbuild orchestration
├── build.ts            # 🚀 CLI entrypoint for native denobuild
└── export.ts           # 🚀 CLI entrypoint for snapshot export
```

---

## 📚 Library Usage (`@vanaware/buildit`)

You can import BuildIt engines directly in any Deno application from [JSR](https://jsr.io/@vanaware/buildit):

### Installation & Imports

```ts
// esbuild Orchestration
import { runEsbuild } from "jsr:@vanaware/buildit/esbuild";

// Deno.bundle Native Engine
import { runDenoBuild } from "jsr:@vanaware/buildit/denobuild";

// AI Context Exporter
import { runExport } from "jsr:@vanaware/buildit/export";
```

### Programmatic Context Export Example

```ts
import { runExport } from "jsr:@vanaware/buildit/export";

const result = await runExport({
  target: "ui",
  configPath: "./export.jsonc",
});

console.log(`Snapshot generated at: ${result.outputPath}`);
console.log(`Processed ${result.filesCount} files in ${result.durationMs}ms`);
```

### JSR Export Map

| Specifier | Description |
|---|---|
| `@vanaware/buildit` | Root module re-exporting core utilities and shared interfaces |
| `@vanaware/buildit/esbuild` | esbuild bundling engine and configuration loaders |
| `@vanaware/buildit/esbuild/cli` | Command-line runner for the esbuild pipeline |
| `@vanaware/buildit/denobuild` | Native `Deno.bundle` engine and options resolver |
| `@vanaware/buildit/denobuild/cli` | Command-line runner for denobuild |
| `@vanaware/buildit/export` | Core walker, markdown formatter, and snapshot engine |
| `@vanaware/buildit/export/cli` | Command-line runner for AI context exports |
| `@vanaware/buildit/config` | JSONC file loaders and fallback configurations |
| `@vanaware/buildit/interfaces` | TypeScript contracts and options types |

---

## 🚀 Getting Started

### Prerequisites

All you need is [Deno 2.x](https://deno.com/) installed on your machine.
*(A minimal `package.json` and `install-script.sh` are included solely for cloud container compatibility).*

### Running the Development Server

To build the UI distribution and start the local server on port 3000:

```bash
deno task dev
```

Or when running in an npm-bridged environment:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to access the interactive dashboard.

---

## 🛠️ CLI Commands & Deno Tasks

### Building the Project

```bash
# Build with esbuild (default production build):
deno task build

# Build a specific target without incrementing version:
deno run -A ./esbuild.ts ui noversion

# Run with file watcher:
deno run -A ./esbuild.ts ui watch

# Build with native Deno.bundle:
deno task denobuild
```

### Exporting AI Context Snapshots

```bash
# Generate all snapshots configured in export.jsonc:
deno task export

# Generate a specific target:
deno run --allow-read --allow-write ./export.ts ui
deno run --allow-read --allow-write ./export.ts docs
deno run --allow-read --allow-write ./export.ts utils
```

### Quality Assurance & Testing

All tests are written using standard BDD syntax (`@std/testing/bdd`) and assertions (`@std/assert`):

```bash
# Run the test suite:
deno task test

# Run linter:
deno task lint

# Run type checks:
deno task check

# Run full quality check (lint + format + type check + tests):
deno task tests
```

---

## 🖥️ Interactive Dashboard Features

The embedded web interface (`packages/ui/`) provides:
- **Workspace Overview:** Live inventory of workspace packages, dependencies, and JSR modules.
- **CLI & Configuration Explorer:** Interactive documentation of `esbuild.jsonc`, `denobuild.jsonc`, and `export.jsonc` with syntax highlights.
- **Interactive Build Simulator:** Test pipeline parameters (minify, sourcemaps, clean dist) with simulated real-time logs powered by `@preact/signals`.
- **Snapshot Manager:** Review exported Markdown context sizes, target rules, and AI ingestion instructions.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
