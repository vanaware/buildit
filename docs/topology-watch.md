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
