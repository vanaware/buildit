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
