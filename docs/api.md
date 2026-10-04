# 📖 BuildIt API and Configuration Reference

Official technical documentation for the `@vanaware/buildit` library utilities. This guide covers the **programmatic TypeScript API**, **CLI architecture**, and **all possible configurations via JSONC/JSON files** for the 6 utilities:

1. [⚡ esbuild Engine (`esbuild.jsonc`)](#-1-esbuild-engine-esbuildjsonc) — [View Topology](./topology-esbuild.md)
2. [👀 Watch Engine (`watch.jsonc`)](#-2-watch-engine-watchjsonc) — [View Topology](./topology-watch.md)
3. [📦 Deno.bundle Engine (`denobuild.jsonc`)](#-3-denobundle-engine-denobuildjsonc) — [View Topology](./topology-denobuild.md)
4. [📝 AI Context Exporter (`export.jsonc`)](#-4-ai-context-exporter-exportjsonc) — [View Topology](./topology-export.md)
5. [🧼 Version Sanitizer (`sanitize-version`)](#-5-version-sanitizer-and-publisher-sanitize-version--tag-version) — [View Topology](./topology-sanitize-version.md)
6. [🏷️ Version Publisher (`tag-version`)](#-5-version-sanitizer-and-publisher-sanitize-version--tag-version) — [View Topology](./topology-tag-version.md)
7. [📂 Smart Configuration Discovery](#-smart-configuration-discovery)
8. [💡 How to Use Schemas in the Editor ($schema)](#-6-how-to-use-schemas-in-the-editor-schema)
9. [🛠️ Version and CLI Utilities](#-7-version-and-cli-utilities)
10. [💻 Programmatic TypeScript API](#-8-programmatic-typescript-api)
11. [📂 Impact of `baseDir` on Path Resolution](./basedir-impact.md)

---

## ⚡ 1. esbuild Engine (`esbuild.jsonc`)

The `esbuild` engine orchestrates ultra-fast production bundling using esbuild and the official `@deno/esbuild-plugin`, including folder cleanup, static asset copying, semantic version injection (`__APP_VERSION__`), variable substitution, and cache manifest generation.

### Root File Structure (`esbuild.jsonc`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `$schema` | `string` | No | Relative path or URL to the JSON Schema for autocomplete and validation. |
| `defineVersionString` | `string` | No | Custom identifier for the application version injection constant (default: `"__APP_VERSION__"`). |
| `versionPaths` | `string[]` | No | Paths where the synchronized `version.ts` file is generated. |
| `forcepackagesversion` | `boolean` | No | If `true`, synchronizes the new version across all workspace packages. |
| `targets` | `Record<string, TargetConfig>` | Yes | Dictionary of batch compilation targets. |

---

### Per-Target Options (`TargetConfig`)

#### 🔄 Pipeline and File Management (Pre/Post Build)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `default` | `boolean` | `true` | If `true`, runs automatically when no specific target is passed via CLI. |
| `srcdir` | `string` | `"."` | Base directory for the target's source files (relative to execution root). |
| `distdir` | `string` | `"."` | Final destination directory where compiled artifacts are written. |
| `clean` | `CleanConfig \| string[]` | `[]` | Pre-build cleanup rules. Use `["*"]` to empty the entire directory. |
| `copyFiles` | `CopyFileConfig[]` | `[]` | List of rules for copying static files to `distdir`. |

#### ⚙️ esbuild Compiler Options

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `entryPoints` | `string[]` | **Required** | Entry files to be compiled (relative to `srcdir`). |
| `platform` | `"browser" \| "node" \| "neutral"` | `"browser"` | Target execution platform for the generated bundle. |
| `format` | `"esm" \| "cjs" \| "iife"` | `"esm"` | Output module format. |
| `bundle` | `boolean` | `true` | Whether to group dependencies and external imports into consolidated files. |
| `minify` | `boolean` | `false` | Whether to apply full minification (code, whitespace, and identifiers). |
| `sourcemap` | `boolean \| "linked" \| "inline" \| "external"` | `"linked"` | Source map generation strategy (`.map`). |
| `jsx` | `"automatic" \| "transform" \| "preserve"` | `"automatic"` | JSX/TSX transformation mode. |
| `jsxImportSource` | `string` | `undefined` | Package for automatic JSX runtime (e.g., `"preact"`, `"react"`). |
| `conditions` | `string[]` | `[]` | Custom export resolution conditions for `package.json`. |
| `define` | `Record<string, string>` | `{}` | Map of global constants substituted during compilation. |
| `defineAssetsString` | `string` | `undefined` | If configured (e.g., `"__GENERATED_ASSETS__"`), scans `distdir` and injects the asset list via esbuild's `define`. |
| `defineVersionString` | `string` | `"__APP_VERSION__"` | Custom version identifier for this target (used in `defines`, `banners`, and `footers`). |
| `drop` | `("console" \| "debugger")[]` | `[]` | Instructions to be eliminated from compiled code (e.g., `["debugger"]`). |
| `external` | `string[]` | `[]` | Modules not to be bundled, kept as external imports at runtime. |
| `metafile` | `boolean` | `false` | Whether to generate a JSON metadata file for bundle analysis. |
| `write` | `boolean` | `true` | Whether to write compiled files to disk. If `false`, keeps them in memory. |
| `treeShaking` | `boolean` | `true` | Enables dead-code elimination. |
| `legalComments` | `"none" \| "inline" \| "eof" \| "linked" \| "external"` | `"eof"` | License comment preservation and positioning. |
| `keepNames` | `boolean` | `true` | Preserves original function and class names in minified builds. |
| `outfile` | `string` | `undefined` | Explicit name or path for the generated output file (relative to `distdir`). |
| `splitting` | `boolean` | `false` | Enables on-demand code splitting (requires `format: "esm"`). |
| `loader` | `Record<string, EsbuildLoader>` | `{}` | Map of extensions to esbuild loaders. |
| `alias` | `Record<string, string>` | `{}` | Module import alias mapping. |
| `inject` | `string[]` | `[]` | Files executed before each entry point (e.g., polyfills). |
| `banner` | `{ js?: string; css?: string }` | `undefined` | Text block inserted at the beginning of generated files. |
| `footer` | `{ js?: string; css?: string }` | `undefined` | Text block inserted at the end of generated files. |
| `target` | `string \| string[]` | `"esnext"` | JavaScript compatibility target environments (e.g., `["chrome58", "firefox57"]`). |
| `charset` | `"ascii" \| "utf8"` | `"utf8"` | Character encoding of the emitted file. |
| `logLevel` | `"verbose" \| "debug" \| "info" \| "warning" \| "error" \| "silent"` | `"info"` | Detailedness level of esbuild messages. |

---

## 👀 2. Watch Engine (`watch.jsonc`)

The `watch` engine was designed for **real-time continuous development**. It decouples the observation routine from the final compilation flow, using `esbuild.context` for instant incremental rebuilds.

### `watch.jsonc` Structure

```jsonc
{
  "$schema": "./packages/utils/schema/watch.json",
  "version": "0.3.7",
  "targets": {
    "ui": {
      "default": true,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "copyFiles": [
        { "basedir": "packages/ui/public" },
        { "basedir": "packages/ui/src", "includes": ["index.html"] }
      ],
      "entryPoints": ["main.tsx"],
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "sourcemap": "inline",
      "jsx": "automatic",
      "jsxImportSource": "preact",
      "write": true,
      "outfile": "app.js"
    }
  }
}
```

- **No Redundant Flags**: Does not require `mode` or `watch: boolean` (every watch target is intrinsically continuous).
- **No Version Pollution**: Watch mode reads the current version without incrementing it.
- **Single Target per Execution**: While multiple targets can be defined, the watch engine allows executing **only 1 target at a time**. If more than one target is passed via CLI, it will reject with a clear error message. If none is specified, only the first target with `default: true` runs.
- **Exclusive Concurrency Lock**: To prevent port conflicts, duplicate builds, or concurrent disk writing, the engine automatically acquires a process lock (`.buildit-watch.lock`). If another watch instance is active for the same project, a new execution is blocked until the previous process terminates.

---

## 📦 3. Deno.bundle Engine (`denobuild.jsonc`)

The `denobuild` engine uses the native `Deno.bundle` API to package applications without external esbuild binary dependencies.

### `denobuild.jsonc` Structure

| Field | Type | Description |
| :--- | :--- | :--- |
| `srcdir` | `string` | Source code root directory. |
| `distdir` | `string` | Destination directory for compiled files. |
| `clean` | `CleanConfig \| string[]` | Pre-build cleanup rules. |
| `copyFiles` | `CopyFileConfig[]` | Rules for copying static files. |
| `entryPoints` | `string[]` | Input TypeScript/JavaScript files. |
| `format` | `"esm" \| "cjs" \| "iife"` | Bundle format. |
| `platform` | `"browser" \| "deno"` | Target platform. |
| `minify` | `boolean` | Whether to minify the generated bundle. |
| `sourcemap` | `"linked" \| "inline" \| "external"` | Emitted sourcemap format. |
| `codeSplitting` | `boolean` | Modular chunk splitting. |
| `inlineImports` | `boolean` | Whether to include external import code in the generated file. |
| `packages` | `"bundle" \| "external"` | Whether to bundle or externalize dependencies. |
| `define` | `Record<string, string>` | Global constant injection. |
| `defineAssetsString` | `string` | If configured, injects the list of assets present in `distdir`. |
| `defineVersionString` | `string` | Custom version identifier for this target (default: `"__APP_VERSION__"`). |
| `outfile` | `string` | Explicit name of the generated file. |
| `targets` | `Record<string, DenoBundleTargetConfig>` | Compilation targets dictionary. |

---

## 📝 4. AI Context Exporter (`export.jsonc`)

`export` generates consolidated snapshots in Markdown format with a semantic header and active anti-loop protections to feed LLMs and code assistants.

### `export.jsonc` Structure

```jsonc
{
  "$schema": "./packages/utils/schema/export.json",
  "version": "0.3.7",
  "modos": {
    "ui": {
      "arquivoSaida": "snapshots/ui.md",
      "includes": [
        "packages/ui/{src,public,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,manifest,json,jsonc,md}",
        "packages/ui/{build.ts,deno.json,deno.jsonc,readme.md}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "incluiVersao": true,
      "instrucaoCustomizada": "Frontend context with Preact + BeerCSS.",
      "default": true
    }
  }
}
```

- **Glob Patterns and Brace Expansion**: The exporter uses `expandGlob` under the hood, allowing concise declaration of paths and extensions (e.g., `{src,docs}/**/*.{ts,tsx,md}`).
- **O(1) Streaming Write**: Progressive recording directly to disk via `Deno.open` and `WritableStream`, ensuring maximum memory efficiency even in large monorepos.
- **Read-Only Mode**: `exportEngine` reads the current project version to enrich headers without ever incrementing it. It supports automatic substitution of the version constant (`defineVersionString`, default: `__APP_VERSION__`) in `instrucaoCustomizada` and `cabecalho`.

---

## 🧼 5. Version Sanitizer and Publisher (`sanitize-version` & `tag-version`)

BuildIt includes specialized utilities to keep your `deno.jsonc` compliant with SemVer and automate git tag creation.

### 🧼 `sanitize-version`
Normalizes the `"version"` field to strict `MAJOR.MINOR.PATCH` format.
- **Behavior**: Removes suffixes like `#hash`, `-alpha`, `+build`.
- **Injection**: If the `"version"` field is missing, it inserts `"version": "0.0.0"` automatically.

### 🏷️ `tag-version`
Automates the local and remote release flow:
1. (Optional) Sanitizes the `deno.jsonc` file on disk.
2. Executes `git add -A` and `git commit -m "Version vX.Y"`.
3. Executes `git push`.
4. Removes old local and remote tags with the same `vMAJOR.MINOR` prefix.
5. Creates a new annotated tag and executes `git push --force origin vX.Y`.

---

## 📂 Smart Configuration Discovery

BuildIt uses a priority search strategy to locate your configuration files (`.jsonc`/`.json`). This allows you to organize your scripts in subfolders without manually passing the path via CLI.

**Priority Order:**
1. **Explicit Path**: Provided via `-c` or `--app-config` flag.
2. **Script Directory**: If you run `deno run scripts/export.ts`, the system first looks for `scripts/export.jsonc`.
3. **scripts/ Subfolder**: Looks in `scripts/` inside the provided `baseDir`.
4. **Project Root**: Looks in the provided `baseDir` directory (default: `.`).

---

## 💡 6. How to Use Schemas in the Editor ($schema)

Each utility has an official JSON Schema in the `packages/utils/schema/` directory:

1. `esbuild.json` -> For `esbuild.jsonc` or `esbuild.json`
2. `watch.json` -> For `watch.jsonc` or `watch.json`
3. `denobuild.json` -> For `denobuild.jsonc` or `denobuild.json`
4. `export.json` -> For `export.jsonc` or `export.json`

### How to Configure in the File

Just include the `$schema` key pointing to the corresponding file at the top of your JSON/JSONC:

```jsonc
{
  "$schema": "./packages/utils/schema/esbuild.json",
  "targets": {
    // Automatic autocomplete with Ctrl+Space (VSCode / Cursor / Zed / Neovim)
    "ui": {
      "entryPoints": ["main.tsx"]
    }
  }
}
```

### Benefits:
- **Full Autocomplete**: Suggestions for all compiler options, sourcemap types, loaders, and formats.
- **Instant Validation**: Real-time warnings if a property is mistyped or has an invalid type.
- **Inline Documentation (Hover)**: Hover over any property to see its official description.

---

## 🛠️ 7. Version and CLI Utilities

### Common Flags for All CLIs

All command-line utilities (`esbuild`, `watch`, `denobuild`, `export`) follow the same unified argument convention:

| Short Flag | Long Flag | Default | Description |
| :--- | :--- | :--- | :--- |
| `-c` | `--app-config <file>` | *Auto Search* | Explicit path to the configuration file. |
| `-b` | `--base-dir <dir>` | `./` | Base directory for path resolution and joins. |
| `-d` | `--deno-config <file>` | *Auto Search* | Path to the root `deno.jsonc` containing the version. |
| `-n` | `--noversion` | `false` | Disables automatic version increment. |

### Deterministic Execution Order

The **Engine** is the single source of truth for the execution order of targets:
- The order declared in the `.jsonc` file is strictly preserved.
- The CLI passes user-provided arguments; the engine filters selected targets while maintaining the correct order.

---

## 💻 8. Programmatic TypeScript API

The `@vanaware/buildit` library can be imported and executed directly in TypeScript code:

```typescript
import {
  denoBuild,
  esBuild,
  exportEngine,
  watchEngine,
} from "jsr:@vanaware/buildit";

// esbuild compilation
await esBuild({
  config: {
    ui: {
      entryPoints: ["packages/ui/src/main.tsx"],
      distdir: "dist",
      format: "esm",
    },
  },
  noversion: true,
});

// Continuous development with Watch
const handles = await watchEngine({
  config: {
    ui: {
      entryPoints: ["packages/ui/src/main.tsx"],
      distdir: "dist",
      sourcemap: "inline",
    },
  },
});

// To stop the watch programmatically:
// for (const h of handles) await h.close();
```
