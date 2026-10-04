> **AI INSTRUCTION:** 
> The text below contains the DOCUMENTATION and architectural guidelines of the project.
> Each file starts with a title indicating its exact relative path (e.g., `## File: src/main.ts`).
> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.

---

# Exported Context from Project BuildIt - Mode: DOCS

Automatically generated at: 2026-10-04T19:05:09.030Z

---

## File: `.tool-versions`

```tool-versions
deno 2.9.7

```

---

## File: `docs/api.md`

````md
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

````

---

## File: `docs/basedir-impact.md`

```md
# Technical Guide: The Impact of `baseDir` in BuildIt

This document explains in detail how the `baseDir` option (configurable via CLI `-b` or `--base-dir`) influences reading, writing, and path resolution behavior across all BuildIt ecosystem utilities.

---

## 1. What is `baseDir`?

The `baseDir` is the **Execution Root Directory** (or Workspace Root). It defines the anchor point for all relative paths declared in configuration files (`.jsonc`).

- **Default:** If not provided, BuildIt assumes `.` (the current directory where the command was triggered).
- **Scope:** The impact is **global** for each utility, affecting everything from configuration file location to output file generation.

---

## 2. Impact per Utility

### ⚡ esbuild & 📦 denobuild (Production Build)

In this context, `baseDir` acts as the prefix for the monorepo or project structure.

1.  **Core Folder Resolution**:
    - `srcdir`, `distdir`, and `publicdir` are resolved using `join(baseDir, path)`. If you are at the monorepo root and run `--base-dir packages/ui`, BuildIt will look for the source in `packages/ui/src`.
2.  **EntryPoints**:
    - Resolved relative to the `srcdir` already prefixed by `baseDir`.
3.  **File Copying (`copyFiles`)**:
    - Acts as the `generalBaseDir`. Each entry in the `copyFiles` array that has its own `basedir` will be resolved relative to the global execution `baseDir`.
    - Example: If `baseDir` is `packages/ui` and the item has `basedir: "public"`, the actual scan occurs in `packages/ui/public`.
4.  **Cleanup (`clean`)**:
    - The `distdir` (cleanup target) is prefixed by `baseDir`. Cleanup inclusion/exclusion rules operate strictly within this resulting path.

### 👀 watch (Development Monitoring)

`watch` inherits all `esbuild` behavior but adds a critical security layer:

1.  **Lock File (`.buildit-watch.lock`)**:
    - The PID lock file is created at the root of `baseDir`.
    - **Why does this matter?** This allows you to run multiple `watch` processes on the same server, as long as they point to different `baseDir`, avoiding collisions between processes trying to monitor the same project.

### 📝 export (AI Snapshot)

`export` is the utility most sensitive to `baseDir`, as it determines what "gets in the picture".

1.  **Glob Root**:
    - `baseDir` is passed as the `root` parameter to the `expandGlob` function. Patterns like `src/**/*.ts` will only find files within `baseDir`.
2.  **Paths in Markdown**:
    - The utility calculates each file's relative path using `relative(baseDir, file.path)`. This ensures the generated snapshot is clean and doesn't expose your server/machine's absolute folder structure.
3.  **Snapshot Destination**:
    - The generated file (e.g., `exports/ui.md`) is created inside `baseDir`. If you run with `--base-dir packages/utils`, the result will go to `packages/utils/exports/ui.md`.

### 🧼 sanitize-version & 🏷️ tag-version (Versioning)

1.  **`deno.jsonc` Location**:
    - If the file path is not absolute, the utility tries to locate it within `baseDir`.

---

## 3. Path Behavior Summary

| Path Type | Behavior with `baseDir` |
| :--- | :--- |
| **Absolute Path** (`/etc/config`) | **Ignores** `baseDir`. System uses the literal path. |
| **Relative Path** (`src/main.ts`) | **Prefixes** with `baseDir` → `join(baseDir, "src/main.ts")`. |
| **Glob Pattern** (`**/*.ts`) | **Restricts** search to `baseDir` scope. |

---

## 4. Implementation Status

The `baseDir` implementation is **Systemic and Global**.

It has been refactored to propagate from the CLI layer (`packages/utils/src/*/cli.ts`) to the engine (`engine.ts`) and finally to low-level functions in `packages/utils/src/tools/paths.ts`.

### Verification Points (Integrity Guarantee):
- [x] **Consistency**: All utilities use the same `resolveWithBase` function for normalization.
- [x] **Security**: Write and delete functions (`cleanTarget`, `copyStaticFiles`) validate that the final path does not "escape" the intended directory via path traversal locks.
- [x] **Transparency**: Console logs display resolved paths so the user knows exactly where BuildIt is operating.

```

---

## File: `docs/publish-jsr-rules.md`

````md
# 🚀 Rules for Publishing to JSR (`@vanaware/buildit`)

This document defines the quality and documentation standards required for all packages in the `@vanaware/buildit` suite before publication to the **JSR (Deno)** registry.

---

## 1. Zero Node.js Dependencies

All code in `packages/utils` MUST be pure Deno.
- **Specifiers:** Use only `jsr:` and `npm:` (via Deno resolution).
- **APIs:** Use `Deno.*` and `@std/*`. Avoid `node:*` or standard Node.js libraries.
- **Portability:** The library must be importable in any environment that supports JSR/Deno 2.x.

## 2. Complete JSDoc (Mandatory)

Every exported function, interface, type, or constant must have a JSDoc block in English.

### Required Fields:
- `@description`: Detailed explanation of the item's purpose.
- `@param`: Description of each parameter and its type.
- `@returns`: Explanation of the return value.
- `@example`: A runnable and clear usage example.

**Example:**
```typescript
/**
 * @description Normalizes a semver string.
 * @param raw - The original version string.
 * @returns The sanitized MAJOR.MINOR.PATCH string.
 */
export function sanitizeVersion(raw: string): string { ... }
```

