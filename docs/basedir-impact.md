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
