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