## 3. Documentation Linter (`deno doc --lint`)

Before every push/release, you must run the documentation linter:
```bash
deno task lint:doc
```
- No warnings or errors are allowed.
- All public items must be documented.

## 4. Descriptive README per Package

Each sub-package (e.g., `packages/utils`) must have its own `README.md` (English).
- **Core Value:** What problem does this specific package solve?
- **Quick Start:** One or two examples of common usage.
- **JSR Badges:** Links to the module on JSR.

## 5. Automation via GitHub Actions

Publication is managed exclusively by the `.github/workflows/jsr-publish.yml` workflow.
- **Prerequisite:** The version must be a valid SemVer (e.g., `0.3.14`).
- **Sanitization:** The `sanitize-version.ts` script is executed before publication to ensure no git hashes (e.g., `#mu...`) remain in the version.

---

## ✅ Checklist for Pull Requests:
- [ ] `deno task test` passes.
- [ ] `deno task lint` passes.
- [ ] `deno task lint:doc` returns zero warnings.
- [ ] New exports have runnable `@example` in JSDoc.
- [ ] New configuration fields are added to the corresponding JSON Schema in `schema/`.

````

---

## File: `docs/topology-denobuild.md`

````md
# Execution Topology: `denobuild` (Deno.bundle Orchestrator)

This document describes the complete execution topology of the **`denobuild`** utility, detailing the call tree, parameters passed between each layer, side effects, and extension points.

---

## 1. Call Graph

```
[CLI / Terminal]
       │
       ▼
denoBuildCli() (packages/utils/src/denobuild/cli.ts)
       │
       ├──► findDenoConfig()
       ├──► carregarConfigDenoBuild(configPath, baseDir)
       │       │
       │       └──► loadConfig<DenoBundleConfigFile>("denobuild", configPath, baseDir)
       │               └──► readJsoncFile(fullPath) / parseJsonc
       ├──► parseArgs(args, configs)
       │
       ▼
denoBuild(options: DenoBuildOptions) (packages/utils/src/denobuild/engine.ts)
       │
       ├──► updateProjectVersion({ denoJsonPath, baseDir, noversion, versionPaths, forcepackagesversion })
       │       │
       │       ├──► readProjectVersion(denoJsonPath, baseDir)
       │       └──► syncVersion(...) / formatVersion(...)
       │
       └──► [Loop for each Selected Target]
               │
               ▼
       processBundleTarget(targetName, config, appVersion, listAssetsFn)
               │
               ├──► validateTargetConfig(targetName, config)
               │
               ├──► cleanTarget(config.distdir, config.clean) [if configured]
               │       └──► [Iterate config.clean.includes/excludes]
               │
               ├──► copyStaticFiles(config, appVersion, baseDir, distDir)
               │       └──► [Loop config.copyFiles: { includes, excludes, basedir }]
               │
               ├──► listAssetsForCache(config.distdir) [if defineAssetsString configured]
               │
               ├──► buildBundleOptions(config) (packages/utils/src/denobuild/bundle.ts)
               │       └──► resolveEntryPoints(config.srcdir, config.entryPoints)
               │
               ├──► Deno.bundle(bundleOptions) [Native Deno API]
               │
               └──► [Loop for each file in result.outputFiles]
                       │
                       ├──► ensureDirForFile(outputFile.path)
                       ├──► applyDefines(content, defines) (packages/utils/src/denobuild/bundle.ts)
                       └──► Deno.writeTextFile(outputFile.path, content)
```

---

## 2. Step-by-Step Execution Mapping

### Step 1: CLI Initialization
* **Function**: `denoBuildCli()`
* **File**: `packages/utils/src/denobuild/cli.ts`
* **Input**: CLI arguments via Cliffy (`-c/--app-config`, `-b/--base-dir`, `-d/--deno-config`, `-n/--no-version`, `-p/--packages-version`, `[targets...:string]`).
* **Actions**:
  1. Locates Deno configuration via `findDenoConfig()`.
  2. Executes `carregarConfigDenoBuild(configPath, baseDir)` to read `denobuild.jsonc`.
  3. Filters arguments with `parseArgs(args, configs)`.
  4. Calls `denoBuild(options)`.

### Step 2: Main Engine Orchestration
* **Function**: `denoBuild(options: DenoBuildOptions)`
* **File**: `packages/utils/src/denobuild/engine.ts`
* **Input Parameters**:
  ```typescript
  options: {
    config: DenoBundleGlobalConfig;
    targets?: string[];
    baseDir?: string;
    denoJsoncPath?: string;
    noversion?: boolean;
    versionPaths?: string[];
    forcepackagesversion?: boolean;
  }
  ```
* **Actions**:
  1. `updateProjectVersion(...)`: Updates or maintains semantic version and synchronizes packages.
  2. Filters the list of targets to be compiled, preserving the order declared in the configuration.
  3. Iterates over each target executing `processBundleTarget(...)`.
  4. Aggregates and returns the list of `DenoBuildResult[]`.

### Step 3: Target Processing and Post-processing
* **Function**: `processBundleTarget(targetName, config, appVersion, listAssetsFn)`
* **File**: `packages/utils/src/denobuild/engine.ts`
* **Input Parameters**:
  - `targetName: string`: Target name (e.g., `"ui"`, `"sw"`)
  - `config: DenoBundleTargetConfig`: Specific target configuration
  - `appVersion: string`: Injected semantic version
  - `listAssetsFn?: (distDir: string) => Promise<string[]>`: Utility to collect cache assets
