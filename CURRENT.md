# `CURRENT.md`

## Current Status: Phase 4 (Stabilization & Final Documentation) ➔ Phase 5 (Completed)

This repository is a fork of workerdb and was refactored to create and distribute the **`@vanaware/buildit`** library.

The library is consolidated in the `packages/utils` package containing **six** core tools and utilities, all governed by declarative external configuration files (`.jsonc`), supported by formal JSON Schemas, and published via JSR:
1. **esbuild** => Ultra-fast production build orchestrator *(✅ Completed)*
2. **watch** => Continuous development file watcher *(✅ Completed)*
3. **denobuild** => Native Deno bundler using `Deno.bundle` *(✅ Completed)*
4. **export** => Consolidates and exports codebase context for AI/LLMs *(✅ Completed)*
5. **sanitize-version** => Strict SemVer normalization for `deno.jsonc` *(✅ Completed)*
6. **tag-version** => Release automation and git tag push *(✅ Completed)*

---

### ✅ Completed Work (Detailed Log):

#### 1. Engines and Utilities in `@vanaware/buildit` (`packages/utils`)
- **`esbuild` (`packages/utils/src/esbuild/`)**:
  - `config.ts`: Loads `esbuild.jsonc` supporting declarative targets, option merging, and custom paths.
  - `bundle.ts`: Integration with `esbuild` and `@deno/esbuild-plugin`, remote/NPM/JSR import resolution, `__APP_VERSION__` injection, and flags for `define`, `drop`, `minify`, `sourcemap`, and `metafile`.
  - `engine.ts`: Orchestrator with pre-build directory cleanup (`clean`) and flexible static asset copying (`copyFiles`) with version injection into `manifest.json`.
  - `cli.ts` & `esbuild.ts`: CLI runner with Cliffy and visual telemetry report.
  - Dedicated BDD tests in `packages/utils/tests/esbuild/`.
  - Topology documentation in `docs/topology-esbuild.md`.

- **`watch` (`packages/utils/src/watch/`)**:
  - `config.ts`: Parsing and validation of `watch.jsonc` with fallbacks and examples.
  - `lock.ts`: Concurrency prevention with PID lockfile (`.buildit-watch.lock`) and graceful termination cleanup.
  - `engine.ts`: High-performance continuous watch based on `esbuild.context` with sub-millisecond incremental rebuilds.
  - `cli.ts` & `watch.ts`: Strict command-line interface (single target argument validation).
  - Dedicated BDD tests in `packages/utils/tests/watch/`.
  - Topology documentation in `docs/topology-watch.md`.

- **`denobuild` (`packages/utils/src/denobuild/`)**:
  - `config.ts`: Reads `denobuild.jsonc` supporting multiple targets (`DenoBundleTargetConfig`).
  - `bundle.ts`: In-memory compile-time defines injection and `Deno.bundle` (`--unstable-bundle`) configuration.
  - `engine.ts`: Pure compilation orchestrator without external binaries, integrating directory cleanup and asset copying.
  - `cli.ts` & `denobuild.ts`: Delegated CLI runners.
  - BDD tests in `packages/utils/tests/denobuild/`.
  - Topology documentation in `docs/topology-denobuild.md`.

- **`export` (`packages/utils/src/export/`) - Full Modernization**:
  - `formatter.ts`: Pure pattern matching with glob support via `globToRegExp` (`matchesGlobs`), sanitization, dynamic backtick wrapper calculation (`calculateBacktickWrapper`), anti-loop protection categorically safeguarding `exports/` and `snapshots/`, and AI header generation with instruction fallbacks.
  - `engine.ts`: Optimized directory scanning using `expandGlob`, `includes`/`excludes` support, `Set<string>` deduplication, and deterministic alphabetical sorting.
  - Disk writing via native streaming (`Deno.open` with `file.writable`) reducing memory footprint to $O(1)$.
  - `config.ts` & `export.jsonc`: 4 modern declarative modes (`ui`, `docs`, `server`, `utils`) with brace expansion (e.g., `packages/ui/{src,public}/**/*.{ts,tsx,html,json}`).
  - Comprehensive BDD tests in `packages/utils/tests/export/` (`export-api.test.ts`, `export.test.ts`, `utils.test.ts`).
  - Updated topology documentation in `docs/topology-export.md`.

