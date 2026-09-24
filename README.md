# 🛠️ BuildIt

**Build orchestration, continuous development watcher, bundling, and AI context export utilities for Deno & Web projects.**

BuildIt is a modular, high-performance toolkit tailored for modern Deno 2.x workspaces. It provides automated production bundling pipelines (via esbuild and native `Deno.bundle`), real-time continuous development watching, semantic version stamping, and intelligent source-code consolidation for AI model context windows (LLM snapshots).

[![Deno 2.x](https://img.shields.io/badge/Deno-2.x-black?logo=deno)](https://deno.com/)
[![JSR Package](https://jsr.io/badges/@vanaware/buildit)](https://jsr.io/@vanaware/buildit)
[![Preact Signals](https://img.shields.io/badge/UI-Preact%20%2B%20Signals-673ab8?logo=preact)](https://preactjs.com/)
[![BeerCSS](https://img.shields.io/badge/Style-BeerCSS%20(MD3)-orange)](https://www.beercss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Core Engines

BuildIt consolidates four specialized developer tools, all driven by declarative `.jsonc` configuration files:

### 1. ⚡ `esbuild` Pipeline (`esbuild.ts` & `esbuild.jsonc`)
- **Lightning-Fast Production Bundling:** Uses esbuild with `@deno/esbuild-plugin` to resolve remote imports, NPM specifiers, and JSR packages.
- **Declarative Targets:** Define multiple build targets in `esbuild.jsonc` (e.g., `ui`, `server`, `standalone`).
- **Automated Asset Management:** Cleans distribution directories, copies static files from `public/`, and automatically injects semantic release versions and hash timestamps into `manifest.json` and generated scripts.

### 2. 👀 `watch` Engine (`watch.ts` & `watch.jsonc`)
- **Real-Time Continuous Development:** Powered by `esbuild.context` for sub-millisecond incremental rebuilds during development.
- **Isolated Development Workflow:** Completely separated from production bundling, keeping configurations clean and focused.

### 3. 📦 `denobuild` Engine (`denobuild.ts` & `denobuild.jsonc`)
- **Native Deno Bundler:** Built on top of Deno's native `Deno.bundle` API (`--unstable-bundle`).
- **Zero External Binaries:** Produces standalone ECMAScript modules without requiring third-party native bundlers.
- **Compile-Time Defines:** Injects dynamic compile-time constants and environment flags directly into the output code.

### 4. 📝 `export` Context Exporter (`export.ts` & `export.jsonc`)
- **AI-Ready Snapshots:** Consolidates source code into structured Markdown documents optimized for LLMs (such as Gemini, Claude, and GPT).
- **Intelligent Filtering:** Enforces allowed extensions, subdirectories, root files, and ignore patterns.
- **Anti-Loop Protection:** Prevents infinite directory traversals, symlink traps, and output file self-inclusion.
- **Read-Only Version Mode:** Enriches Markdown headers with project version information without mutating or bumping version numbers.

### 🧼 5. Version Automation (`sanitize-version.ts` & `tag-version.ts`)
- **Sanitize Version:** Enforces strict `MAJOR.MINOR.PATCH` format by removing git hashes or pre-release suffixes from `deno.jsonc`.
- **Automated Tagging:** Handles the full release cycle: sanitization, git commit, local/remote tag cleanup, and pushing new annotated tags (`vMAJOR.MINOR`).

---

## 📦 Monorepo Architecture

```
buildit/
├── packages/
│   ├── utils/          # 📦 @vanaware/buildit (Core library with all 4 engines, schemas & CLI runners)
│   ├── ui/             # 🖥️ @buildit/ui (Reactive dashboard built with Preact, Signals & BeerCSS)
│   └── server/         # 🌐 @buildit/server (High-performance static file server on port 3000)
├── snapshots/          # 📄 Generated Markdown AI context snapshots (ui.md, server.md, docs.md, utils.md)
├── esbuild.jsonc       # ⚙️ Configuration for esbuild production pipeline
├── watch.jsonc         # ⚙️ Configuration for continuous development watch engine
├── denobuild.jsonc     # ⚙️ Configuration for Deno.bundle engine
├── export.jsonc        # ⚙️ Configuration for AI context export targets
├── esbuild.ts          # 🚀 CLI entrypoint for esbuild orchestration
├── watch.ts            # 🚀 CLI entrypoint for continuous watching
├── denobuild.ts        # 🚀 CLI entrypoint for native denobuild
└── export.ts           # 🚀 CLI entrypoint for snapshot export
```

---

## 📚 Library Usage (`@vanaware/buildit`)

You can import BuildIt engines directly in any Deno application from [JSR](https://jsr.io/@vanaware/buildit).
For complete API and configuration details, see the **[API and Configuration Reference (docs/api.md)](docs/api.md)**.

### Installation & Imports

```ts
import { esBuild } from "jsr:@vanaware/buildit/esbuild";
import { watchEngine } from "jsr:@vanaware/buildit/watch";
import { denoBuild } from "jsr:@vanaware/buildit/denobuild";
import { exportEngine } from "jsr:@vanaware/buildit/export";
```

### JSR Export Map

| Specifier | Description |
|---|---|
| `@vanaware/buildit` | Root module re-exporting core utilities and shared interfaces |
| `@vanaware/buildit/esbuild` | esbuild production bundling engine and configuration loaders |
| `@vanaware/buildit/esbuild/cli` | Command-line runner for the esbuild pipeline |
| `@vanaware/buildit/watch` | Continuous development watch engine with `esbuild.context` |
| `@vanaware/buildit/watch/cli` | Command-line runner for continuous watch and live rebuilds |
| `@vanaware/buildit/denobuild` | Native `Deno.bundle` engine and options resolver |
| `@vanaware/buildit/denobuild/cli` | Command-line runner for denobuild |
| `@vanaware/buildit/export` | Core walker, markdown formatter, and snapshot engine |
| `@vanaware/buildit/export/cli` | Command-line runner for AI context exports |
| `@vanaware/buildit/sanitize-version` | Utility for strict SemVer normalization |
| `@vanaware/buildit/tag-version` | Automated Git tag and release orchestrator |

---

## 💡 JSON Schemas ($schema)

BuildIt provides official JSON Schemas inside `packages/utils/schema/` for instant autocomplete and validation in VSCode, Zed, Cursor, and Neovim:

```jsonc
{
  "$schema": "./packages/utils/schema/esbuild.json",
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

## 📜 Development & Automation Tasks

| Task | Command | Description |
| :--- | :--- | :--- |
| `deno task esbuild` | `deno run -A ./esbuild.ts` | Runs the production esbuild pipeline |
| `deno task watch` | `deno run -A ./watch.ts` | Starts the real-time development watcher |
| `deno task denobuild` | `deno run --unstable-bundle -A ./denobuild.ts` | Runs native Deno.bundle |
| `deno task export` | `deno run -A ./export.ts` | Generates AI context snapshots |
| `deno task sanitize-version` | `deno run -A ./sanitize-version.ts` | Normalizes project version to strict SemVer |
| `deno task tag-version` | `deno run -A ./tag-version.ts` | Orchestrates Git commit and tag push |
| `deno task test` | `deno test -P` | Executes all BDD unit and integration tests |
| `deno task check` | `deno check ...` | Validates TypeScript types across the codebase |
| `deno task lint` | `deno lint` | Lints all packages and scripts |

## 📄 License

MIT © 2026 Vanaware