* **Actions and Sub-functions**:
  1. `validateTargetConfig(targetName, config)`: Structural validation.
  2. `cleanTarget(distdir, clean)`: Cleanup of output directories based on `includes`/`excludes` before the build.
  3. `copyStaticFiles(config, appVersion, baseDir, distDir)`: Recursive copy via `copyFiles` with glob support and version injection in `manifest.json`.
  4. Memory preparation of `defines` constants:
     - `__APP_VERSION__ = JSON.stringify("v" + appVersion)`
     - `defineAssetsString = JSON.stringify(assets)` (if configured). This injection allows the generated Service Worker to have dynamic knowledge of all assets in `distdir` (including static files copied in the previous step) for offline caching strategies.
  5. `buildBundleOptions(config)` (`packages/utils/src/denobuild/bundle.ts`):
     - Builds the options object expected by the unstable `Deno.bundle` API.
     - Maps entry points, platform target (`browser`/`deno`), format (`esm`/`cjs`/`iife`), sourcemap, and minify.
  6. `Deno.bundle(bundleOptions)`:
     - Invokes the native Deno compiler to generate bundled files in memory (`result.outputFiles`).
     - In case of errors, displays traceback with line/column and throws an exception.
  7. Disk Recording and Define Injection:
     - Iterates over each `outputFile` generated by the bundle.
     - `ensureDirForFile(outputFile.path)`: Creates parent folders on disk.
     - `applyDefines(content, defines)` (`packages/utils/src/denobuild/bundle.ts`): Performs global regex substitution of literal keys (e.g., `__APP_VERSION__`) with JSON values.
     - `Deno.writeTextFile(outputFile.path, content)`: Writes the final file to disk.

---

## 3. Parameters and Returns Summary Table

| Function | Caller | Input / Parameters | Return | Side Effect |
|---|---|---|---|---|
| `denoBuildCli()` | Deno CLI Runtime | `Deno.args` | `Command` instance | CLI processing and console output |
| `carregarConfigDenoBuild()` | `denoBuildCli` | `configPath?: string`, `baseDir?: string` | `Promise<DenoBundleConfigResult>` | File system reading (`denobuild.jsonc`) |
| `denoBuild()` | `denoBuildCli` / API | `options: DenoBuildOptions` | `Promise<DenoBuildResult[]>` | Version updates and bundle compilation |
| `processBundleTarget()` | `denoBuild` | `targetName`, `config`, `appVersion`, `listAssetsFn?` | `Promise<DenoBuildResult>` | Cleanup, static copy, bundle, disk writing |
| `buildBundleOptions()` | `processBundleTarget` | `config: DenoBundleTargetConfig` | `Deno.BundleOptions` | Path resolution and property mapping |
| `applyDefines()` | `processBundleTarget` | `content: string`, `defines: Record<string, string>` | `string` | Memory substitution of literal identifiers |

---

## 4. Opportunities for Improvement and Refactoring

1. **Defines Substitution via AST vs Regex**: `applyDefines` operates via textual regular expression. To avoid false positives within literal strings or code comments, contextual or tokenized substitution can be evaluated.
2. **Unstable API Dependency**: `Deno.bundle` is an unstable Deno feature. The engine's modular structure isolates this dependency in `packages/utils/src/denobuild/bundle.ts`, facilitating future migration or compatibility with Deno 2.x versions.
3. **Target Ordering Utility Reuse**: Standardize `resolverOrdemTargets` (used in `esbuild`) also in `denoBuild` to maintain exactly the same deterministic target behavior.

````

---

## File: `docs/topology-esbuild.md`

````md
# Execution Topology: `esbuild` (Build Orchestrator)

This document describes the complete execution topology of the **`esbuild`** utility, detailing the call tree, parameters passed between each layer, side effects, and extension points.

---

## 1. Call Graph

```
[CLI / Terminal]
       │
       ▼
esBuildCli() (packages/utils/src/esbuild/cli.ts)
       │
       ├──► findDenoConfig()
       ├──► carregarConfigEsbuild(configPath, baseDir)
       │       │
       │       └──► loadConfig<EsbuildConfigFile>("esbuild", configPath, baseDir)
       │               └──► readJsoncFile(fullPath) / parseJsonc
       ├──► parseArgs(args, configs)
       │
       ▼
esBuild(options: EsbuildOptions) (packages/utils/src/esbuild/engine.ts)
       │
       ├──► updateProjectVersion({ denoJsonPath, baseDir, noversion, versionPaths, forcepackagesversion })
       │       │
       │       ├──► readProjectVersion(denoJsonPath, baseDir)
       │       │       └──► parseVersion(rawVersion)
       │       ├──► incrementProjectVersion({ baseDir, denoJsonPath, currentVersion, buildHash }) [If noversion=false]
       │       │       ├──► readProjectVersion(...)
       │       │       ├──► parseVersion(...) / formatVersion(...)
       │       │       └──► replaceVersionInContent(...) -> Deno.writeTextFile(...)
       │       └──► syncWorkspaces({ baseDir, denoJsonPath, currentVersion }) [If forcepackagesversion=true]
       │               └──► [Iterate workspaces] -> syncWorkspaceDir(...)
       │
       ├──► resolverOrdemTargets(configs, targets)
       │
       └──► [Loop for each Selected Target]
               │
               ▼
       processTarget(targetName, targetConfig, appVersion, esbuildBuildFn, listAssetsFn)
               │
               ├──► validateTargetConfig(targetName, config)
               │
               ├──► cleanTarget(config.distdir, config.clean) [if configured]
               │       └──► [Iterate config.clean.includes/excludes]
               │               └──► Deno.remove(...) / emptyDir(...)
               │
               ├──► copyStaticFiles(config, appVersion, baseDir, distDir)
               │       └──► [Loop config.copyFiles: { includes, excludes, basedir }]
               │               ├──► expandGlob(includes, { root: basedir, exclude: excludes })
               │               ├──► replaceVersionInFile(manifest.json, appVersion)
               │               └──► Log "index.html copied" [if index.html detected]
               │
               ├──► buildEsbuildOptions(targetName, config, appVersion, listAssetsFn)
               │       ├──► listAssetsForCache(config.distdir) [if defineAssetsString configured]
               │       ├──► resolveEntryPoints(config.srcdir, config.entryPoints)
               │       ├──► resolveOutputPaths(config)
               │       └──► [Maps advanced options: jsx, minify, mangle, analyze, etc.]
               │
               ├──► esbuildBuildFn(esbuildOptions) -> buildWithDenoPlugin(options, denoJsoncPath)
               │       ├──► denoPlugin({ configPath: denoJsoncPath })
               │       └──► esbuild.build(options)
               │
               ├──► Deno.writeTextFile(metafilePath, ...) [if metafile: true or analyze configured]
               │
               └──► esbuild.analyzeMetafile(result.metafile) [if analyze: true or "verbose"]
```