#### 2. Unified Types and JSON Schemas (`packages/utils`)
- `packages/utils/src/tools/interfaces.ts`: Centralization and simplification of all interfaces (`TargetConfig`, `WatchTargetConfig`, `ExportConfig`, `DenoBundleTargetConfig`, `VersionUpdateOptions`, etc.) with concise typings and complete JSDoc documentation.
- `packages/utils/schema/`: Official JSON Schemas for autocomplete and in-editor validation:
  - `esbuild.json`
  - `watch.json`
  - `denobuild.json`
  - `export.json`
- Root configurations (`esbuild.jsonc`, `watch.jsonc`, `denobuild.jsonc`, `export.jsonc`) updated with `$schema`.

#### 3. Frontend & PWA Dashboard (Preact + BeerCSS + Signals)
- Executive dashboard in `packages/ui/src/`:
  - `Header.tsx`: Polished visual identity with contextual chips (`Deno 2.x`, `JSR`) and dynamically injected version.
  - `AppDashboard.tsx`: Interactive documentation, tools catalog, CLI reference with direct copy buttons, configuration viewers (.jsonc), and Deno programmatic API code snippets.
  - `stores/app.ts` & BDD tests: Pure reactivity via `@preact/signals` without React hooks and without Tailwind.

#### 4. JSR Compliance and Documentation
- `packages/utils/deno.jsonc`: Configured for publication with name `@vanaware/buildit`, semantic versioning, strict `publish.include`/`publish.exclude`, and modular exports.
- `packages/utils/README.md` & root `README.md`: Complete usage documentation with CLI and programmatic examples, including the version utilities.
- `docs/api.md`: Updated technical reference covering all 6 engines and utilities.
- `docs/publish-jsr-rules.md`: JSR compliance guide (complete JSDoc, no local nodule references, MIT license).
- CI/CD in `.github/workflows/jsr-publish.yml` configured for automated publication with version sanitization.

---

### ⏳ Completed Roadmap & Milestones:

#### High Priority (JSR Publication):
- [x] **1. Updated Snapshots Generation**:
  - Ran `deno task export` to regenerate all 4 files in `snapshots/` (`ui.md`, `server.md`, `docs.md`, `utils.md`) using the streaming engine and modern glob filters.
- [x] **2. Strict JSR Publication Validation (`@vanaware/buildit`)**:
  - Validated explicit type annotations across public configuration modules and typings.
  - Validated `deno task lint:doc` (`deno doc --lint`) across all 7 public entrypoints with 0 errors and 0 warnings.
  - Validated `deno publish --dry-run` inside `packages/utils`.
- [x] **3. Versioning & Release Pipeline Validation**:
  - Validated `sanitize-version.ts` and `tag-version.ts` ensuring clean SemVer releases.
  - Validated GitHub Actions workflow `.github/workflows/jsr-publish.yml` for `v*.*` tag triggers.

#### Monorepo Consolidation:
- [x] **4. `@vanaware/buildit` Package Integration**:
  - Maintained clear workspace dependency boundaries across `packages/server`, `packages/ui`, and `packages/utils`.
- [x] **5. Legacy Cleanup**:
  - Removed outdated database dependencies from the original fork, keeping the repository focused, fast, and lightweight.