---

## 2. Step-by-Step Execution Mapping

### Step 1: CLI Initialization
* **Function**: `esBuildCli()`
* **File**: `packages/utils/src/esbuild/cli.ts`
* **Input**: CLI arguments via Cliffy (`-c/--app-config`, `-b/--base-dir`, `-d/--deno-config`, `-n/--no-version`, `-p/--packages-version`, `[targets...:string]`).
* **Actions**:
  1. `findDenoConfig()`: Looks for `deno.jsonc` or `deno.json` in root/parent directories.
  2. `carregarConfigEsbuild(configPath, baseDir)`: Loads and validates the configuration file (or returns `DEFAULT_CONFIG`).
  3. `parseArgs(args, configs)`: Filters targets requested by the user against those declared in the config.
  4. Calls `esBuild(options)`.

### Step 2: Main Engine Orchestration
* **Function**: `esBuild(options: EsbuildOptions)`
* **File**: `packages/utils/src/esbuild/engine.ts`
* **Input Parameters**:
  ```typescript
  options: {
    config: GlobalTargetConfig;
    targets?: string[];
    baseDir?: string;
    denoJsoncPath?: string;
    noversion?: boolean;
    versionPaths?: string[];
    forcepackagesversion?: boolean;
  }
  ```
* **Actions**:
  1. `updateProjectVersion(...)`:
     - Reads the version from `deno.jsonc`.
     - Invokes `incrementProjectVersion(...)` to bump the patch version (if `noversion === false`).
     - Invokes `syncWorkspaces(...)` to propagate the version across workspace packages (if `forcepackagesversion === true`).
     - Synchronizes the new version in additional files (`versionPaths`).
     - Returns `finalVersion` (semantic string, e.g., `"0.3.14"`).
  2. `resolverOrdemTargets(configs, targets)`:
     - Strictly ensures target execution order respects the configuration file declaration, ignoring non-existent targets and selecting those with `default !== false` if none were specified via CLI.
  3. Iterates over each resolved target and invokes `processTarget(...)`.

### Step 3: Individual Target Processing
* **Function**: `processTarget(targetName, config, appVersion, esbuildBuildFn, listAssetsFn)`
* **File**: `packages/utils/src/esbuild/engine.ts`
* **Input Parameters**:
  - `targetName: string` (e.g., `"ui"`, `"sw"`)
  - `config: TargetConfig` (specific target options)
  - `appVersion: string` (e.g., `"0.3.14"`)
  - `esbuildBuildFn: (options) => Promise<any>` (closure with `buildWithDenoPlugin`)
  - `listAssetsFn: (distDir) => Promise<string[]>` (`listAssetsForCache` utility)
* **Actions and Sub-functions**:
  1. `validateTargetConfig(targetName, config)` (`packages/utils/src/tools/validate.ts`):
     - Validates required fields (`entryPoints`, `outfile`/`outdir` rules).
     - Throws immediate error (fail-fast) if the configuration is invalid.
  2. `cleanTarget(config.distdir, config.clean)` (`packages/utils/src/tools/paths.ts`):
     - Empties or removes paths specified in `config.clean.includes` and `config.clean.excludes` within `distdir`.
  3. `copyStaticFiles(config, appVersion, baseDir, distDir)` (`packages/utils/src/tools/paths.ts`):
     - Executes recursive file copying based on the `config.copyFiles` array.
     - Uses `expandGlob` with support for `includes`, `excludes`, and custom `basedir`.
     - If the file is `manifest.json`, injects the application version.
     - Detects `index.html` for console logging.
  4. `buildEsbuildOptions(targetName, config, appVersion, listAssetsFn)`:
     - Assembles the `define` dictionary with `__APP_VERSION__`.
     - If `config.defineAssetsString` is set, executes `listAssetsFn(distdir)` and injects the corresponding constant. This constant contains a JSON array with all file paths in the output directory (including static files copied in the previous step), ideal for automating the pre-cache list in Service Workers.
     - `resolveEntryPoints(srcdir, entryPoints)`: Ensures safe path resolution and existence of entry files.
     - `resolveOutputPaths(config)`: Resolves `outfile` / `outdir` relative to `distdir`.
     - Maps advanced options (`globalName`, `tsconfig`, `analyze`, `mangleProps`, `jsxFactory`, etc.).
     - Formats `banner` and `footer` with version substitution.
  5. `buildWithDenoPlugin(esbuildOptions, denoJsoncPath)`:
     - Attaches the `@deno/esbuild-plugin` instance.
     - Calls native `esbuild.build(options)`.
  6. If `config.metafile === true` or `config.analyze` is enabled, saves the `${targetName}-metafile.json` file to disk.
  7. If `config.analyze` is enabled, generates and prints the `analyzeMetafile` report to the console.

---

## 3. Parameters and Returns Summary Table

| Function | Caller | Input / Parameters | Return | Side Effect |
|---|---|---|---|---|
| `esBuildCli()` | Deno CLI Runtime | `Deno.args` | `Command` instance | CLI reading and stdout output |
| `carregarConfigEsbuild()` | `esBuildCli` | `configPath?: string`, `baseDir?: string` | `Promise<EsbuildConfigResult>` | File system reading (`esbuild.jsonc`) |
| `parseArgs()` | `esBuildCli` | `args: string[]`, `configs: GlobalTargetConfig` | `ParsedArgs` (valid targets) | Pure (no I/O) |
| `esBuild()` | `esBuildCli` / API | `options: EsbuildOptions` | `Promise<EsbuildResult[]>` | Updates versions, compiles targets |
| `updateProjectVersion()` | `esBuild` | `VersionUpdateOptions` | `Promise<string>` | Writes new versions to `deno.jsonc` and packages |
| `resolverOrdemTargets()` | `esBuild` | `configs: Record<string, TargetConfig>`, `requested?: string[]` | `string[]` | Pure (ordering and filtering) |
| `processTarget()` | `esBuild` | `targetName`, `config`, `version`, `buildFn`, `listAssetsFn` | `Promise<void>` | Cleans folders, copies static, compiles bundle |
| `validateTargetConfig()`| `processTarget` | `targetName: string`, `config: TargetConfig` | `void` (throws if invalid) | Strict validation (fail-fast) |
| `buildEsbuildOptions()` | `processTarget` | `targetName`, `config`, `appVersion`, `listAssetsFn` | `Promise<esbuild.BuildOptions>` | Optional reading of distdir for SW |
| `buildWithDenoPlugin()` | `processTarget` | `options: any`, `denoJsoncPath: string` | `Promise<esbuild.BuildResult>` | Esbuild compilation execution |

---

## 4. Opportunities for Improvement and Refactoring

1. **SW Build Separation**: Since the Service Worker needs the asset list generated by the `ui` target, target ordering in the configuration is critical (`ui` must always run before `sw`).
2. **Unified Plugin Typing**: The `plugins` array in `BuildOptions` currently accepts `any[]` to bypass type variations between `@deno/esbuild-plugin` and esbuild's typeset.
3. **Independent Target Parallelization**: Targets that do not share asset dependencies could be executed in parallel using `Promise.all` if there is no disk writing conflict in `distdir`.

````

---

## File: `docs/topology-export.md`

`````md
# Execution Topology: `export` (Context Exporter)

This document describes the complete execution topology of the **`export`** utility, detailing the call tree, parameters passed between each layer, side effects, and extension points.

---

## 1. Call Graph

```
[CLI / Terminal]
       │
       ▼
exportCli() (packages/utils/src/export/cli.ts)
       │
       ├──► findDenoConfig()
       ├──► carregarConfigExport(configPath, baseDir) (packages/utils/src/export/config.ts)
       │       │
       │       └──► loadConfig<ExportConfigFile>("export", configPath, baseDir)
       │               └──► readJsoncFile(fullPath) / parseJsonc
       │
       ▼
exportEngine(options: ExportOptions) (packages/utils/src/export/engine.ts)
       │
       ├──► readProjectVersion(denoJsoncPath, baseDir)
       ├──► resolverOrdemTargets(configs, options.modos)
       │
       └──► [Loop for each Selected Mode]
               │
               ▼
       exportarModo(modo, config, options)
               │
               ├──► coletarArquivosParaExportacao(config, baseDir)
               │       │
               │       └──► expandGlob(pattern, { root, exclude })
               │               ├──► normalizarCaminho(relative_path)
               │               └──► correspondeGlobs(relative_path, config.excludes)
               │
               ├──► ensureDirForFile(outputPath)
               │
               ├──► Deno.open(outputPath, { write, create, truncate }) [Streaming O(1)]
               │       │
               │       ├──► writer.write(encoder.encode(gerarCabecalho(config, modo, appVersion)))
               │       │
               │       └──► [Loop for each collected file]
               │               │
               │               ├──► Deno.readTextFile(fullPath)
               │               ├──► formatarArquivoMarkdown(relative_path, fileContent)
               │               │       ├──► mapearExtensao(relative_path)
               │               │       └──► calcularCraseWrapper(fileContent)
               │               └──► writer.write(encoder.encode(markdownBlock))
               │
               └──► writer.close()