**TODO LIST 1**
- [x] Modernized `export` utility to exclusively use glob and brace expansion.
- [x] Refactored `parseArgs`: `noversion` detection handled by CLI, and `resolveTargetOrder` handled inside engine to guarantee deterministic execution order regardless of invocation method.
- [x] `baseDir` passed to `processTarget` / `processBundleTarget` via `resolveWithBase` for paths in `srcdir`, `distdir`, `copyFiles`, and `clean`.
- [x] Replaced legacy `publicdir` and `indexHtml` with flexible `copyFiles` configuration supporting globs and brace expansion:
```typescript
copyFiles: [{
  basedir?: string;
  includes?: string[]; // accepts globs and brace expansion
  excludes?: string[]; // accepts globs and brace expansion
}]
```
- [x] Enhanced `clean` rules supporting globs and excludes relative to `distdir`:
```typescript
clean: {
  includes?: string[];
  excludes?: string[];
}
```

**TODO LIST 2**
- [x] `generateHeader` in `formatter.ts` treating guideline text as overridable via `header` option.
- [x] New `header` option supported in `export.jsonc` (global and per-mode).
- [x] Project name parameterizable via `project` option (default: "BuildIt") globally and per-mode.
- [x] JSON Schema `packages/utils/schema/export.json` and TypeScript interfaces updated with complete JSDoc.
- [x] BDD unit tests in `packages/utils/tests/export/utils.test.ts` covering default headers, custom headers, and custom project names.

**TODO LIST 3**
- [x] Ported `lib-version.sh` to TypeScript in `packages/utils/src/tools/version.ts`.
- [x] Implemented `sanitize-version` CLI with Cliffy in `packages/utils/src/version/sanitize/`.
- [x] Implemented `tag-version` CLI with Cliffy in `packages/utils/src/version/tag/`.
- [x] Exported new modules in `@vanaware/buildit` (JSR ready).
- [x] Created root runners (`sanitize-version.ts`, `tag-version.ts`) and updated `deno.jsonc` tasks.
- [x] Complete BDD tests for the new version utilities.

**TODO LIST 4 (UX & Modernization)**
- [x] Radically simplified UI: unified dashboard experience in `packages/ui/src/components/AppDashboard.tsx`.
- [x] Technical documentation in `docs/api.md` synchronized with all 6 tools.
- [x] Root `README.md` and `packages/utils/README.md` synchronized with modern architecture.
- [x] `AGENTS.md` synchronized with Deno PWA guidelines.
- [x] Removed redundant `version` field from tool config schemas (`esbuild.json`, `watch.json`, `denobuild.json`, `export.json`), centralizing versioning exclusively in root `deno.jsonc`.
- [x] Standardized engine imports directly from `jsr:@vanaware/buildit`.
- [x] Enhanced `versionPaths` behavior: creates missing files with `__APP_VERSION__` template without overwriting existing files on disk.

**TODO LIST 5 (Refinements)**
- [x] Removed unused `"mode": "build" | "watch"` options from target configs and schemas.
- [x] Moved `defineVersionString` to global config level in `denobuild`, `esbuild`, and `watch`.
- [x] Unified asset listing (`listAssetsForCache` scanner vs `listAssetsFn` injection for testing).

**TODO LIST 6 (Adjustments)**
- [x] Unified version extraction to use `readProjectVersion` across utilities and tests.
- [x] Updated `ensureVersionFile` to generate JavaScript templates when receiving `.js` files, and TypeScript by default for `.ts`.

**TODO LIST 7 (Internationalization, JSDoc & JSR Compliance)**
- [x] Complete English translation of all test suites across `packages/utils/tests/` and `packages/ui/tests/` (BDD descriptions, assertions, and fixtures).
- [x] 100% JSDoc coverage across public symbols, interfaces, and types in `packages/utils/src/tools/interfaces.ts`.
- [x] Rigorous documentation linting with `deno task lint:doc` (`deno doc --lint`) across all 7 public entrypoints (0 errors, 0 warnings).
- [x] Standard Deno formatting enforced across entire repository (`deno fmt --check` passing 100%).
- [x] Full validation test suite (`deno task tests`: check, lint, fmt:check, test) passing (50 test suites, 328 steps, 0 failures).
- [x] Production build (`npm run build`) successfully executed and verified.

**TODO LIST 7**
- [ ] criar novo utilitário de extração de documentação , ver arquivo docs/todo.md