```

---

## 2. Step-by-Step Execution Mapping

### Step 1: CLI Initialization
* **Function**: `exportCli()`
* **File**: `packages/utils/src/export/cli.ts`
* **Input**: CLI arguments via Cliffy (`-c/--app-config`, `-b/--base-dir`, `-d/--deno-config`, `[modos...:string]`).
* **Actions**:
  1. Identifies the configuration file and base directory.
  2. Executes `carregarConfigExport(configPath, baseDir)` to read `export.jsonc` or load the default fallback (`ui`, `docs`, `server`, `utils`).
  3. Collects modes passed via positional arguments.
  4. Calls `exportEngine(options)`.

### Step 2: Main Engine Orchestration
* **Function**: `exportEngine(options: ExportOptions)`
* **File**: `packages/utils/src/export/engine.ts`
* **Input Parameters**:
  ```typescript
  options: {
    config: Record<string, ExportConfig>;
    modos?: string[];
    baseDir?: string;
    versaoApp?: string;
    silencioso?: boolean;
    denoJsoncPath?: string;
  }
  ```
* **Actions**:
  1. Determines the application version via `readProjectVersion(denoJsoncPath, baseDir)`.
  2. Executes `resolverOrdemTargets(configs, options.modos)` to strictly filter and order modes. If none were passed explicitly, filters those with `default !== false`.
  3. Sequentially iterates over each mode executing `exportarModo(...)`.
  4. Returns the list of `ExportResult[]` with file count and total bytes written.

### Step 3: Mode Processing with `expandGlob` and Write Stream
* **Function**: `exportarModo(modo, config, options)`
* **File**: `packages/utils/src/export/engine.ts`
* **Input Parameters**:
  - `modo: string`: Mode name (e.g., `"ui"`, `"docs"`)
  - `config: ExportConfig`: Detailed mode configuration containing `includes: string[]` and optionally `excludes?: string[]`
  - `options?: { versaoApp?, baseDir?, silencioso?, denoJsoncPath? }`
* **Actions and Sub-functions**:
  1. `coletarArquivosParaExportacao(config, baseDir)`:
     - Iterates over each glob pattern in `config.includes` calling `expandGlob(pattern, { root: baseDir, exclude: config.excludes, includeDirs: false })`.
     - Applies anti-loop protection (`exports/`, `snapshots/`) and deduplicates in a `Set<string>`.
     - Returns an alphabetically sorted array for deterministic snapshots.
  2. Opening the Write Stream:
     - `ensureDirForFile(outputPath)`: Creates parent folders on disk.
     - `Deno.open(outputPath, { write: true, create: true, truncate: true })`: Initializes the file for streaming.
     - `writer.write(encoder.encode(gerarCabecalho(config, modo, appVersion)))`: Writes the header generated by `gerarCabecalho(...)`.
  3. Individual File Processing:
     - For each collected file, reads via `Deno.readTextFile(fullPath)`.
     - `formatarArquivoMarkdown(relative_path, fileContent)`:
       - `mapearExtensao(ext)`: Maps special extensions (`.jsonc` -> `json`, `.sh` -> `bash`, `.env*` -> `properties`, `.manifest` -> `json`).
       - `calcularCraseWrapper(content)`: Dynamically calculates the number of backticks (``` or more) to ensure the code block is valid.
     - `writer.write(encoder.encode(markdownBlock))`: Sends the Markdown block directly to the disk stream.
  4. Finalization:
     - `writer.close()`: Ensures a clean file closure.

---

## 3. Parameters and Returns Summary Table

| Function | Caller | Input / Parameters | Return | Side Effect |
|---|---|---|---|---|
| `exportCli()` | Deno CLI Runtime | `Deno.args` | `Command` instance | CLI processing and console output |
| `carregarConfigExport()` | `exportCli` | `configPath?: string`, `baseDir?: string` | `Promise<ExportConfigResult>` | File system reading (`export.jsonc`) |
| `exportEngine()` | `exportCli` / API | `options: ExportOptions` | `Promise<ExportResult[]>` | Export orchestration |
| `exportarModo()` | `exportEngine` | `modo: string`, `config: ExportConfig`, `options?` | `Promise<ExportResult>` | Optimized scanning and disk streaming |
| `coletarArquivosParaExportacao()` | `exportarModo` | `config: ExportConfig`, `baseDir: string` | `Promise<string[]>` | Scanning with `expandGlob` and alphabetical sorting |
| `correspondeGlobs()` | `formatter` / `engine` | `path: string`, `patterns: string[]` | `boolean` | Regex evaluation generated via `globToRegExp` |
| `gerarCabecalho()` | `exportarModo` | `config: ExportConfig`, `modo: string`, `appVersion: string`, `defineVersionString?: string` | `string` | Markdown string formatting in memory |
| `formatarArquivoMarkdown()` | `exportarModo` | `path: string`, `content: string` | `string` | Formatting with code fence and syntax highlighting |
| `calcularCraseWrapper()` | `formatarArquivoMarkdown` | `content: string` | `string` (e.g., ```` ``` ````) | Dynamic Markdown backtick escape |
| `mapearExtensao()` | `formatarArquivoMarkdown` | `extension: string` | `string` (highlight language) | Syntax highlight normalization |

`````

---

## File: `docs/topology-sanitize-version.md`

````md
# Execution Topology: `sanitize-version`

This document describes the execution topology of the **`sanitize-version`** utility, responsible for normalizing the version in the `deno.jsonc` file to strict SemVer format (`MAJOR.MINOR.PATCH`).

---

## 1. Call Graph

```
[CLI / Terminal]
       │
       ▼
sanitizeVersionCli() (packages/utils/src/version/sanitize/cli.ts)
       │
       ├──► findDenoConfig()
       │
       ▼
sanitizeVersionFile(options: SanitizeOptions) (packages/utils/src/version/sanitize/engine.ts)
       │
       ├──► Deno.readTextFile(denoJsonPath)
       ├──► parseJsonc(content)
       │
       ├──► [If version is missing]
       │       └──► version = "0.0.0"
       │
       ├──► parseVersion(version) (packages/utils/src/tools/version.ts)
       │       └──► [Regex extraction: major, minor, patch]
       │
       ├──► formatVersion(parsed)
       │       └──► `${major}.${minor}.${patch}`
       │
       ├──► replaceVersionInContent(content, newVersion)
       │       └──► [Regex replacement in JSONC string]
       │
       └──► Deno.writeTextFile(denoJsonPath, updatedContent)
```

---

## 2. Step-by-Step Execution Mapping

### Step 1: CLI Initialization
* **Function**: `sanitizeVersionCli()`
* **File**: `packages/utils/src/version/sanitize/cli.ts`
* **Input**: CLI arguments via Cliffy (`[path:string]`).
* **Actions**:
  1. Resolves the `deno.jsonc` path (default: automatic search via `findDenoConfig`).
  2. Calls `sanitizeVersionFile({ filePath })`.
  3. Displays a success message with the normalized version.

### Step 2: Version Normalization
* **Function**: `sanitizeVersionFile(options)`
* **File**: `packages/utils/src/version/sanitize/engine.ts`
* **Actions**:
  1. Reads the `deno.jsonc` file content.
  2. Extracts the current `version` field.
  3. Uses `parseVersion` to capture only numeric components (ignoring git suffixes or pre-releases).
  4. Formats the new version string.
  5. Replaces the version in the original content (preserving JSONC comments and formatting).
  6. Writes the file back to disk.

---

## 3. Summary Table

| Function | Caller | Input | Return | Side Effect |
|---|---|---|---|---|
| `sanitizeVersionCli()` | Deno CLI | `Deno.args` | `void` | Console log |
| `sanitizeVersionFile()` | CLI / API | `SanitizeOptions` | `Promise<string>` | `deno.jsonc` writing |
| `parseVersion()` | `sanitizeVersionFile` | `string` | `ParsedVersion` | Pure |
| `formatVersion()` | `sanitizeVersionFile` | `ParsedVersion` | `string` | Pure |

````

---

## File: `docs/topology-tag-version.md`

````md
# Execution Topology: `tag-version`

This document describes the execution topology of the **`tag-version`** utility, which automates the git release cycle (commit, tag cleanup, and push).

---

## 1. Call Graph

```
[CLI / Terminal]
       │
       ▼
tagVersionCli() (packages/utils/src/version/tag/cli.ts)
       │
       ├──► findDenoConfig()
       │
       ▼
tagVersionEngine(options: TagVersionOptions) (packages/utils/src/version/tag/engine.ts)
       │
       ├──► [If sanitize === true]
       │       └──► sanitizeVersionFile({ filePath, baseDir })
       │
       ├──► readProjectVersion(denoJsonPath)
       │
       ├──► [Git Flow]
       │       ├──► git add -A
       │       ├──► git commit -m "Version vX.Y"
       │       ├──► git push
       │       │
       │       ├──► git tag -d vX.Y (local)
       │       ├──► git push origin :refs/tags/vX.Y (remote)
       │       │
       │       ├──► git tag -a vX.Y -m "Release vX.Y"
       │       └──► git push origin vX.Y
```

---

## 2. Step-by-Step Execution Mapping

### Step 1: CLI Initialization
* **Function**: `tagVersionCli()`
* **File**: `packages/utils/src/version/tag/cli.ts`
* **Input**: CLI arguments (`-s/--sanitize`, `-m/--message`, etc.).
* **Actions**:
  1. Resolves the `deno.jsonc` path.
  2. Calls `tagVersionEngine(options)`.

### Step 2: Git Release Orchestration
* **Function**: `tagVersionEngine(options)`
* **File**: `packages/utils/src/version/tag/engine.ts`
* **Actions**:
  1. Optionally normalizes the version on disk via `sanitizeVersionFile`.
  2. Reads the current version from `deno.jsonc`.
  3. Executes a sequence of `git` commands using `runGit`:
     - **Commit**: Adds all changes and creates a commit with the version.
     - **Push**: Pushes the current branch to the remote.
     - **Cleanup**: Removes previous tags at the same level (MAJOR.MINOR) to ensure the release tag always points to the latest commit.
     - **Tagging**: Creates a new annotated tag and pushes it to origin with `--force`.

---

## 3. Summary Table

| Function | Caller | Input | Return | Side Effect |
|---|---|---|---|---|
| `tagVersionCli()` | Deno CLI | `Deno.args` | `void` | Git command execution |
| `tagVersionEngine()` | CLI / API | `TagVersionOptions` | `Promise<TagVersionResult>` | Local/remote Git state mutation |
| `sanitizeVersionFile()` | `tagVersionEngine` | `SanitizeOptions` | `Promise<string>` | `deno.jsonc` writing |

````

---

## File: `docs/topology-watch.md`

````md
# Execution Topology: `watch` (Continuous Development)

This document describes the complete execution topology of the **`watch`** utility, detailing the call tree, parameters passed between each layer, side effects, and extension points.

---

## 1. Call Graph

```
[CLI / Terminal]
       │
       ▼
watchCli() (packages/utils/src/watch/cli.ts)
       │
       ├──► findDenoConfig()
       ├──► carregarConfigWatch(configPath, baseDir) (packages/utils/src/watch/config.ts)
       │       │
       │       └──► loadConfig<WatchConfigFile>("watch", configPath, baseDir)
       │               └──► readJsoncFile(fullPath) / parseJsonc
       │
       ▼
watchEngine(options: WatchOptions) (packages/utils/src/watch/engine.ts)
       │
       ├──► readProjectVersion(denoJsoncPath, baseDir)
       │
       ├──► [Single Target Resolution: options.target or first 'default: true']
       │
       ├──► validateTargetConfig(targetName, targetConfig)
       │
       ├──► acquireWatchLock(baseDir, targetName, lockFile) (packages/utils/src/watch/lock.ts)
       │       │
       │       ├──► isProcessRunning(pid)
       │       ├──► [Orphan Lock Removal / Rejection if Process Active]
       │       ├──► Deno.writeTextFile(lockPath, JSON.stringify(LockInfo))
       │       └──► [Register listeners for SIGINT, SIGTERM, unload]
       │
       ├──► cleanTarget(targetConfig.distdir, targetConfig.clean) [if configured]
       │       └──► [Iterate targetConfig.clean.includes/excludes]
       │
       ├──► copyStaticFiles(targetConfig, version, baseDir, distDir)
       │       └──► [Loop targetConfig.copyFiles: { includes, excludes, basedir }]
       │
       ├──► buildWatchEsbuildOptions(targetName, targetConfig, version, listAssetsForCache)
       │       │
       │       ├──► listAssetsForCache(targetConfig.distdir) [if defineAssetsString configured]
       │       ├──► resolveEntryPoints(config.srcdir, config.entryPoints)
       │       └──► resolveOutputPaths(config)
       │
       ├──► denoPlugin({ configPath: denoJsoncPath })
       │
       ├──► esbuild.context(esbuildOptions) [Persistent Context Creation]
       │
       ├──► ctx.watch() [Real-time Monitoring Start]
       │
       └──► Returns [WatchHandle] with { target, close: async () => { ctx.dispose(); releaseLock(); } }
```

---

## 2. Step-by-Step Execution Mapping

### Step 1: CLI Initialization and Argument Validation
* **Function**: `watchCli()`
* **File**: `packages/utils/src/watch/cli.ts`
* **Input**: CLI arguments via Cliffy (`-c/--app-config`, `-b/--base-dir`, `-d/--deno-config`, `[target:string]`).
* **Actions**:
  1. Configures Cliffy command with `.arguments("[target:string]")`. Cliffy rejects multiple positional arguments with a native error (`Too many arguments: ...`).
  2. `findDenoConfig()`: Locates Deno configuration file.
  3. `carregarConfigWatch(configPath, baseDir)`: Reads `watch.jsonc` or returns `DEFAULT_WATCH_CONFIG`.
  4. Passes `target: target || undefined` to `watchEngine(options)`.
  5. Configures `Deno.addSignalListener("SIGINT" | "SIGTERM")` for graceful shutdown via `handle.close()`.
  6. Keeps process active in continuous wait (`await new Promise(() => {})`).

### Step 2: Target Resolution and Concurrency Control
* **Function**: `watchEngine(options: WatchOptions)`
* **File**: `packages/utils/src/watch/engine.ts`
* **Input Parameters**:
  ```typescript
  options: {
    config: WatchGlobalConfig;
    target?: string;
    baseDir?: string;
    denoJsoncPath?: string;
    lockFile?: string;
    silencioso?: boolean;
  }
  ```
* **Actions and Sub-functions**:
  1. `readProjectVersion(denoJsoncPath, baseDir)`: Reads version without modifying or incrementing it (strict watch behavior).
  2. **Target Resolution**:
     - If `options.target` was provided, looks for corresponding name (case-insensitive). If not found, throws `Target '<target>' not found...`.
     - If no target provided, selects **only the first** target with `default !== false`.
  3. `validateTargetConfig(targetName, targetConfig)`: Validates configuration integrity.
  4. `acquireWatchLock(baseDir, targetName, lockFile)` (`packages/utils/src/watch/lock.ts`):
     - Checks for lock file existence (`.buildit-watch.lock`).
     - If exists, extracts PID and calls `isProcessRunning(pid)`.
     - If active, throws `A watch instance is already running...` blocking concurrency.
     - If dead (orphan lock), discards file and proceeds.
     - Writes new lock with current PID, timestamp, target, and path.
     - Returns `releaseLock()` cleanup function.

### Step 3: esbuild Context Initialization
* **Function**: `buildWatchEsbuildOptions` & `esbuild.context`
* **File**: `packages/utils/src/watch/engine.ts`
* **Actions and Sub-functions**:
  1. `cleanTarget(distdir, clean)`: Cleans output folder based on `includes`/`excludes`.
  2. `copyStaticFiles(targetConfig, version, baseDir, distDir)`: Copies files based on `copyFiles` (glob support).
  3. `buildWatchEsbuildOptions(targetName, targetConfig, version, listAssetsForCache)`:
     - Defines `__APP_VERSION__`.
     - Collects assets for cache if `defineAssetsString` is configured.
     - Resolves entry points and outputs with default `inline` sourcemap.
     - Maps advanced options.
  4. Injects `denoPlugin({ configPath: denoJsoncPath })`.
  5. `esbuild.context(esbuildOptions)`: Instantiates incremental esbuild context.
  6. `ctx.watch()`: Starts file system observers and background continuous compilation.
  7. Returns handle with `close()` method that closes context (`ctx.dispose()`) and releases lock file (`releaseLock()`).

---

## 3. Parameters and Returns Summary Table

| Function | Caller | Input / Parameters | Return | Side Effect |
|---|---|---|---|---|
| `watchCli()` | Deno CLI Runtime | `Deno.args` | `Command` instance | CLI processing, signal capture, life loop |
| `carregarConfigWatch()` | `watchCli` | `configPath?: string`, `baseDir?: string` | `Promise<WatchConfigResult>` | `watch.jsonc` disk reading |
| `watchEngine()` | `watchCli` / API | `options: WatchOptions` | `Promise<WatchHandle[]>` | Lock creation, incremental watcher initialization |
| `acquireWatchLock()` | `watchEngine` | `baseDir: string`, `targetName: string`, `customPath?: string` | `Promise<() => Promise<void>>` | Lock file creation, listener registration |
| `isProcessRunning()` | `acquireWatchLock` | `pid: number` | `boolean` | PID check via signal 0 |
| `buildWatchEsbuildOptions()` | `watchEngine` | `targetName`, `config`, `version`, `listAssetsFn?` | `Promise<esbuild.BuildOptions>` | Entrypoint mapping, inline sourcemap, and defines |
| `handle.close()` | `watchCli` / Tests | None | `Promise<void>` | `ctx.dispose()` and `releaseLock()` |

---

## 4. Opportunities for Improvement and Refactoring

1. **Static Files Reload (Hot Copy)**: Currently `copyStaticFiles` runs at initialization. A complementary watcher for the `publicdir` folder would allow auto-copying modified images or assets during dev session.
2. **Rebuild Notification / Callback Hook**: Add support for hook callbacks (e.g., `onRebuild(result)`) in `watchEngine` options for integration with dev servers emitting SSE/WebSocket reloads.
3. **Parallel Multi-Target with Lock Isolation**: If monitoring multiple simultaneous targets is desired (e.g., `ui` and `server`), the lock mechanism can evolve to per-target named locks (`.buildit-watch-<target>.lock`).

````

---

