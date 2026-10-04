> **AI INSTRUCTION:** 
> The text below contains the code and tests for the @vanaware/buildit library
> Each file starts with a title indicating its exact relative path (e.g., `## File: src/main.ts`).
> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.

---

# Exported Context from Project BuildIt - Mode: UTILS

Automatically generated at: 2026-10-04T19:05:09.053Z

---

## File: `packages/utils/deno.jsonc`

```json
{
  "name": "@vanaware/buildit",
  "version": "0.4.22#muu6xhan",
  "license": "MIT",
  "compilerOptions": {
    "lib": [
      "deno.window",
      "deno.unstable"
    ]
  },
  "imports": {
    "@std/jsonc": "jsr:@std/jsonc@^1.0.2",
    "@std/path": "jsr:@std/path@^1.1.6",
    "@std/fs": "jsr:@std/fs@^1.0.24",
    "@cliffy/command": "jsr:@cliffy/command@^1.3.1",
    "esbuild": "npm:esbuild@^0.28.2",
    "@deno/esbuild-plugin": "jsr:@deno/esbuild-plugin@^1.2.1"
  },
  "tasks": {
    "test": "deno test -P",
    "lint": "deno lint",
    "fmt": "deno fmt",
    "check": "deno check src/**/*.{ts,tsx} tests/**/*.ts",
    "fmt:check": "deno fmt --check",
    "lint:fix": "deno lint --fix",
    "lint:doc": "deno doc --lint src/mod.ts src/esbuild/cli.ts src/watch/cli.ts src/export/cli.ts src/denobuild/cli.ts src/version/sanitize/cli.ts src/version/tag/cli.ts",
    "tests": "deno task check && deno task lint && deno task fmt:check && deno task test"
  },
  "exports": {
    ".": "./src/mod.ts",
    "./cli/esbuild": "./src/esbuild/cli.ts",
    "./cli/watch": "./src/watch/cli.ts",
    "./cli/export": "./src/export/cli.ts",
    "./cli/denobuild": "./src/denobuild/cli.ts",
    "./cli/sanitize-version": "./src/version/sanitize/cli.ts",
    "./cli/tag-version": "./src/version/tag/cli.ts"
  },
  "publish": {
    "include": [
      "src/**/*.ts",
      "README.md",
      "docs/**/*.md",
      "schema/**/*.json",
      "deno.jsonc"
    ],
    "exclude": [
      "tests"
    ]
  },
  "lint": {
    "rules": {
      "tags": ["recommended"],
      "include": ["ban-untagged-todo"],
      "exclude": ["no-unused-vars"]
    },
    "include": [
      "src/**/*.{ts,tsx}",
      "tests/**/*test.ts"
    ]
  },
  "test": {
    "permissions": {
      "read": true,
      "write": true,
      "net": true,
      "env": true,
      "sys": true,
      "run": true,
      "ffi": true,
      "import": true
    },
    "include": [
      "tests/**/*test.ts"
    ],
    "exclude": [
      "src/**/*.{ts,tsx}"
    ]
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 80,
    "indentWidth": 2,
    "semiColons": true,
    "singleQuote": false,
    "proseWrap": "preserve",
    "trailingCommas": "always",
    "json.trailingCommas": "never",
    "operatorPosition": "maintain",
    "jsx.bracketPosition": "sameLine",
    "jsx.forceNewLinesSurroundingContent": true,
    "jsx.multiLineParens": "always",
    "newLineKind": "lf",
    "include": [
      "src/**/*.{ts,tsx}",
      "tests/**/*test.ts"
    ]
  },
  "exclude": [
    "docs"
  ]
}

```

---

## File: `packages/utils/src/denobuild/bundle.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild/bundle
 * @description Utility functions and option generators for the native Deno.bundle API.
 */

import {
  applyDefines,
  resolveEntryPoints,
  resolveOutputPaths,
} from "../tools/paths.ts";
import type { DenoBundleTargetConfig, } from "../tools/interfaces.ts";


/**
 * Builds the options object accepted by the `Deno.bundle` API.
 *
 * @param config Compilation target configuration
 * @returns `Deno.bundle.Options` object ready for execution
 *
 * @example
 * ```typescript
 * const options = buildBundleOptions(config);
 * ```
 */
export function buildBundleOptions(
  config: DenoBundleTargetConfig,
): Deno.bundle.Options {
  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  const { outfile, outdir, } = resolveOutputPaths(config,);

  const options: Deno.bundle.Options = {
    entrypoints: resolvedEntryPoints,
    write: config.write ?? false,
  };

  if (outfile) {
    options.outputPath = outfile;
  } else if (outdir) {
    options.outputDir = outdir;
  }

  if (config.platform !== undefined) options.platform = config.platform;
  if (config.format !== undefined) options.format = config.format;
  if (config.minify !== undefined) options.minify = config.minify;
  if (config.keepNames !== undefined) options.keepNames = config.keepNames;
  if (config.sourcemap !== undefined) options.sourcemap = config.sourcemap;
  if (config.codeSplitting !== undefined) {
    options.codeSplitting = config.codeSplitting;
  }
  if (config.inlineImports !== undefined) {
    options.inlineImports = config.inlineImports;
  }
  if (config.packages !== undefined) options.packages = config.packages;
  if (config.external !== undefined) options.external = config.external;

  // Extended options that might be supported by future Deno.bundle versions
  const extendedOptions = options as any;
  if (config.jsx !== undefined) extendedOptions.jsx = config.jsx;
  if (config.jsxFactory !== undefined) extendedOptions.jsxFactory = config.jsxFactory;
  if (config.jsxFragment !== undefined) extendedOptions.jsxFragment = config.jsxFragment;
  if (config.jsxImportSource !== undefined) {
    extendedOptions.jsxImportSource = config.jsxImportSource;
  }

  return options;
}

````

---

## File: `packages/utils/src/denobuild/cli.ts`

```ts
/**
 * @module @vanaware/buildit/denobuild/cli
 * @description CLI entry point for the denobuild orchestrator based on Deno.bundle API.
 */

import { Command, } from "@cliffy/command";
import { readProjectVersion, } from "../tools/version.ts";
import { loadDenoBuildConfig, } from "./config.ts";
import { denoBuild, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { parseArgs, } from "../tools/cli-flags.ts";

/**
 * Executes the Deno.bundle-based build orchestrator CLI.
 */
export function denoBuildCli(): Command<any> {
  return new Command()
    .name("denobuild",)
    .description("BuildIt Deno.bundle Orchestrator",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Configuration file", {
      env: { prefix: "DENOBUILD_", },
    },)
    .option("-b, --base-dir [dir:string]", "Base Directory", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Deno Configuration", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .option(
      "-n, --noversion",
      "Disable automatic version increment",
      {
        default: false,
      },
    )
    .arguments("[targets...:string]", ["Build targets",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = options.baseDir as string || ".";
      const configPath = options.appConfig as string;
      const loaded = await loadDenoBuildConfig(configPath, baseDir,);
      const configs = loaded.targets;

      const { targets, globalNoVersion, } = parseArgs(
        args,
        { noversion: Boolean(options.noversion,), },
      );

      console.log(
        "\n🚀 Starting BuildIt Build Orchestrator (denobuild / Deno.bundle API)",
      );
      console.log(`   📦 Engine: Deno.bundle (native, --unstable-bundle)`,);
      console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

      try {
        await denoBuild({
          config: configs,
          targets: targets.length > 0 ? targets : undefined,
          baseDir,
          noversion: globalNoVersion,
          versionPaths: loaded.versionPaths,
          forcepackagesversion: loaded.forcepackagesversion,
          defineVersionString: loaded.defineVersionString,
          denoJsoncPath: options.denoConfig as string,
        },);

        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 DENOBUILD ORCHESTRATION COMPLETED SUCCESSFULLY!`,);
        console.log(`${"=".repeat(60,)}`,);
      } catch (error) {
        console.error("\n🛑 Build pipeline failed:", error,);
        Deno.exit(1,);
      } finally {
        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n⏱️ Total time: ${elapsed}ms\n`,);
      }
    },);
}

if (import.meta.main) {
  const cli = denoBuildCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `packages/utils/src/denobuild/config.ts`

```ts
/**
 * @module @vanaware/buildit/denobuild/config
 * @description Loading external configurations from `denobuild.jsonc`.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  DenoBuildConfigFile,
  DenoBuildConfigResult,
  DenoBundleGlobalConfig,
} from "../tools/interfaces.ts";

/**
 * Example configuration for the Deno.bundle engine in the BuildIt project.
 */
export const DENOBUILD_CONFIG_EXAMPLE: DenoBundleGlobalConfig = {
  ui: {
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    clean: {
      includes: ["*",],
    },
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    minify: false,
    sourcemap: "linked",
    keepNames: true,
    codeSplitting: false,
    packages: "bundle",
    inlineImports: true,
  },
};

/**
 * Loads target configurations for the Deno.bundle engine from an external JSONC file
 * (e.g., `denobuild.jsonc` or `denobuild.json`).
 *
 * If the file is not found, execution is interrupted with an example message.
 *
 * @param configPath Optional path to the configuration file
 * @param baseDir Base directory for relative file resolution
 * @returns Loaded configuration with targets and global options
 */
export async function loadDenoBuildConfig(
  configPath?: string,
  baseDir: string = ".",
): Promise<DenoBuildConfigResult> {
  const parsed = await loadConfig<DenoBuildConfigFile>(
    "denobuild",
    configPath,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Configuration file "denobuild.jsonc" not found in the project root.
BuildIt now requires an explicit target declaration.

Minimum "denobuild.jsonc" file example:
{
  "targets": {
    "app": {
      "srcdir": "src",
      "distdir": "dist",
      "entryPoints": ["main.tsx"]
    }
  }
}`);
  }

  const result: DenoBuildConfigResult = {
    targets: {},
  };

  result.versionPaths = parsed.versionPaths;
  result.forcepackagesversion = parsed.forcepackagesversion;
  result.defineVersionString = parsed.defineVersionString;

  if (parsed.targets && typeof parsed.targets === "object") {
    result.targets = parsed.targets;
  } else {
    throw new Error(`❌ Key "targets" not found in the denobuild configuration file.`);
  }

  return result;
}

```

---

## File: `packages/utils/src/denobuild/engine.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild/engine
 * @description Core compilation mechanism, define injection, and target processing with Deno.bundle.
 */

import { join, } from "@std/path";
import { updateProjectVersion, } from "../tools/version.ts";
import {
  cleanTarget,
  copyStaticFiles,
  ensureDirForFile,
  listAssetsForCache,
  resolveWithBase,
  applyDefines
} from "../tools/paths.ts";

import { validateTargetConfig, } from "../tools/validate.ts";
import { resolveTargetOrder, } from "../tools/targets.ts";

import { buildBundleOptions, } from "./bundle.ts";
import type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
} from "../tools/interfaces.ts";

/**
 * Processes the compilation of a specific target using the Deno.bundle engine.
 *
 * Executed steps:
 * 1. Configuration consistency validation
 * 2. Pre-cleanup of output directories (clean)
 * 3. Copying of static files and HTML templates
 * 4. Preparation of compile-time definitions (defines)
 * 5. Invocation of the native `Deno.bundle` API
 * 6. Memory variable injection and disk writing
 *
 * @param targetName Target identifier name (e.g., "ui")
 * @param config Target configuration object
 * @param appVersion Current application semantic version
 * @param listAssetsFn Optional function to list generated assets for Service Worker cache
 * @returns Detailed target compilation result
 *
 * @example
 * ```typescript
 * const result = await processBundleTarget("ui", config, "0.3.5");
 * ```
 */
export async function processBundleTarget(
  targetName: string,
  config: DenoBundleTargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
  baseDir: string = ".",
  defineVersionString?: string,
): Promise<DenoBuildResult> {
  const resolvedConfig: DenoBundleTargetConfig = {
    ...config,
    srcdir: resolveWithBase(config.srcdir, baseDir,),
    distdir: resolveWithBase(config.distdir, baseDir,),
  };

  validateTargetConfig(targetName, resolvedConfig,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎯 PROCESSING TARGET: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  // 1. Clean output directory
  if (resolvedConfig.clean) {
    if (resolvedConfig.distdir) {
      await cleanTarget(resolvedConfig.distdir, resolvedConfig.clean,);
    } else {
      console.warn(
        `⚠️ 'clean' configured but 'distdir' missing. Skipping cleanup.`,
      );
    }
  }

  // 2. Copy static files
  await copyStaticFiles(
    resolvedConfig,
    appVersion,
    baseDir,
    resolvedConfig.distdir,
  );

  // 3. Prepare defines
  // deno-lint-ignore no-explicit-any
  const defineVersionKey = defineVersionString || (resolvedConfig as any).defineVersionString || "__APP_VERSION__";
  const defines: Record<string, string> = {
    ...resolvedConfig.define,
    [defineVersionKey]: JSON.stringify(`v${appVersion}`,),
  };

  if (
    resolvedConfig.defineAssetsString &&
    resolvedConfig.defineAssetsString.trim() !== "" &&
    listAssetsFn &&
    resolvedConfig.distdir
  ) {
    const assets = await listAssetsFn(resolvedConfig.distdir,);
    defines[resolvedConfig.defineAssetsString] = JSON.stringify(assets,);
    console.log(`📋 ${assets.length} assets listed for define '${resolvedConfig.defineAssetsString}'`,);
  }

  // 4. Run bundle
  console.log(`🔨 Compiling with Deno.bundle...`,);
  const startTime = performance.now();
  const bundleOptions = buildBundleOptions(resolvedConfig,);
  const result = await Deno.bundle(bundleOptions,);

  // 5. Check for errors
  if (!result.success) {
    console.error("❌ Compilation errors:",);
    for (const error of result.errors) {
      const loc = error.location
        ? ` (${error.location.file}:${error.location.line}:${error.location.column})`
        : "";
      console.error(`   ${error.text}${loc}`,);
      for (const note of error.notes ?? []) {
        console.error(`      💡 ${note.text}`,);
      }
    }
    throw new Error(`Bundle failed for target [${targetName}]`,);
  }

  // 6. Display warnings (if any)
  for (const warning of result.warnings) {
    const loc = warning.location
      ? ` (${warning.location.file}:${warning.location.line}:${warning.location.column})`
      : "";
    console.warn(`   ⚠️ ${warning.text}${loc}`,);
  }

  // 7. Process generated files
  const outputFiles = result.outputFiles ?? [];
  const writtenPaths: string[] = [];

  if (outputFiles.length === 0) {
    console.warn(`   ⚠️ No files generated by bundle [${targetName}]`,);
    return {
      target: targetName,
      success: true,
      durationMs: Number((performance.now() - startTime).toFixed(0,),),
      outputFiles: [],
    };
  }

  const defineKeys = Object.keys(defines,);
  const hasDefines = defineKeys.length > 0;
  if (hasDefines) {
    console.log(
      `🔧 Injecting ${defineKeys.length} define(s): ${defineKeys.join(", ",)}`,
    );
  }

  for (const outputFile of outputFiles) {
    let content = outputFile.text();

    // 7.1 Inject globalName if IIFE and no native support (manual fallback)
    if (resolvedConfig.format === "iife" && resolvedConfig.globalName && !content.includes(`var ${resolvedConfig.globalName}`)) {
      content = `var ${resolvedConfig.globalName} = (function() {\nvar exports = {};\n${content}\nreturn exports;\n})();`;
    }

    // 7.2 Apply Defines
    if (hasDefines) {
      content = applyDefines(content, defines,);
    }

    // 7.3 Apply Banner (JS)
    if (resolvedConfig.banner?.js && (outputFile.path.endsWith(".js") || outputFile.path.endsWith(".mjs"))) {
      const banner = resolvedConfig.banner.js
        .replaceAll("__APP_VERSION__", appVersion)
        .replaceAll(defineVersionKey, appVersion);
      content = banner + "\n" + content;
    }

    // 7.4 Apply Footer (JS)
    if (resolvedConfig.footer?.js && (outputFile.path.endsWith(".js") || outputFile.path.endsWith(".mjs"))) {
      const footer = resolvedConfig.footer.js
        .replaceAll("__APP_VERSION__", appVersion)
        .replaceAll(defineVersionKey, appVersion);
      content = content + "\n" + footer;
    }

    // 7.5 Write to disk (unless write is explicitly false)
    if (resolvedConfig.write !== false) {
      await ensureDirForFile(outputFile.path,);
      await Deno.writeTextFile(outputFile.path, content,);
      writtenPaths.push(outputFile.path,);
      console.log(
        `   📄 ${outputFile.path} (${(content.length / 1024).toFixed(1,)}KB)`,
      );
    } else {
      writtenPaths.push(outputFile.path,);
      console.log(
        `   📦 [In-Memory] ${outputFile.path} (${(content.length / 1024).toFixed(1,)}KB)`,
      );
    }
  }

  const durationMs = Number((performance.now() - startTime).toFixed(0,),);
  console.log(
    `✅ [${targetName}] Build completed in ${durationMs}ms (${outputFiles.length} file(s))`,
  );

  return {
    target: targetName,
    success: true,
    durationMs,
    outputFiles: writtenPaths,
  };
}

/**
 * Programmatically executes compilation via Deno.bundle for configured targets.
 * Accepts a DenoBundleGlobalConfig object directly in memory or DenoBuildOptions.
 *
 * @param configOuOpcoes Memory DenoBundleGlobalConfig object or full execution options
 * @returns List of results obtained per target
 *
 * @example
 * ```typescript
 * const results = await denoBuild({
 *   config: {
 *     ui: { entryPoints: ["main.tsx"], distdir: "dist", srcdir: "src" }
 *   },
 *   targets: ["ui"],
 *   noversion: true
 * });
 * ```
 */
export async function denoBuild(
  opcoes: DenoBuildOptions,
): Promise<DenoBuildResult[]> {
  const configs = opcoes.config;
  const baseDir = opcoes.baseDir ?? ".";
  const denoJsoncPath = opcoes.denoJsoncPath ?? join(baseDir, "deno.jsonc",);

  // Strictly ensures that the execution order follows the declaration in the configuration
  const targetsToExecute = resolveTargetOrder(configs, opcoes.targets,);

  console.log(
    `📋 Build targets (safe CONFIG order): ${
      targetsToExecute.join(", ",) || "(none)"
    }`,
  );

  if (targetsToExecute.length === 0) {
    return [];
  }

  const finalVersion = await updateProjectVersion({
    denoJsonPath: denoJsoncPath,
    baseDir,
    noversion: opcoes.noversion ?? false,
    versionPaths: opcoes.versionPaths,
    forcepackagesversion: opcoes.forcepackagesversion,
    defineVersionString: opcoes.defineVersionString,
  },);

  const resultados: DenoBuildResult[] = [];

  for (const targetName of targetsToExecute) {
    const targetConfig = configs[targetName];
    if (!targetConfig) {
      console.warn(
        `⚠️ Target '${targetName}' not found in configuration. Skipping.`,
      );
      continue;
    }

    const listFn = targetConfig.defineAssetsString ? listAssetsForCache : undefined;
    const res = await processBundleTarget(
      targetName,
      targetConfig,
      finalVersion,
      listFn,
      baseDir,
      opcoes.defineVersionString,
    );
    resultados.push(res,);
  }

  return resultados;
}

````

---

## File: `packages/utils/src/denobuild/mod.ts`

````ts
/**
 * @module @vanaware/buildit/denobuild
 * @description Orchestrator and compilation library using the native `Deno.bundle` API (--unstable-bundle).
 *
 * Supports external declarative configuration via `denobuild.jsonc`, pre and post-processing,
 * in-memory define injection, asset copying, and high-performance ESM bundle generation.
 *
 * @example
 * ```typescript
 * import { denoBuild } from "jsr:@vanaware/buildit";
 *
 * const results = await denoBuild({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   targets: ["ui"],
 *   noversion: true,
 * });
 * ```
 */

export { denoBuild, } from "./engine.ts";

export { 
  DENOBUILD_CONFIG_EXAMPLE as denobuildExample, 
  loadDenoBuildConfig
} from "./config.ts";

export type {
  DenoBuildOptions,
  DenoBuildResult,
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
} from "../tools/interfaces.ts";

````

---

## File: `packages/utils/src/esbuild/cli.ts`

```ts
/**
 * @module @vanaware/buildit/esbuild/cli
 * @description CLI entry point for the build orchestrator based on esbuild.
 */

import { Command, } from "@cliffy/command";
import { loadEsbuildConfig, } from "./config.ts";
import { esBuild, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { parseArgs, } from "../tools/cli-flags.ts";

/**
 * Executes the esbuild-based build orchestrator CLI.
 */
export function esBuildCli(): Command<any> {
  return new Command()
    .name("esbuild",)
    .description("BuildIt esbuild Orchestrator",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Configuration file", {
      env: { prefix: "ESBUILD_", },
    },)
    .option("-b, --base-dir [dir:string]", "Base Directory", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Deno Configuration", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .option(
      "-n, --noversion",
      "Disable automatic version increment",
      {
        default: false,
      },
    )
    .arguments("[targets...:string]", ["Build targets",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = options.baseDir as string || ".";
      const configPath = options.appConfig as string;
      const loaded = await loadEsbuildConfig(configPath, baseDir,);
      const configs = loaded.targets;

      const { targets, globalNoVersion, } = parseArgs(
        args,
        { noversion: Boolean(options.noversion,), },
      );

      const DENO_JSONC_PATH = options.denoConfig as string || "deno.jsonc";

      console.log(
        "\n🚀 Starting BuildIt Build Orchestrator (native esbuild + @deno/esbuild-plugin)",
      );
      console.log(`🔒 Noversion: ${globalNoVersion}\n`,);

      try {
        await esBuild({
          config: configs,
          targets: targets.length > 0 ? targets : undefined,
          noversion: globalNoVersion,
          versionPaths: loaded.versionPaths,
          forcepackagesversion: loaded.forcepackagesversion,
          defineVersionString: loaded.defineVersionString,
          denoJsoncPath: DENO_JSONC_PATH,
          baseDir,
          silent: false,
        },);

        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 ESBUILD ORCHESTRATION COMPLETED SUCCESSFULLY!`,);
        console.log(`${"=".repeat(60,)}`,);
      } catch (error) {
        console.error("\n🛑 Build pipeline failed:", error,);
        Deno.exit(1,);
      } finally {
        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n⏱️ Total time: ${elapsed}ms\n`,);
      }
    },);
}

if (import.meta.main) {
  const cli = esBuildCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `packages/utils/src/esbuild/config.ts`

```ts
/**
 * @module @vanaware/buildit/esbuild/config
 * @description Loading external configurations from `esbuild.jsonc`.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  EsbuildConfigFile,
  EsbuildConfigResult,
  GlobalTargetConfig,
} from "../tools/interfaces.ts";

/**
 * Example configuration for the esbuild engine in the BuildIt project.
 */
export const ESBUILD_CONFIG_EXAMPLE: GlobalTargetConfig = {
  ui: {
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    clean: {
      includes: ["*",],
    },
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    bundle: true,
    minify: false,
    sourcemap: "linked",
    conditions: ["browser",],
    jsx: "automatic",
    jsxImportSource: "preact",
    metafile: true,
    write: true,
    legalComments: "eof",
    keepNames: true,
    splitting: false,
  },
};

/**
 * Loads target configurations for the esbuild engine from an external JSONC file
 * (e.g., `esbuild.jsonc` or `esbuild.json`).
 *
 * If the file is not found, execution is interrupted with an example message.
 *
 * @param configPath Optional path to the configuration file
 * @param baseDir Base directory for relative file resolution
 * @returns Loaded configuration with targets and global options
 */
export async function loadEsbuildConfig(
  configPath?: string,
  baseDir: string = ".",
): Promise<EsbuildConfigResult> {
  const parsed = await loadConfig<EsbuildConfigFile>(
    "esbuild",
    configPath,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Configuration file "esbuild.jsonc" not found in the project root.
BuildIt now requires an explicit target declaration.

Minimum "esbuild.jsonc" file example:
{
  "targets": {
    "app": {
      "srcdir": "src",
      "distdir": "dist",
      "entryPoints": ["main.tsx"]
    }
  }
}`);
  }

  const result: EsbuildConfigResult = {
    targets: {},
  };

  result.versionPaths = parsed.versionPaths;
  result.forcepackagesversion = parsed.forcepackagesversion;
  result.defineVersionString = parsed.defineVersionString;

  if (parsed.targets && typeof parsed.targets === "object") {
    result.targets = parsed.targets;
  } else {
    throw new Error(`❌ Key "targets" not found in the esbuild configuration file.`);
  }

  return result;
}

```

---

## File: `packages/utils/src/esbuild/engine.ts`

````ts
import { copy, emptyDir, ensureDir, } from "@std/fs";
import { dirname, isAbsolute, join, } from "@std/path";
import { parse as parseJsonc, } from "@std/jsonc";

// ============================================================================
// 📦 TYPES
// ============================================================================
import type {
  DenoBundleGlobalConfig,
  DenoBundleTargetConfig,
  EsbuildOptions,
  EsbuildResult,
  GlobalTargetConfig,
  ParsedArgs,
  ParsedVersion,
  TargetConfig,
} from "../tools/interfaces.ts";

import {
  cleanTarget,
  copyStaticFiles,
  ensureDirForFile,
  listAssetsForCache,
  resolveEntryPoints,
  resolveOutputPaths,
  resolveWithBase,
} from "../tools/paths.ts";

import { validateTargetConfig, } from "../tools/validate.ts";

// ============================================================================
// 🔢 VERSION FUNCTIONS (re-exported from config/version.ts)
// ============================================================================
import {
  updateProjectVersion,
} from "../tools/version.ts";
import { resolveTargetOrder, } from "../tools/targets.ts";
import * as esbuild from "esbuild";
import { denoPlugin, } from "@deno/esbuild-plugin";

/**
 * Injects the Deno Plugin into esbuild options.
 */
export const buildWithDenoPlugin = (
  // deno-lint-ignore no-explicit-any
  options: any,
  denoJsoncPath: string,
  // deno-lint-ignore no-explicit-any
): Promise<any> => {
  options.plugins = [
    ...(options.plugins || []),
    denoPlugin({ configPath: denoJsoncPath, },),
  ];
  return esbuild.build(options,);
};

/**
 * Programmatically executes the esbuild compilation for configured targets.
 *
 * @param opcoes Full execution options (including already parsed configuration)
 * @returns List of results obtained per target
 *
 * @example
 * ```typescript
 * import { esBuild } from "jsr:@vanaware/buildit";
 *
 * await esBuild({
 *   config: {
 *     ui: {
 *       entryPoints: ["packages/ui/src/main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   noversion: true,
 * });
 * ```
 */
export async function esBuild(
  opcoes: EsbuildOptions,
): Promise<EsbuildResult[]> {
  const configs = opcoes.config;
  const baseDir = opcoes.baseDir ?? ".";
  const targets = opcoes.targets;
  const denoJsoncPath = opcoes.denoJsoncPath ?? join(baseDir, "deno.jsonc",);

  const finalVersion = await updateProjectVersion({
    denoJsonPath: denoJsoncPath,
    baseDir,
    noversion: opcoes.noversion ?? false,
    versionPaths: opcoes.versionPaths,
    forcepackagesversion: opcoes.forcepackagesversion,
    defineVersionString: opcoes.defineVersionString,
  },);

  // Strictly ensures that the execution order follows the declaration in the configuration
  const targetsToExecute = resolveTargetOrder(configs, targets,);

  if (targetsToExecute.length === 0) {
    return [];
  }

  const resultados: EsbuildResult[] = [];

  try {
    for (const targetName of targetsToExecute) {
      const targetConfig = configs[targetName];
      if (!targetConfig) {
        console.warn(
          `⚠️ Target '${targetName}' not found in configuration. Skipping.`,
        );
        continue;
      }

      const listFn = targetConfig.defineAssetsString ? listAssetsForCache : undefined;
      const startTime = performance.now();
      await processTarget(
        targetName,
        targetConfig,
        finalVersion,
        (opts,) => buildWithDenoPlugin(opts, denoJsoncPath,),
        listFn,
        baseDir,
        opcoes.defineVersionString,
      );
      const durationMs = Number((performance.now() - startTime).toFixed(0,),);

      resultados.push({
        target: targetName,
        success: true,
        durationMs,
      },);
    }
  } finally {
    // ✨ TERMINATION GUARANTEE: In Deno, the esbuild process (npm) needs to be explicitly stopped
    try {
      await esbuild.stop();
    } catch {
      // Ignore errors in stop()
    }
  }

  return resultados;
}

/**
 * Processes the compilation of an esbuild target.
 * @param targetName Target name
 * @param config Target configuration
 * @param appVersion Application version
 * @param esbuildBuildFn esbuild build function (with plugins injected)
 * @param listAssetsFn Optional function to list assets
 * @param baseDir Project base directory for path resolution
 */
export async function processTarget(
  targetName: string,
  config: TargetConfig,
  appVersion: string,
  // deno-lint-ignore no-explicit-any
  esbuildBuildFn: (options: any,) => Promise<any>,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
  baseDir: string = ".",
  defineVersionString?: string,
): Promise<void> {
  const resolvedConfig: TargetConfig = {
    ...config,
    srcdir: resolveWithBase(config.srcdir, baseDir,),
    distdir: resolveWithBase(config.distdir, baseDir,),
  };

  // 🔥 FAIL-FAST VALIDATION: Check configuration BEFORE any operation
  validateTargetConfig(targetName, resolvedConfig,);

  console.log(`\n${"=".repeat(60,)}`,);
  console.log(`🎯 PROCESSING TARGET: ${targetName.toUpperCase()}`,);
  console.log(`${"=".repeat(60,)}`,);

  if (resolvedConfig.clean) {
    // 🔥 CORRECTION: Only clean if distdir exists
    if (resolvedConfig.distdir) {
      await cleanTarget(resolvedConfig.distdir, resolvedConfig.clean,);
    } else {
      console.warn(
        `⚠️ 'clean' configured but 'distdir' missing. Skipping cleanup.`,
      );
    }
  }

  await copyStaticFiles(
    resolvedConfig,
    appVersion,
    baseDir,
    resolvedConfig.distdir,
  );

  const esbuildOptions = await buildEsbuildOptions(
    targetName,
    resolvedConfig,
    appVersion,
    listAssetsFn,
    defineVersionString,
  );

  console.log(`🔨 Compiling with esbuild...`,);
  const startTime = performance.now();

  try {
    const result = await esbuildBuildFn(esbuildOptions,);
    const duration = (performance.now() - startTime).toFixed(0,);
    console.log(`✅ [${targetName}] Build completed in ${duration}ms`,);

    // 🔥 CORRECTION: Only save metafile if distdir exists
    if (resolvedConfig.metafile && result.metafile && resolvedConfig.distdir) {
      const metafilePath = join(
        resolvedConfig.distdir,
        `${targetName}-metafile.json`,
      );
      await Deno.writeTextFile(
        metafilePath,
        JSON.stringify(result.metafile, null, 2,),
      );
      console.log(`📊 Metafile generated: ${metafilePath}`,);
    }

    // 🔥 ANALYZE REPORT: If requested, print report to console
    if (config.analyze) {
      const analyzeResult = await esbuild.analyzeMetafile(result.metafile, {
        verbose: config.analyze === "verbose",
      });
      console.log(`\n📊 ANALYSIS REPORT [${targetName}]:\n`);
      console.log(analyzeResult);
    }
  } catch (error) {
    if (
      error instanceof TypeError &&
      (error as unknown as { message?: string }).message?.includes("unref",)
    ) {
      console.error(
        `❌ Fatal error in build [${targetName}]: Failed to start esbuild process.`,
      );
      console.error(
        `💡 TIP: esbuild (npm) in Deno requires the '--allow-run' permission.`,
      );
      console.error(
        `👉 Try running 'deno task build' or add '--allow-run' to your command.`,
      );
    } else {
      console.error(`❌ Fatal error in build [${targetName}]:`, error,);
    }
    throw error;
  }
}

// ============================================================================
// 🛠️ ESBUILD FUNCTIONS
// ============================================================================
/**
 * Builds build options for esbuild.
 * @param targetName Target name
 * @param config Target configuration
 * @param appVersion Application version
 * @param listAssetsFn Function to list assets
 * @returns esbuild options
 */
export async function buildEsbuildOptions(
  _targetName: string,
  config: TargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
  defineVersionString?: string,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  // deno-lint-ignore no-explicit-any
  const defineVersionKey = defineVersionString || (config as any).defineVersionString || "__APP_VERSION__";
  const finalDefine: Record<string, string> = {
    ...config.define,
    [defineVersionKey]: JSON.stringify(`v${appVersion}`,),
  };

  // 🔥 ASSETS DEFINES INJECTION: Unified pattern
  if (config.defineAssetsString && config.defineAssetsString.trim() !== "" && listAssetsFn && config.distdir) {
    const assets = await listAssetsFn(config.distdir,);

    finalDefine[config.defineAssetsString] = JSON.stringify(assets,);
    console.log(`📋 ${assets.length} assets listed for define '${config.defineAssetsString}'`,);
  }

  // 🔥 ENTRYPOINTS RESOLUTION (optional srcdir)
  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  // 🔥 OUTPUT PATHS RESOLUTION (outfile relative to distdir)
  const { outfile, outdir, } = resolveOutputPaths(config,);

  // deno-lint-ignore no-explicit-any
  const options: any = {
    entryPoints: resolvedEntryPoints,
  };

  // 🔥 CORRECTION: Use resolved outfile or outdir
  if (outfile) {
    options.outfile = outfile;
  } else if (outdir) {
    options.outdir = outdir;
  }

  const optionalProps = [
    "platform",
    "format",
    "bundle",
    "minify",
    "sourcemap",
    "jsx",
    "jsxImportSource",
    "conditions",
    "external",
    "drop",
    "metafile",
    "write",
    "treeShaking",
    "legalComments",
    "keepNames",
    "splitting",
    "loader",
    "alias",
    "inject",
    "target",
    "charset",
    "logLevel",
    "logLimit",
    "logOverride",
    "entryNames",
    "chunkNames",
    "assetNames",
    "publicPath",
    "pure",
    "globalName",
    "tsconfig",
    "tsconfigRaw",
    "outExtension",
    "supported",
    "sourcesContent",
    "ignoreAnnotations",
    "minifyWhitespace",
    "minifyIdentifiers",
    "minifySyntax",
    "jsxFactory",
    "jsxFragment",
    "analyze",
    "sideEffects",
    "mangleQuoted",
    "mangleCache",
    "plugins",
  ];
  for (const prop of optionalProps) {
    // deno-lint-ignore no-explicit-any
    if ((config as any)[prop] !== undefined) {
      // deno-lint-ignore no-explicit-any
      (options as any)[prop] = (config as any)[prop];
    }
  }

  // 🔥 REQUIREMENT: To use analyze, esbuild needs to generate the metafile
  if (config.analyze) {
    options.metafile = true;
  }

  // 🔥 SPECIAL TREATMENT: mangleProps and reserveProps must be RegExp in JS API
  const regexProps = ["mangleProps", "reserveProps"];
  for (const propName of regexProps) {
    const val = (config as any)[propName];
    if (val !== undefined) {
      if (typeof val === "string") {
        let pattern = val;
        let flags = "";
        if (pattern.startsWith("/") && pattern.lastIndexOf("/") > 0) {
          const lastSlash = pattern.lastIndexOf("/");
          flags = pattern.substring(lastSlash + 1);
          pattern = pattern.substring(1, lastSlash);
        }
        options[propName] = new RegExp(pattern, flags);
      } else {
        options[propName] = val;
      }
    }
  }

  // 🔥 CORRECTION: Secure banner construction with defineVersionKey
  if (config.banner !== undefined) {
    const banner: { js?: string; css?: string } = {};
    if (config.banner.js !== undefined) {
      banner.js = config.banner.js
        .replaceAll("__APP_VERSION__", appVersion,)
        .replaceAll(defineVersionKey, appVersion,);
    }
    if (config.banner.css !== undefined) {
      banner.css = config.banner.css
        .replaceAll("__APP_VERSION__", appVersion,)
        .replaceAll(defineVersionKey, appVersion,);
    }
    if (banner.js !== undefined || banner.css !== undefined) {
      options.banner = banner;
    }
  }

  // 🔥 CORRECTION: Secure footer construction with defineVersionKey
  if (config.footer !== undefined) {
    const footer: { js?: string; css?: string } = {};
    if (config.footer.js !== undefined) {
      footer.js = config.footer.js
        .replaceAll("__APP_VERSION__", appVersion,)
        .replaceAll(defineVersionKey, appVersion,);
    }
    if (config.footer.css !== undefined) {
      footer.css = config.footer.css
        .replaceAll("__APP_VERSION__", appVersion,)
        .replaceAll(defineVersionKey, appVersion,);
    }
    if (footer.js !== undefined || footer.css !== undefined) {
      options.footer = footer;
    }
  }

  options.define = finalDefine;
  return options;
}

````

---

## File: `packages/utils/src/esbuild/mod.ts`

````ts
/**
 * @module @vanaware/buildit/esbuild
 * @description Build and bundle orchestrator with native esbuild and `@deno/esbuild-plugin`.
 *
 * @example
 * ```typescript
 * import { esBuild } from "jsr:@vanaware/buildit";
 *
 * await esBuild({
 *   config: {
 *     app: {
 *       entryPoints: ["main.ts"],
 *       distdir: "dist",
 *     },
 *   },
 *   noversion: true,
 * });
 * ```
 */

// ============================================================================
// 📦 SPECIFIC MODULE RE-EXPORTS
// ============================================================================
export { esBuild, } from "./engine.ts";

export { 
  ESBUILD_CONFIG_EXAMPLE as esbuildExample,
  loadEsbuildConfig
 } from "./config.ts";

export type {
  EsbuildGlobalConfig,
  EsbuildOptions,
  EsbuildResult,
  EsbuildTargetConfig,
} from "../tools/interfaces.ts";

````

---

## File: `packages/utils/src/export/cli.ts`

```ts
/**
 * @module @vanaware/buildit/export/cli
 * @description Entry point for executing the context exporter via command line (CLI).
 */
import { readProjectVersion, } from "../tools/version.ts";
import { exportEngine, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";
import { loadExportConfig, } from "./config.ts";
import { Command, } from "@cliffy/command";

/**
 * Executes the context exporter CLI from command line arguments.
 */
export function exportCli(): Command<any> {
  return new Command()
    .name("export",)
    .description("BuildIt Context Exporter",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Configuration file", {
      env: { prefix: "EXPORT_", },
    },)
    .option("-b, --base-dir [dir:string]", "Base Directory", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Deno Configuration", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .arguments("[modes...:string]", ["Export modes",],)
    .action(async function (options, ...args): Promise<void> {
      const startTime = performance.now();
      const baseDir = (options.baseDir as string) || ".";
      const configResult = await loadExportConfig(
        options.appConfig as string,
        baseDir,
      );
      const modes = args.length > 0 ? (args as string[]) : undefined;

      console.log("\n🚀 Starting BuildIt Context Export",);
      try {
        await exportEngine({
          config: configResult.modes,
          modes: modes,
          baseDir,
          defineVersionString: configResult.defineVersionString,
          appVersion: await readProjectVersion(
            options.denoConfig as string,
            baseDir,
          ),
          denoJsoncPath: options.denoConfig as string,
        },);

        const elapsed = (performance.now() - startTime).toFixed(0,);
        console.log(`\n${"=".repeat(60,)}`,);
        console.log(`🎉 EXPORT COMPLETED SUCCESSFULLY!`,);
        console.log(`⏱️ Total time: ${elapsed}ms`,);
        console.log(`${"=".repeat(60,)}\n`,);
      } catch (error) {
        console.error("\n🛑 Export pipeline failed:", error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = exportCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `packages/utils/src/export/config.ts`

```ts
/**
 * @module @vanaware/buildit/export/config
 * @description Loading external configurations from `export.jsonc`.
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type { ExportConfig, ExportConfigFile, ExportConfigResult, } from "../tools/interfaces.ts";

/**
 * Example with BuildIt export mode configurations.
 */
export const EXPORT_CONFIG_EXAMPLE: Record<string, ExportConfig> = {
  ui: {
    outputFile: "snapshots/ui.md",
    includes: [
      "packages/ui/{src,public,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,manifest,json,jsonc,md}",
      "packages/ui/{build.ts,deno.json,deno.jsonc,readme.md}",
    ],
    excludes: [
      "**/node_modules/**",
      "**/.git/**",
    ],
    includeVersion: true,
    customInstruction:
      "The text below contains the main SOURCE CODE files for the example application (UI).",
    default: true,
  },
  docs: {
    outputFile: "snapshots/docs.md",
    includes: [
      "docs/**/*.{md,txt}",
      "{readme.md,readme,license,license.md,license.txt,.tool-versions}",
    ],
    excludes: [],
    includeVersion: false,
    customInstruction:
      "The text below contains the DOCUMENTATION and architectural guidelines of the project.",
    default: false,
  },
};

/**
 * Loads the export configuration from an external JSONC file
 * (e.g., `export.jsonc` or `export.json`).
 *
 * If the file is not found, execution is interrupted with an example message.
 *
 * @param configPath Optional path to the configuration file
 * @param baseDir Base directory for relative file resolution
 * @returns Loaded export configurations with modes and global options
 */
export async function loadExportConfig(
  configPath?: string,
  baseDir: string = ".",
): Promise<ExportConfigResult> {
  const parsed = await loadConfig<ExportConfigFile>(
    "export",
    configPath,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Configuration file "export.jsonc" not found in the project root.
BuildIt now requires an explicit declaration of export modes.

Minimum "export.jsonc" file example:
{
  "modes": {
    "src": {
      "outputFile": "snapshots/src.md",
      "includes": ["src/**/*.ts"]
    }
  }
}`);
  }

  if (
    "modes" in parsed &&
    typeof (parsed as ExportConfigFile).modes === "object"
  ) {
    const rootProject = (parsed as ExportConfigFile).project;
    const rootHeader = (parsed as ExportConfigFile).header;
    const rootDefineVersionString = (parsed as ExportConfigFile).defineVersionString;
    const modes = (parsed as ExportConfigFile).modes;

    if (rootProject !== undefined || rootHeader !== undefined) {
      for (const [modeKey, modeConfig,] of Object.entries(modes,)) {
        modes[modeKey] = {
          ...(rootProject !== undefined && modeConfig.project === undefined
            ? { project: rootProject, }
            : {}),
          ...(rootHeader !== undefined &&
              modeConfig.header === undefined
            ? { header: rootHeader, }
            : {}),
          ...modeConfig,
        };
      }
    }

    return {
      modes: modes,
      project: rootProject,
      header: rootHeader,
      defineVersionString: rootDefineVersionString,
    };
  }

  throw new Error(`❌ Key "modes" not found in the export configuration file.`);
}

```

---

## File: `packages/utils/src/export/engine.ts`

````ts
/**
 * @module @vanaware/buildit/export/engine
 * @description Optimized directory scanning mechanism (expandGlob), filtering, and streaming of Markdown snapshots.
 */

import { expandGlob, } from "@std/fs";
import { join, relative, } from "@std/path";
import { readProjectVersion, } from "../tools/version.ts";
import {
  matchesGlobs,
  formatMarkdownFile,
  generateHeader,
  normalizePath,
} from "./formatter.ts";
import { ensureDirForFile, } from "../tools/paths.ts";
import { resolveTargetOrder, } from "../tools/targets.ts";
import type {
  ExportConfig,
  ExportOptions,
  ExportResult,
} from "../tools/interfaces.ts";

/**
 * Collects an ordered and deduplicated list of files to be included in the snapshot.
 * Uses `expandGlob` for direct optimized scanning.
 *
 * @param config Export mode configuration
 * @param baseDir Project base directory
 * @returns Array of alphabetically sorted relative paths
 */
export async function collectFilesForExport(
  config: ExportConfig,
  baseDir: string = ".",
): Promise<string[]> {
  const foundFiles = new Set<string>();

  // 🌟 MODERN MODE: Direct use of expandGlob with native brace expansion support
  if (config.includes && config.includes.length > 0) {
    for (const pattern of config.includes) {
      try {
        for await (
          const entry of expandGlob(pattern, {
            root: baseDir,
            exclude: config.excludes,
            includeDirs: false,
          },)
        ) {
          const relativePath = relative(baseDir, entry.path,).replace(
            /\\/g,
            "/",
          );
          const normalizedPath = normalizePath(relativePath,);

          // Anti-loop protection
          if (
            normalizedPath.startsWith("exports/",) ||
            normalizedPath.startsWith("snapshots/",)
          ) {
            continue;
          }

          // Extra verification of excludes
          if (config.excludes && config.excludes.length > 0) {
            if (matchesGlobs(relativePath, config.excludes,)) {
              continue;
            }
          }

          foundFiles.add(relativePath,);
        }
      } catch {
        // Ignore patterns that find no paths or have invalid syntax
      }
    }
  }

  return Array.from(foundFiles,).sort();
}

/**
 * Executes the export process for a single configured mode using disk writing streaming.
 *
 * @param mode Mode identifier name (e.g., "ui")
 * @param config Mode configuration object
 * @param options Additional execution options (version, base directory, logs)
 * @returns Detailed result containing file count and bytes written
 *
 * @example
 * ```typescript
 * const result = await exportMode("ui", config, { appVersion: "0.3.1" });
 * console.log(`Exported ${result.files} files to ${result.outputFile}`);
 * ```
 */
export async function exportMode(
  mode: string,
  config: ExportConfig,
  options?: {
    appVersion?: string;
    baseDir?: string;
    silent?: boolean;
    denoJsoncPath?: string;
    defineVersionString?: string;
  },
): Promise<ExportResult> {
  const baseDir = options?.baseDir ?? ".";
  const appVersion = options?.appVersion ??
    await readProjectVersion(options?.denoJsoncPath, baseDir,);
  const silent = options?.silent ?? false;
  const defineVersionString = options?.defineVersionString ?? "__APP_VERSION__";
  const versionDisplay = config.includeVersion ? `[v${appVersion}] ` : "";

  if (!silent) {
    console.log(`\n${"=".repeat(60,)}`,);
    console.log(`📦 EXPORTING MODE: ${mode.toUpperCase()} ${versionDisplay}`,);
    console.log(`${"=".repeat(60,)}`,);
    console.log(`📄 Output file: ${config.outputFile}`,);
    if (config.includes) {
      console.log(`🎯 Inclusion patterns: ${config.includes.join(", ",)}`,);
    }
  }

  // 1. Collect files in an optimized way via expandGlob
  const filesToProcess = await collectFilesForExport(
    config,
    baseDir,
  );

  // 2. Ensure destination directory exists before writing
  const outputPath = join(baseDir, config.outputFile,);
  await ensureDirForFile(outputPath,);

  // 3. Initialize disk writing stream (O(1) memory usage)
  const file = await Deno.open(outputPath, {
    write: true,
    create: true,
    truncate: true,
  },);
  const writer = file.writable.getWriter();
  const encoder = new TextEncoder();

  let bytesWritten = 0;
  let includedFiles = 0;

  try {
    // Write header
    const header = generateHeader(config, mode, appVersion, defineVersionString,);
    const headerChunk = encoder.encode(header,);
    await writer.write(headerChunk,);
    bytesWritten += headerChunk.byteLength;

    // Process and write each file individually in the stream
    for (const relativePath of filesToProcess) {
      try {
        const fullPath = join(baseDir, relativePath,);
        const fileContent = await Deno.readTextFile(fullPath,);
        const markdownBlock = formatMarkdownFile(
          relativePath,
          fileContent,
        );
        const blockChunk = encoder.encode(markdownBlock,);

        await writer.write(blockChunk,);
        bytesWritten += blockChunk.byteLength;
        includedFiles++;

        if (!silent) {
          console.log(`   ✅ Included: ${relativePath}`,);
        }
      } catch (error) {
        if (!silent && error instanceof Error) {
          console.error(`   ❌ Error reading ${relativePath}:`, error.message,);
        }
      }
    }
  } finally {
    await writer.close();
  }

  if (!silent) {
    console.log(
      `\n✨ Mode ${mode.toUpperCase()} completed: ${includedFiles} files exported to ${config.outputFile} (${bytesWritten} bytes)`,
    );
  }

  return {
    mode,
    files: includedFiles,
    outputFile: config.outputFile,
    bytes: bytesWritten,
  };
}

/**
 * Programmatically executes the full export flow with support for multiple modes.
 * Accepts a mode configuration object directly in memory or an ExportOptions object.
 *
 * @param options Full execution options
 * @returns List of results obtained for each processed mode
 *
 * @example
 * ```typescript
 * // Passing configuration directly in memory:
 * const results = await exportEngine({
 *   config: {
 *     ui: { outputFile: "snapshots/ui.md", includes: ["packages/ui/src/*.ts"] }
 *   }
 * });
 * ```
 */
export async function exportEngine(
  options: ExportOptions,
): Promise<ExportResult[]> {
  const configs = options.config;
  const baseDir = options.baseDir ?? ".";
  const modesToExecute = resolveTargetOrder(configs, options.modes,);

  const appVersion = options.appVersion ??
    await readProjectVersion(options.denoJsoncPath, baseDir,);

  const results: ExportResult[] = [];

  for (const mode of modesToExecute) {
    const config = configs[mode];
    if (config) {
      const res = await exportMode(mode, config, {
        baseDir,
        appVersion: appVersion,
        silent: options.silent,
        denoJsoncPath: options.denoJsoncPath,
        defineVersionString: options.defineVersionString,
      },);
      results.push(res,);
    }
  }

  return results;
}

````

---

## File: `packages/utils/src/export/formatter.ts`

`````ts
/**
 * @module @vanaware/buildit/export/formatter
 * @description Pure utility functions for path normalization, extension mapping,
 * glob pattern evaluation, and Markdown formatting with backtick protection.
 */

import { globToRegExp, } from "@std/path";
import type { ExportConfig, } from "../tools/interfaces.ts";

/**
 * Normalizes a file path for consistent comparison across operating systems.
 * - Converts Windows backslashes (\) to forward slashes (/)
 * - Converts all characters to lowercase
 *
 * @param path Relative or absolute path to be normalized
 * @returns Lowercase normalized path with forward slashes
 *
 * @example
 * ```typescript
 * normalizePath("src\\components\\App.tsx"); // "src/components/app.tsx"
 * ```
 */
export function normalizePath(path: string,): string {
  return path.replace(/\\/g, "/",).toLowerCase();
}

/**
 * Calculates the minimum number of backticks required to wrap text
 * in a markdown code block, avoiding conflicts when the content itself
 * contains consecutive backticks.
 *
 * @param text File text content
 * @returns String containing 3 or more backticks (e.g., "```", "````")
 *
 * @example
 * ```typescript
 * calculateBacktickWrapper("console.log('hi');"); // "```"
 * calculateBacktickWrapper("```markdown```"); // "````"
 * ```
 */
export function calculateBacktickWrapper(text: string,): string {
  const matches = text.match(/`+/g,);
  if (!matches) return "```";
  const largestSequence = Math.max(...matches.map((m,) => m.length),);
  const requiredSize = Math.max(3, largestSequence + 1,);
  return "`".repeat(requiredSize,);
}

/**
 * Maps file extensions to the corresponding Markdown syntax highlight language.
 *
 * @param relativePath Relative file path
 * @returns Language name for Markdown code block (e.g., "json", "bash")
 *
 * @example
 * ```typescript
 * mapExtension("deno.jsonc"); // "json"
 * mapExtension("script.sh"); // "bash"
 * ```
 */
export function mapExtension(relativePath: string,): string {
  const ext = relativePath.split(".",).pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    manifest: "json",
    jsonc: "json",
    yml: "yaml",
    sh: "bash",
    env: "properties",
  };

  if (relativePath.includes(".env",)) return "properties";

  return map[ext] || ext;
}

/**
 * Tests if a path matches any of the provided glob patterns.
 *
 * @param path Normalized relative path to be tested
 * @param patterns List of glob patterns (supports brace expansion and globstar)
 * @returns True if the path matches at least one pattern
 */
export function matchesGlobs(path: string, patterns: string[],): boolean {
  const normalizedPath = path.replace(/\\/g, "/",);
  for (const pattern of patterns) {
    try {
      const reg = globToRegExp(pattern, {
        globstar: true,
        caseInsensitive: true,
      },);
      if (reg.test(normalizedPath,) || reg.test(path,)) {
        return true;
      }
    } catch {
      // Ignore invalid pattern
    }
  }
  return false;
}

/**
 * Determines if a given file should be included in the snapshot based on mode configuration.
 * Uses `includes` / `excludes` (globs) syntax.
 *
 * Applied Rules:
 * 1. Anti-loop protection: always excludes files inside `exports/` or `snapshots/` folders.
 * 2. If it matches any `excludes` pattern, returns `false`.
 * 3. If it matches any `includes` pattern, returns `true`.
 *
 * @param relativePath Relative file path in the repository
 * @param config Export mode configuration
 * @returns True if the file should be added to the snapshot, false otherwise
 *
 * @example
 * ```typescript
 * shouldIncludeFile("packages/ui/src/main.tsx", config); // true
 * ```
 */
export function shouldIncludeFile(
  relativePath: string,
  config: ExportConfig,
): boolean {
  const normalizedPath = normalizePath(relativePath,);

  // 🔒 Anti-loop protection: never includes generated export files
  if (
    normalizedPath.startsWith("exports/",) ||
    normalizedPath.startsWith("snapshots/",)
  ) {
    return false;
  }

  // 🌟 MODERN MODE: `includes` and `excludes` patterns (globs with brace expansion)
  if (config.excludes && config.excludes.length > 0) {
    if (matchesGlobs(relativePath, config.excludes,)) {
      return false;
    }
  }

  if (config.includes && config.includes.length > 0) {
    return matchesGlobs(relativePath, config.includes,);
  }

  return false;
}

/**
 * Generates the structured header for the Markdown snapshot containing metadata and AI guidelines.
 *
 * @param config Mode configuration
 * @param mode Mode identifier name
 * @param appVersion Current project semantic version
 * @param defineVersionString Constant identifier for version replacement (default: "__APP_VERSION__")
 * @returns Formatted Markdown header
 *
 * @example
 * ```typescript
 * const header = generateHeader(config, "ui", "0.3.1", "__APP_VERSION__");
 * ```
 */
export function generateHeader(
  config: ExportConfig,
  mode: string,
  appVersion: string,
  defineVersionString: string = "__APP_VERSION__",
): string {
  const versionDisplay = config.includeVersion ? `[v${appVersion}] ` : "";
  const targetDefine = defineVersionString || "__APP_VERSION__";

  const instruction = (config.customInstruction ?? "Project context.")
    .replaceAll(targetDefine, appVersion,);

  const project = config.project ?? "BuildIt";

  const defaultHeader =
    `> Each file starts with a title indicating its exact relative path (e.g., \`## File: src/main.ts\`).\n> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.`;

  const header = (config.header ?? defaultHeader).trim()
    .replaceAll(targetDefine, appVersion,);

  return `> **AI INSTRUCTION:** 
> ${instruction}
${header}

---

# Exported Context from Project ${project} ${versionDisplay}- Mode: ${mode.toUpperCase()}

Automatically generated at: ${new Date().toISOString()}

---

`;
}

/**
 * Formats an individual file with a relative path and secure Markdown code block.
 *
 * @param relativePath Relative path of the file to display
 * @param content Original file text content
 * @returns Formatted Markdown code block with separator
 *
 * @example
 * ```typescript
 * formatMarkdownFile("src/index.ts", "console.log('hi');");
 * ```
 */
export function formatMarkdownFile(
  relativePath: string,
  content: string,
): string {
  const markdownExtension = mapExtension(relativePath,);
  const backtickWrapper = calculateBacktickWrapper(content,);

  let result = `## File: \`${relativePath}\`\n\n`;
  result += `${backtickWrapper}${markdownExtension}\n`;
  result += content;
  result += `\n${backtickWrapper}\n\n---\n\n`;

  return result;
}

`````

---

## File: `packages/utils/src/export/mod.ts`

````ts
/**
 * @module @vanaware/buildit/export
 * @description Tool and library for structured consolidation of source code
 * and project documentation into Markdown snapshots optimized for AI consumption.
 *
 * Supports external declarative configuration via `export.jsonc`, extension filters,
 * anti-loop protection, and execution via CLI or programmatically.
 *
 * @example
 * ```typescript
 * import { exportEngine } from "jsr:@vanaware/buildit";
 *
 * const results = await exportEngine({
 *   config: {
 *     ui: {
 *       outputFile: "snapshots/ui.md",
 *       includes: ["src/**\/*"],
 *     },
 *   },
 *   modes: ["ui", "docs"],
 * });
 * ```
 */

export { exportEngine, } from "./engine.ts";

export { 
  EXPORT_CONFIG_EXAMPLE as exportExample,
  loadExportConfig
 } from "./config.ts";

export type {
  ExportConfig,
  ExportOptions,
  ExportResult,
} from "../tools/interfaces.ts";

````

---

## File: `packages/utils/src/mod.ts`

````ts
/**
 * @module @vanaware/buildit
 * @description TypeScript utility suite for build orchestration (esbuild and Deno.bundle),
 * continuous development (watch), AI context export, and SemVer automation.
 *
 * All programmatic engines and utilities are exported directly from this root module:
 *
 * @example
 * ```typescript
 * // @ts-nocheck
 * import { esBuild, watchEngine, denoBuild, exportEngine } from "jsr:@vanaware/buildit";
 *
 * // Run production compilation with esbuild
 * await esBuild({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   noversion: true,
 * });
 *
 * // Start continuous watch with esbuild.context and concurrency lock
 * const handles = await watchEngine({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   target: "ui",
 * });
 *
 * // Generate AI context snapshot for LLMs
 * await exportEngine({
 *   config: {
 *     ui: {
 *       outputFile: "snapshots/ui.md",
 *       includes: ["src/main.ts"],
 *     },
 *   },
 * });
 * ```
 */

export * from "./tools/mod.ts";

export { APP_VERSION as version, } from "./version.ts";

export * from "./version/sanitize/mod.ts";
export * from "./denobuild/mod.ts";
export * from "./export/mod.ts";
export * from "./watch/mod.ts";
export * from "./esbuild/mod.ts";
export * from "./version/tag/mod.ts";

````

---

## File: `packages/utils/src/tools/cli-flags.ts`

```ts
import type { ParsedArgs, } from "./interfaces.ts";

// ============================================================================
// 🎯 CLI ARGUMENTS PARSING (pure, testable)
// ============================================================================
/**
 * Parses command line arguments by extracting the requested targets and detecting the 'noversion' flag.
 * Final target resolution and default handling is performed by the engine via `resolveTargetOrder`.
 *
 * @param args List of arguments received via command line
 * @param options CLI options (e.g., { noversion?: boolean })
 * @returns Parsed arguments containing informed targets and globalNoVersion flag
 */
export function parseArgs(
  args: string[],
  options?: { noversion?: boolean },
): ParsedArgs {
  const lowerArgs = args.map((a,) => a.toLowerCase());
  const hasNoVersionInArgs = lowerArgs.includes("noversion",);
  const hasNoVersionInOptions = Boolean(options?.noversion,);
  const globalNoVersion = hasNoVersionInArgs || hasNoVersionInOptions;
  const rawTargets = args.filter((arg,) => arg.toLowerCase() !== "noversion");

  return { targets: rawTargets, globalNoVersion, };
}

```

---

## File: `packages/utils/src/tools/git.ts`

````ts
/**
 * @module @vanaware/buildit/tools/git
 * @description Utilities for executing git commands.
 */

/**
 * Interface for the result of a git command execution.
 */
export interface GitResult {
  success: boolean;
  code: number;
  stdout: string;
  stderr: string;
}

/**
 * Executes a git command capturing stdout, stderr and exit code.
 *
 * @param args Git command arguments
 * @param cwd Working directory (optional)
 * @returns Promise with the execution result
 *
 * @example
 * ```typescript
 * const res = await runGit(["status"]);
 * if (res.success) console.log(res.stdout);
 * ```
 */
export async function runGit(
  args: string[],
  cwd?: string,
): Promise<GitResult> {
  try {
    const cmd = new Deno.Command("git", {
      args,
      cwd,
      stdout: "piped",
      stderr: "piped",
    },);
    const output = await cmd.output();
    const decoder = new TextDecoder();
    return {
      success: output.success,
      code: output.code,
      stdout: decoder.decode(output.stdout,).trim(),
      stderr: decoder.decode(output.stderr,).trim(),
    };
  } catch (error) {
    return {
      success: false,
      code: 1,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error,),
    };
  }
}

````

---

## File: `packages/utils/src/tools/interfaces.ts`

```ts
/**
 * Example file extensions that can be included in snapshots.
 */
export const EXTENSIONS_EXAMPLE: string[] = [
  ".tsx",
  ".jsx",
  ".js",
  ".ts",
  ".css",
  ".html",
  ".manifest",
  ".map",
  ".sh",
  ".py",
  ".json",
  ".jsonc",
  ".yaml",
  ".yml",
  ".toml",
  ".env.example",
  ".md",
];

/** Parsed semantic version. */
export interface ParsedVersion {
  /** Major version component. */
  major: number;
  /** Minor version component. */
  minor: number;
  /** Patch version component. */
  patch: number;
}

/** Parsed command line arguments. */
export interface ParsedArgs {
  /** Target identifiers specified on the command line. */
  targets: string[];
  /** Whether the --noversion or noversion positional flag was set. */
  globalNoVersion: boolean;
}

/** Target platform for esbuild compilation. */
export type EsbuildPlatform = "browser" | "node" | "neutral";
/** Output format for esbuild bundle. */
export type EsbuildFormat = "esm" | "iife" | "cjs";
/** Sourcemap generation strategy for esbuild. */
export type EsbuildSourcemap = boolean | "linked" | "inline" | "external";
/** JSX transformation mode for esbuild. */
export type EsbuildJsx = "automatic" | "transform" | "preserve";
/** Legal comments handling strategy for esbuild. */
export type EsbuildLegalComments =
  | "none"
  | "inline"
  | "eof"
  | "linked"
  | "external";
/** Drop directives for eliminating debug statements in esbuild. */
export type EsbuildDrop = "console" | "debugger";
/** Output character set encoding for esbuild. */
export type EsbuildCharset = "ascii" | "utf8";
/** Log level severity for esbuild console output. */
export type EsbuildLogLevel =
  | "verbose"
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "silent";
/** File loader types supported by esbuild. */
export type EsbuildLoader =
  | "js"
  | "jsx"
  | "ts"
  | "tsx"
  | "css"
  | "json"
  | "text"
  | "base64"
  | "dataurl"
  | "file"
  | "binary"
  | "empty"
  | "copy";

/** Configuration for a set of static files to be copied. */
export interface CopyFileConfig {
  /**
   * Optional base directory. If provided, paths in includes and excludes
   * are relative to this directory and the folder structure is preserved in the destination.
   * If not provided, files are copied directly to the root distdir.
   */
  basedir?: string;
  /** Glob patterns for inclusion (e.g., ["**\/*.html", "assets\/**\/*"]). */
  includes?: string[];
  /** Glob patterns for exclusion. */
  excludes?: string[];
}

/** Configuration for pre-build cleanup of files and folders in the output directory. */
export interface CleanConfig {
  /** Glob patterns of files/folders to remove. Use ["*"] to clean everything. */
  includes?: string[];
  /** Glob patterns to preserve during cleanup. */
  excludes?: string[];
}

/** Configuration for a build target (esbuild). */
export interface TargetConfig {
  /** Base directory for sources (default: "."). */
  srcdir?: string;
  /** Final output directory (default: "."). */
  distdir?: string;
  /**
   * Pre-build cleanup rules.
   * Can be a { includes, excludes } object or a simple array of globs.
   */
  clean?: CleanConfig | string[];
  /** List of rule sets for copying static files. */
  copyFiles?: CopyFileConfig[];
  /** Whether it should be executed automatically when no target is passed via CLI. */
  default?: boolean;
  /** Entry point files relative to srcdir. */
  entryPoints: string[];
  /** Target platform (browser, node or neutral). */
  platform?: EsbuildPlatform;
  /** Output format (esm, iife or cjs). */
  format?: EsbuildFormat;
  /** Whether to bundle dependencies into a single file. */
  bundle?: boolean;
  /** Whether to minify the code. */
  minify?: boolean;
  /** Sourcemap strategy. */
  sourcemap?: EsbuildSourcemap;
  /** JSX transformation (automatic, transform or preserve). */
  jsx?: EsbuildJsx;
  /** Runtime package for automatic JSX (e.g., "preact"). */
  jsxImportSource?: string;
  /** Export resolution conditions. */
  conditions?: string[];
  /** Global constants injection (e.g., { "DEBUG": "true" }). */
  define?: Record<string, string>;
  /** Identifier of the constant for injecting the list of generated assets (e.g., "__GENERATED_ASSETS__"). If omitted or empty, does not inject. */
  defineAssetsString?: string;
  /** Directives for removing calls to console or debugger. */
  drop?: EsbuildDrop[];
  /** Modules or packages to be treated as external during bundling. */
  external?: string[];
  /** Whether to generate a JSON metadata file with bundle analysis. */
  metafile?: boolean;
  /** Whether esbuild writes the bundle output directly to the filesystem. */
  write?: boolean;
  /** Whether dead code elimination is enabled. Accepts 'ignore' to explicitly disable. */
  treeShaking?: boolean | "ignore";
  /** Custom JSX factory (e.g., "h", "React.createElement"). */
  jsxFactory?: string;
  /** Custom JSX fragment (e.g., "Fragment", "React.Fragment"). */
  jsxFragment?: string;
  /** Generates an analytical bundle report in the console after build. */
  analyze?: boolean | "verbose";
  /** Regular expression for properties to be preserved during mangling (e.g., "/^_.+/"). */
  reserveProps?: string;
  /** Informs esbuild if the code should be treated as having side effects for tree-shaking purposes. */
  sideEffects?: boolean;
  /** Preservation and positioning of license and copyright comments. */
  legalComments?: EsbuildLegalComments;
  /** Preserves original function and class names even when minified. */
  keepNames?: boolean;
  /** Path of the consolidated output file (relative to distdir when provided). */
  outfile?: string;
  /** Enables code splitting for dynamic loading in ESM. */
  splitting?: boolean;
  /** Mapping of loaders by file extension. */
  loader?: Record<string, EsbuildLoader>;
  /** Module aliases or import paths. */
  alias?: Record<string, string>;
  /** Files to inject at the top of the bundle before entry points. */
  inject?: string[];
  /** Comments or code snippets added at the beginning of the generated file. Supports __APP_VERSION__. */
  banner?: { js?: string; css?: string };
  /** Comments or code snippets added at the end of the generated file. Supports __APP_VERSION__. */
  footer?: { js?: string; css?: string };
  /** Target JavaScript/ECMAScript environment (e.g., 'es2022', 'chrome100', 'esnext'). */
  target?: string | string[];
  /** Character set of the generated files. */
  charset?: EsbuildCharset;
  /** Detail level of logs generated by esbuild. */
  logLevel?: EsbuildLogLevel;
  /** Maximum limit of log messages. */
  logLimit?: number;
  /** Log level override by message identifier. */
  logOverride?: Record<string, EsbuildLogLevel>;
  /** Name pattern for input files. */
  entryNames?: string;
  /** Name pattern for generated chunks. */
  chunkNames?: string;
  /** Name pattern for generated assets. */
  assetNames?: string;
  /** Base public path for loading chunks and assets. */
  publicPath?: string;
  /** Identifiers treated as pure for removal if not used (e.g., ['console.log']). */
  pure?: string[];
  /** Global variable name for exposing the bundle in IIFE format. */
  globalName?: string;
  /** Path to a custom TypeScript configuration file (tsconfig.json). */
  tsconfig?: string;
  /** Raw TypeScript configuration content (JSON string or object). */
  tsconfigRaw?: string | Record<string, unknown>;
  /** Mapping of output extensions (e.g., { ".js": ".mjs" }). */
  outExtension?: Record<string, string>;
  /** Defines explicit support for language features (e.g., { "dynamic-import": false }). */
  supported?: Record<string, boolean>;
  /** Whether to include original source file content within sourcemaps. */
  sourcesContent?: boolean;
  /** Whether to ignore purity annotations like "@__PURE__" during minification. */
  ignoreAnnotations?: boolean;
  /** Granular minification: removes extra whitespace. */
  minifyWhitespace?: boolean;
  /** Granular minification: renames identifiers to short names. */
  minifyIdentifiers?: boolean;
  /** Granular minification: rewrites syntax into more compact forms. */
  minifySyntax?: boolean;
  /** Regular expression for mangling of object properties (e.g., "/^_.+/"). */
  mangleProps?: string;
  /** Whether to apply mangling to object properties that are quoted. */
  mangleQuoted?: boolean;
  /** Cache for persistence of mangling names between builds. */
  mangleCache?: Record<string, string | false>;
  /** List of custom esbuild plugins. */
  plugins?: unknown[];
}

/** Dictionary mapping target names to their build configuration. */
export interface GlobalTargetConfig {
  /** Build configuration indexed by target name. */
  [targetName: string]: TargetConfig;
}

/** Alias for TargetConfig for esbuild builds. */
export type EsbuildTargetConfig = TargetConfig;
/** Alias for GlobalTargetConfig for esbuild builds. */
export type EsbuildGlobalConfig = GlobalTargetConfig;

/** Programmatic options for executing esbuild builds. */
export interface EsbuildOptions {
  /** Target configurations dictionary. */
  config: GlobalTargetConfig;
  /** Subset of targets to build. If omitted, builds default targets. */
  targets?: string[];
  /** If true, skips reading or updating project versions. */
  noversion?: boolean;
  /** Paths to version files to ensure before build. */
  versionPaths?: string[];
  /** Whether to enforce package versions in workspace packages. */
  forcepackagesversion?: boolean;
  /** Global define variable name for application version (e.g., "__APP_VERSION__"). */
  defineVersionString?: string;
  /** Project base directory. */
  baseDir?: string;
  /** Path to root deno.jsonc file. */
  denoJsoncPath?: string;
  /** If true, suppresses console output. */
  silent?: boolean;
}

/** Target configuration extended with watch-specific settings. */
export interface WatchTargetConfig extends TargetConfig {
  /** If enabled, watch also monitors the configuration file for automatic reloading (not implemented). */
  watchConfig?: boolean;
}

/** Dictionary mapping target names to their watch target configuration. */
export interface WatchGlobalConfig {
  /** Watch target configuration indexed by target name. */
  [targetName: string]: WatchTargetConfig;
}

/** Raw watch configuration file (watch.jsonc). */
export interface WatchConfigFile {
  /** Optional JSON schema URI. */
  $schema?: string;
  /** Dictionary of watch targets. */
  targets?: WatchGlobalConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
  /** Additional custom options. */
  [key: string]: unknown;
}

/** Result of loading watch configuration file. */
export interface WatchConfigResult {
  /** Dictionary of loaded watch targets. */
  targets: WatchGlobalConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
}

/** Programmatic options for running continuous watch. */
export interface WatchOptions {
  /** Watch target configurations dictionary. */
  config: WatchGlobalConfig;
  /** Specific target to watch. */
  target?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Project base directory. */
  baseDir?: string;
  /** Custom path to the concurrency lock file. */
  lockFile?: string;
  /** Path to root deno.jsonc file. */
  denoJsoncPath?: string;
  /** If true, suppresses console output. */
  silent?: boolean;
}

/** Handle to an active watch process for clean termination. */
export interface WatchHandle {
  /** Name of the watched target. */
  target: string;
  /** Closes and cleans up the active watch watcher and concurrency lock. */
  close: () => Promise<void>;
}

/** Configuration for a snapshot export mode. */
export interface ExportConfig {
  /** Path of the generated Markdown output file. */
  outputFile: string;
  /** Glob patterns of files to be included. */
  includes?: string[];
  /** Glob patterns of files to be excluded. */
  excludes?: string[];
  /** Whether to include the application version in the header. */
  includeVersion?: boolean;
  /** Custom instruction for the AI. */
  customInstruction?: string;
  /** Custom text or instructions for the AI header block. */
  header?: string;
  /** Project name displayed in the header (default: "BuildIt"). */
  project?: string;
  /** Whether the mode should be executed by default when no mode is specified. */
  default?: boolean;
}

/** Target execution platform for Deno native bundle. */
export type DenoBundlePlatform = "browser" | "deno";
/** Output format for Deno native bundle. */
export type DenoBundleFormat = "esm" | "cjs" | "iife";
/** Sourcemap generation strategy for Deno native bundle. */
export type DenoBundleSourceMap = "linked" | "inline" | "external";
/** External package handling mode for Deno native bundle. */
export type DenoBundlePackageHandling = "bundle" | "external";

/** Configuration options for a Deno native bundle target. */
export interface DenoBundleTargetConfig {
  /** Base directory for sources (default: "."). */
  srcdir?: string;
  /** Final output directory (default: "."). */
  distdir?: string;
  /** Pre-build cleanup rules. */
  clean?: CleanConfig | string[];
  /** List of rule sets for copying static files. */
  copyFiles?: CopyFileConfig[];
  /** Whether it should be executed automatically when no target is passed via CLI. */
  default?: boolean;
  /** TypeScript, JavaScript, or HTML entry points to be bundled. */
  entryPoints: string[];
  /** Bundle output format (default: "esm"). */
  format?: DenoBundleFormat;
  /** Target execution platform (default: "browser"). */
  platform?: DenoBundlePlatform;
  /** Whether to minify the generated code. */
  minify?: boolean;
  /** Whether to preserve original function and class names. */
  keepNames?: boolean;
  /** Sourcemap generation strategy. */
  sourcemap?: DenoBundleSourceMap;
  /** Enables code splitting into multiple files. */
  codeSplitting?: boolean;
  /** Whether to inline dynamic imports directly into the bundle. */
  inlineImports?: boolean;
  /** How to handle external packages (default: "bundle"). */
  packages?: DenoBundlePackageHandling;
  /** List of modules to be treated as external. */
  external?: string[];
  /** Mapping of constants replaced in memory after build. */
  define?: Record<string, string>;
  /** Identifier of the constant for injecting the list of generated assets (e.g., "__GENERATED_ASSETS__"). */
  defineAssetsString?: string;
  /** Path of the consolidated output file (relative to distdir). */
  outfile?: string;
  /** If true, Deno.bundle will write directly to disk (default: false in BuildIt to allow post-processing). */
  write?: boolean;
  /** Global variable name for exposing the bundle in IIFE format (implemented via post-processing). */
  globalName?: string;
  /** Code snippets injected at the beginning of the generated file (implemented via post-processing). Supports __APP_VERSION__. */
  banner?: { js?: string; css?: string };
  /** Code snippets injected at the end of the generated file (implemented via post-processing). Supports __APP_VERSION__. */
  footer?: { js?: string; css?: string };
  /** JSX transformation mode (automatic, transform or preserve). Read from deno.json by Deno.bundle. */
  jsx?: string;
  /** Custom JSX factory (e.g., "h"). Read from deno.json by Deno.bundle. */
  jsxFactory?: string;
  /** Custom JSX fragment (e.g., "Fragment"). Read from deno.json by Deno.bundle. */
  jsxFragment?: string;
  /** Package for automatic JSX runtime. Read from deno.json by Deno.bundle. */
  jsxImportSource?: string;
}

/** Raw configuration file for Deno native bundler (denobuild.jsonc). */
export interface DenoBuildConfigFile {
  /** Optional JSON schema URI. */
  $schema?: string;
  /** Dictionary of build targets. */
  targets?: DenoBundleGlobalConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
  /** Additional custom options. */
  [key: string]: unknown;
}

/** Result of a target build execution in Deno native bundler. */
export interface DenoBuildResult {
  /** Name of the built target. */
  target: string;
  /** Whether the build succeeded. */
  success: boolean;
  /** Execution duration in milliseconds. */
  durationMs: number;
  /** List of generated output file paths. */
  outputFiles: string[];
}

/** Result of loading Deno native bundler configuration file. */
export interface DenoBuildConfigResult {
  /** Dictionary of loaded build targets. */
  targets: DenoBundleGlobalConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
}

/** Dictionary mapping target names to Deno native bundle configurations. */
export interface DenoBundleGlobalConfig {
  /** Target configuration indexed by target name. */
  [targetName: string]: DenoBundleTargetConfig;
}

/** Programmatic options for running Deno native bundler. */
export interface DenoBuildOptions {
  /** Target configurations dictionary. */
  config: DenoBundleGlobalConfig;
  /** Subset of targets to build. If omitted, builds default targets. */
  targets?: string[];
  /** If true, skips reading or updating project versions. */
  noversion?: boolean;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Whether to enforce package versions in workspace packages. */
  forcepackagesversion?: boolean;
  /** Global define variable name for application version. */
  defineVersionString?: string;
  /** Project base directory. */
  baseDir?: string;
  /** Path to root deno.jsonc file. */
  denoJsoncPath?: string;
  /** If true, suppresses console output. */
  silent?: boolean;
}

/** Export configuration file (export.jsonc). */
export interface ExportConfigFile {
  /** Optional JSON schema. */
  $schema?: string;
  /** Global project name (default: "BuildIt"). */
  project?: string;
  /** Global custom header block for AI. */
  header?: string;
  /** Custom identifier for global version (default: "__APP_VERSION__"). */
  defineVersionString?: string;
  /** Dictionary of export modes. */
  modes: Record<string, ExportConfig>;
}

/** Result of loading export configuration file. */
export interface ExportConfigResult {
  /** Dictionary of configured export modes. */
  modes: Record<string, ExportConfig>;
  /** Global project name. */
  project?: string;
  /** Global custom header block for AI. */
  header?: string;
  /** Custom identifier for global version define. */
  defineVersionString?: string;
}

/** Result of a single mode execution in AI context exporter. */
export interface ExportResult {
  /** Name of the exported mode. */
  mode: string;
  /** Number of files included in the export. */
  files: number;
  /** Path of the generated Markdown file. */
  outputFile: string;
  /** Size of generated output in bytes. */
  bytes: number;
}

/** Programmatic options for running the AI context exporter. */
export interface ExportOptions {
  /** Dictionary of export mode configurations. */
  config: Record<string, ExportConfig>;
  /** Specific export modes to run. If omitted, runs default modes. */
  modes?: string[];
  /** Base directory for scanning files. */
  baseDir?: string;
  /** Application version to inject into the header. */
  appVersion?: string;
  /** Path to root deno.jsonc file. */
  denoJsoncPath?: string;
  /** Custom identifier for version define. */
  defineVersionString?: string;
  /** If true, suppresses console output. */
  silent?: boolean;
}

/** Common CLI flags parsed across build tools. */
export interface CommonCliFlags {
  /** Path to custom config file. */
  configPath?: string;
  /** Whether version flag was passed. */
  showVersion: boolean;
  /** Whether help flag was passed. */
  showHelp: boolean;
  /** Whether noversion flag was passed. */
  noversion: boolean;
  /** Whether to enforce workspace package versions. */
  forcepackagesversion: boolean;
  /** Custom version file paths. */
  versionPaths?: string[];
  /** Positional arguments passed to CLI. */
  positional: string[];
}

/** Options for workspace synchronization. */
export interface SyncWorkspacesOptions {
  /** Base directory for resolution (default: "."). */
  baseDir?: string;
  /** Path of the root configuration file (deno.jsonc or deno.json). */
  denoJsonPath?: string;
  /** Current version to be propagated. If omitted, reads from the root deno.jsonc. */
  currentVersion?: string;
  /** Alias for currentVersion. */
  version?: string;
}

/** Options for project version increment. */
export interface IncrementVersionOptions {
  /** Base directory for resolution (default: "."). */
  baseDir?: string;
  /** Path of the root configuration file (deno.jsonc or deno.json). */
  denoJsonPath?: string;
  /** Base current version. If omitted, reads directly from the deno.json[c] file. */
  currentVersion?: string;
  /** Custom build hash to be appended (e.g., "abc1234"). */
  buildHash?: string;
}

/** Options for updating project versions. */
export interface VersionUpdateOptions {
  /** Current version string. */
  currentVersion?: string;
  /** Path to root deno.jsonc file. */
  denoJsonPath?: string;
  /** Project base directory. */
  baseDir?: string;
  /** If true, skips version operations. */
  noversion?: boolean;
  /** Paths to version files to update. */
  versionPaths?: string[];
  /** Enforce versions on workspace packages. */
  forcepackagesversion?: boolean;
  /** Global define variable name for version. */
  defineVersionString?: string;
  /** Custom build hash to append. */
  buildHash?: string;
}

/** Raw esbuild configuration file (esbuild.jsonc). */
export interface EsbuildConfigFile {
  /** Optional JSON schema URI. */
  $schema?: string;
  /** Dictionary of build targets. */
  targets?: GlobalTargetConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
  /** Additional custom options. */
  [key: string]: unknown;
}

/** Result of loading esbuild configuration file. */
export interface EsbuildConfigResult {
  /** Dictionary of loaded build targets. */
  targets: GlobalTargetConfig;
  /** Custom global define string for version injection. */
  defineVersionString?: string;
  /** Version file paths to ensure. */
  versionPaths?: string[];
  /** Enforce workspace packages version sync. */
  forcepackagesversion?: boolean;
}

/** Result of a target build execution in esbuild. */
export interface EsbuildResult {
  /** Name of the built target. */
  target: string;
  /** Whether the build succeeded. */
  success: boolean;
  /** Execution duration in milliseconds. */
  durationMs: number;
}

/** Options for executing version sanitization in deno.json[c] files. */
export interface SanitizeVersionOptions {
  /** Path of the file to be sanitized. If omitted, searches recursively for the nearest one. */
  filePath?: string;
  /** Base directory for searching if filePath is not specified. */
  baseDir?: string;
  /** If true, does not emit logs to the console during execution. */
  silent?: boolean;
}

/** Result of the version sanitization operation. */
export interface SanitizeVersionResult {
  /** Path of the processed file. */
  filePath: string;
  /** Original version found in the file. */
  rawVersion: string;
  /** Sanitized version in canonical semver format (MAJOR.MINOR.PATCH). */
  sanitizedVersion: string;
  /** Indicates if the file on disk was modified. */
  updated: boolean;
}

/** Options for creating and publishing git tags based on version. */
export interface TagVersionOptions {
  /** Path of the deno.json[c] file. If omitted, searches automatically. */
  file?: string;
  /** Custom commit message. Default: "Version vMAJOR.MINOR". */
  message?: string;
  /** If true, performs sanitization of the deno.json[c] file on disk before committing. */
  sanitize?: boolean;
  /** If true, only simulates git operations without persisting commits or tags. */
  dryRun?: boolean;
  /** If true, generates or updates the CHANGELOG.md file with changes since the last tag. */
  changelog?: boolean;
  /** If true, updates the latest updates section in README.md. (Requires changelog: true) */
  updateReadme?: boolean;
  /** Execution base directory. */
  baseDir?: string;
  /** If true, does not emit logs to the console during execution. */
  silent?: boolean;
}

/** Result of the git tag operation. */
export interface TagVersionResult {
  /** Name of the generated tag (e.g., "v0.3"). */
  tagName: string;
  /** Original raw version. */
  rawVersion: string;
  /** Sanitized semver version. */
  sanitizedVersion: string;
  /** Message used in the commit. */
  message: string;
  /** Whether the repository was modified and committed. */
  committed: boolean;
  /** Whether the tag was created and published. */
  tagged: boolean;
}

/** Data stored in the concurrency lock file during active watch sessions. */
export interface WatchLockData {
  /** PID of the active Deno process */
  pid: number;
  /** Name of the target under monitoring */
  target: string;
  /** ISO timestamp of process start */
  startedAt: string;
  /** Execution base directory */
  baseDir?: string;
}

```

---

## File: `packages/utils/src/tools/jsonc.ts`

```ts
import { parse as parseJsonc, } from "@std/jsonc";
import { dirname, fromFileUrl, join, } from "@std/path";

/**
 * Loads and parses a JSON or JSONC file safely.
 * Tries to load the specified file or looks for default alternatives.
 *
 * Search Priority:
 * 1. Explicit path (if provided)
 * 2. Directory of the executing script (Deno.mainModule)
 * 3. Base directory provided (baseDir)
 *
 * @param fileName Base file name (e.g., "denobuild")
 * @param explicitPath Optional explicit path provided by the user
 * @param baseDir Base directory for searching (default: ".")
 * @returns The parsed object or null if not found/invalid
 */
export async function loadConfig<T,>(
  fileName: string,
  explicitPath?: string,
  baseDir: string = ".",
): Promise<T | null> {
  const candidates: string[] = [];

  if (explicitPath) {
    candidates.push(explicitPath,);
    candidates.push(join(baseDir, explicitPath,),);
    candidates.push(join(baseDir, "scripts", explicitPath,),);
  } else {
    // 1. Try main script directory (if it's a local file)
    try {
      if (Deno.mainModule && Deno.mainModule.startsWith("file://",)) {
        const scriptDir = dirname(fromFileUrl(Deno.mainModule,),);
        candidates.push(join(scriptDir, `${fileName}.jsonc`,),);
        candidates.push(join(scriptDir, `${fileName}.json`,),);
      }
    } catch {
      // Ignore URL/Path errors in mainModule
    }

    // 2. Try scripts/ subfolder inside baseDir
    candidates.push(join(baseDir, "scripts", `${fileName}.jsonc`,),);
    candidates.push(join(baseDir, "scripts", `${fileName}.json`,),);

    // 3. Try base directory (usually CWD or project root)
    candidates.push(join(baseDir, `${fileName}.jsonc`,),);
    candidates.push(join(baseDir, `${fileName}.json`,),);
  }

  // Remove duplicates while maintaining order
  const uniqueCandidates = [...new Set(candidates),];

  // console.debug(`🔍 Searching config '${fileName}' in:`, uniqueCandidates);

  for (const path of uniqueCandidates) {
    try {
      const content = await Deno.readTextFile(path,);
      const parsed = parseJsonc(content,);

      if (parsed && typeof parsed === "object") {
        // console.debug(`✅ Config found at: ${path}`);
        return parsed as T;
      }
    } catch (error) {
      if (explicitPath && !(error instanceof Deno.errors.NotFound)) {
        console.warn(
          `⚠️ Error reading configuration file at ${path}:`,
          error,
        );
      }
    }
  }

  return null;
}

```

---

## File: `packages/utils/src/tools/mod.ts`

```ts

export * from "./interfaces.ts";
export {
  EXTENSIONS_EXAMPLE as defaultExtensions,
} from "./interfaces.ts";
export { VERSION_PATHS_EXAMPLE as versionPathsExample, } from "./version.ts";

export { 
    readProjectVersion,
    sanitizeVersion,
    ensureVersionFiles,
    incrementProjectVersion,
    syncVersion,
    syncWorkspaceDir,
    syncWorkspaces
} from "./version.ts"

export {
    loadConfig
} from "./jsonc.ts"

export {
    applyDefines,
    findDenoConfig,
    processFilesWithDefines
} from "./paths.ts"

```

---

## File: `packages/utils/src/tools/paths.ts`

````ts
import { copy, emptyDir, ensureDir, expandGlob, walk, } from "@std/fs";
import {
  basename,
  dirname,
  globToRegExp,
  isAbsolute,
  join,
  relative,
} from "@std/path";

import type {
  CleanConfig,
  CopyFileConfig,
  DenoBundleTargetConfig,
  TargetConfig,
  WatchTargetConfig,
} from "./interfaces.ts";

// ============================================================================
// 🛡️ PATH AND GLOB VALIDATION (pure, testable)
// ============================================================================
/**
 * Checks if a path is safe (prevents path traversal and absolute paths).
 * @param cleanPath Path to be checked
 * @returns True if safe
 */
export function isSafePath(cleanPath: string,): boolean {
  if (cleanPath.includes("..",)) return false;
  if (isAbsolute(cleanPath,)) return false;
  return true;
}

/**
 * Resolves a relative path by adding baseDir if provided and not an absolute path.
 *
 * @param pathStr Path to be resolved
 * @param baseDir General base directory
 * @returns Resolved path with baseDir
 */
export function resolveWithBase(
  pathStr: string | undefined,
  baseDir: string = ".",
): string | undefined {
  if (!pathStr) return undefined;
  if (isAbsolute(pathStr,) || baseDir === "." || !baseDir) return pathStr;
  return join(baseDir, pathStr,);
}

/**
 * Tests if a relative path matches any of the provided glob patterns.
 *
 * @param path Relative path to be tested
 * @param patterns List of glob patterns (supports brace expansion and globstar)
 * @returns True if the path matches at least one pattern
 */
export function matchesGlobs(path: string, patterns: string[],): boolean {
  const normalizedPath = path.replace(/\\/g, "/",);
  for (const pattern of patterns) {
    try {
      const reg = globToRegExp(pattern, {
        globstar: true,
        caseInsensitive: true,
      },);
      if (reg.test(normalizedPath,) || reg.test(path,)) {
        return true;
      }
    } catch {
      // Ignore invalid pattern
    }
  }
  return false;
}

// ============================================================================
// 📍 OUTPUT PATHS RESOLUTION (outfile relative to distdir)
// ============================================================================
/**
 * Resolves output paths (outfile/outdir) based on configuration.
 *
 * Rules:
 * 1. If 'outfile' and 'distdir' exist: outfile is RELATIVE to distdir → join(distdir, outfile)
 * 2. If only 'outfile' exists (no distdir): outfile is ABSOLUTE
 * 3. If only 'distdir' exists (no outfile): distdir is used as outdir
 * 4. If none exists: returns empty object (should not happen if validateTargetConfig was called)
 *
 * @returns Object with resolved 'outfile' or 'outdir' (never both)
 */
export function resolveOutputPaths(
  config: TargetConfig | DenoBundleTargetConfig,
): { outfile?: string; outdir?: string } {
  if (config.outfile) {
    if (config.distdir) {
      // outfile relative to distdir
      return { outfile: join(config.distdir, config.outfile,), };
    }
    // absolute outfile (no distdir)
    return { outfile: config.outfile, };
  }
  // No outfile, use distdir as outdir
  if (config.distdir) {
    return { outdir: config.distdir, };
  }
  // Neither outfile nor distdir (should not get here if validateTargetConfig was called)
  return {};
}

// ============================================================================
// 🎯 ENTRYPOINTS RESOLUTION (relative to srcdir when available)
// ============================================================================
/**
 * Resolves entrypoints relative to srcdir (if available) and validates their existence on disk.
 * Throws a clear and educational error if any file is not found.
 *
 * If srcdir is not configured, treats all entrypoints as absolute.
 */
export function resolveEntryPoints(
  srcdir: string | undefined,
  entryPoints: string[],
): string[] {
  return entryPoints.map((entry,) => {
    let resolvedPath: string;

    if (srcdir && !isAbsolute(entry,)) {
      // srcdir exists and entry is relative → perform join
      resolvedPath = join(srcdir, entry,);
    } else {
      // srcdir doesn't exist OR entry is already absolute → use as is
      resolvedPath = entry;
    }

    try {
      Deno.statSync(resolvedPath,);
    } catch {
      throw new Error(
        `❌ Entrypoint not found at: "${resolvedPath}"\n` +
          `   Configured source: "${entry}"\n` +
          (srcdir
            ? `   Check if the path is correct relative to srcdir: "${srcdir}".`
            : `   Check if the absolute path is correct.`),
      );
    }

    return resolvedPath;
  },);
}

/**
 * Ensures the parent directory of a file exists.
 * @param filePath Path of the file
 */
export async function ensureDirForFile(filePath: string,): Promise<void> {
  const dir = dirname(filePath,);
  if (dir && dir !== ".") {
    await ensureDir(dir,);
  }
}

// ============================================================================
// 📂 FILESYSTEM FUNCTIONS
// ============================================================================
/**
 * Cleans the directories/files configured in the target.
 * Supports globs and brace expansion through { includes, excludes } or path array.
 *
 * Rules:
 * 0. Includes and excludes are always relative to distdir. No file above distdir can be deleted.
 * 1. To empty everything in distdir, use includes: ["*"] (or legacy ["."]).
 *
 * @param distDir Output directory
 * @param cleanConfig Cleanup configuration ({ includes, excludes }) or path list
 */
export async function cleanTarget(
  distDir: string,
  cleanConfig?: CleanConfig | string[],
): Promise<void> {
  if (!cleanConfig || !distDir) return;
  try {
    const stat = await Deno.stat(distDir,);
    if (!stat.isDirectory) return;
  } catch {
    // Output directory does not yet exist on disk
    return;
  }

  // Normalize CleanConfig
  const config: CleanConfig = Array.isArray(cleanConfig,)
    ? { includes: cleanConfig, }
    : cleanConfig;

  if (!config || !config.includes || config.includes.length === 0) return;

  console.log(`🧹 Cleaning at ${distDir}...`,);
  const includes = config.includes;
  const excludes = config.excludes ?? [];

  // Optimization: If includes is ["*"] and excludes empty, empty distDir directly
  if (
    includes.length === 1 &&
    includes[0] === "*" &&
    excludes.length === 0
  ) {
    try {
      await emptyDir(distDir,);
      console.log(`   ✅ Directory emptied: ${distDir}`,);
      return;
    } catch (error) {
      console.warn(`   ⚠️ Failed to empty ${distDir}:`, error,);
      return;
    }
  }

  // Cleanup via globs / brace expansion
  for (const pattern of includes) {
    // Direct protection against paths with traversal or absolute in pattern
    if (!isSafePath(pattern,)) {
      console.warn(
        `   ⚠️ Dangerous path ignored (traversal/absolute): "${pattern}"`,
      );
      continue;
    }

    try {
      for await (
        const entry of expandGlob(pattern, {
          root: distDir,
          exclude: excludes,
          includeDirs: true,
        },)
      ) {
        const rel = relative(distDir, entry.path,).replace(/\\/g, "/",);

        // 🔒 Rule 0: Strict protection against path traversal / level above distdir
        if (
          rel.startsWith("..",) || isAbsolute(rel,) || rel === "" || rel === "."
        ) {
          console.warn(
            `   ⚠️ Dangerous path ignored (outside distdir): "${entry.path}"`,
          );
          continue;
        }

        // Check excludes
        if (excludes.length > 0 && matchesGlobs(rel, excludes,)) {
          continue;
        }

        try {
          await Deno.remove(entry.path, { recursive: true, },);
          console.log(`   ✅ Removed: ${rel}`,);
        } catch {
          // might have been removed recursively by parent folder already
        }
      }
    } catch (err) {
      console.warn(
        `   ⚠️ Error evaluating cleanup with pattern '${pattern}':`,
        err,
      );
    }
  }
}

/**
 * Lists all generated assets in distdir for Service Worker cache.
 * @param distDir Output directory
 * @param excludeFiles List of files to ignore
 * @returns List of relative paths
 */
export async function listAssetsForCache(
  distDir: string,
  excludeFiles: string[] = [],
): Promise<string[]> {
  // 🔥 CORRECTION: Check if distDir was provided before walking
  if (!distDir) {
    console.warn(
      `⚠️ 'listAssetsForCache' called without 'distDir'. Returning empty array.`,
    );
    return [];
  }

  const assets: string[] = [];
  const exclude = new Set([
    ...excludeFiles,
    "service-worker.js",
    "serviceworker.js",
    "serviceWorker.js",
    "sw.js",
  ],);
  for await (const entry of walk(distDir, { includeDirs: false, },)) {
    if (
      !entry.name.endsWith(".map",) &&
      !entry.name.endsWith("metafile.json",) &&
      !exclude.has(entry.name,)
    ) {
      let webPath = entry.path.replace(distDir, "",).replace(/\\/g, "/",);
      webPath = webPath.startsWith("/",) ? "." + webPath : "./" + webPath;
      assets.push(webPath,);
    }
  }
  return assets;
}

/**
 * Copies static files to distdir following copyFiles rules.
 *
 * Rules:
 * 0. item.basedir will be joined with generalBaseDir
 * 1. If basedir provided, includes and excludes are relative to basedir and directory tree is preserved
 * 2. If basedir provided and includes is missing, empty or "*", copies everything from basedir, respecting excludes
 * 3. If basedir missing, includes and excludes are relative to generalBaseDir and tree is NOT preserved (files copied directly to distdir)
 * 4. copyFiles is an array
 * 5. index.html is copied using this configuration
 * 6. if the copied file is manifest.json, continues version injection; if index.html, reports in console.log
 *
 * @param copyFiles Copy configuration list
 * @param distDir Final resolved output directory
 * @param appVersion Application version for manifest.json injection
 * @param generalBaseDir Execution general base directory (default ".")
 */
export async function copyTargetFiles(
  copyFiles: CopyFileConfig[] | undefined,
  distDir: string,
  appVersion: string,
  generalBaseDir: string = ".",
): Promise<void> {
  if (!copyFiles || copyFiles.length === 0) return;
  if (!distDir) {
    console.warn(
      `⚠️ 'copyFiles' configured but 'distdir' missing. Skipping copy.`,
    );
    return;
  }

  await ensureDir(distDir,);

  for (const item of copyFiles) {
    const hasItemBase = typeof item.basedir === "string" &&
      item.basedir.trim().length > 0;
    // 0. Perform join of this basedir with the "general basedir"
    const effectiveBaseDir = hasItemBase
      ? (generalBaseDir && generalBaseDir !== "." && !isAbsolute(item.basedir!,)
        ? join(generalBaseDir, item.basedir!,)
        : item.basedir!)
      : (generalBaseDir ?? ".");

    if (hasItemBase) {
      // 1. if basedir provided, includes and excludes are relative to basedir and tree is preserved
      // 2. if basedir provided and includes is missing, empty or "*", copies everything from basedir respecting excludes
      const isAll = !item.includes ||
        item.includes.length === 0 ||
        (item.includes.length === 1 && item.includes[0] === "*");

      const patterns = isAll ? ["**/*",] : item.includes!;

      try {
        const stat = await Deno.stat(effectiveBaseDir,);
        if (!stat.isDirectory) {
          console.warn(
            `⚠️ '${effectiveBaseDir}' is not a directory, skipping copy.`,
          );
          continue;
        }
      } catch {
        console.warn(
          `⚠️ Folder ${effectiveBaseDir} not found, skipping copy.`,
        );
        continue;
      }

      for (const pattern of patterns) {
        try {
          for await (
            const entry of expandGlob(pattern, {
              root: effectiveBaseDir,
              exclude: item.excludes,
              includeDirs: false,
            },)
          ) {
            if (entry.isFile) {
              const relPath = relative(effectiveBaseDir, entry.path,).replace(
                /\\/g,
                "/",
              );

              if (item.excludes && item.excludes.length > 0) {
                if (matchesGlobs(relPath, item.excludes,)) {
                  continue;
                }
              }

              const destPath = join(distDir, relPath,);
              await ensureDirForFile(destPath,);
              await copy(entry.path, destPath, { overwrite: true, },);

              const fileName = basename(entry.path,).toLowerCase();
              if (fileName === "index.html") {
                console.log(
                  `📄 index.html copied from ${effectiveBaseDir} to ${destPath}`,
                );
              }
              if (fileName === "manifest.json") {
                try {
                  const manifestText = await Deno.readTextFile(destPath,);
                  const manifestObj = JSON.parse(manifestText,);
                  manifestObj.version = appVersion;
                  await Deno.writeTextFile(
                    destPath,
                    JSON.stringify(manifestObj, null, 2,),
                  );
                  console.log(
                    `📱 Version v${appVersion} injected into manifest.json`,
                  );
                } catch {
                  // manifest is not valid JSON
                }
              }
            }
          }
        } catch (err) {
          console.warn(
            `⚠️ Error expanding glob '${pattern}' in '${effectiveBaseDir}':`,
            err,
          );
        }
      }
      console.log(
        `📁 Files from ${effectiveBaseDir} copied to ${distDir}`,
      );
    } else {
      // 3. if basedir missing, includes and excludes are relative to "general basedir"
      // and directory tree is NOT preserved in copy and files are copied directly to distdir
      const patterns = item.includes && item.includes.length > 0
        ? item.includes
        : [];
      for (const pattern of patterns) {
        try {
          for await (
            const entry of expandGlob(pattern, {
              root: effectiveBaseDir,
              exclude: item.excludes,
              includeDirs: false,
            },)
          ) {
            if (entry.isFile) {
              const relPath = relative(effectiveBaseDir, entry.path,).replace(
                /\\/g,
                "/",
              );
              if (item.excludes && item.excludes.length > 0) {
                if (matchesGlobs(relPath, item.excludes,)) {
                  continue;
                }
              }

              const fileName = basename(entry.path,);
              const destPath = join(distDir, fileName,);
              await ensureDirForFile(destPath,);
              await copy(entry.path, destPath, { overwrite: true, },);

              if (fileName.toLowerCase() === "index.html") {
                console.log(`📄 index.html copied to ${destPath}`,);
              }
              if (fileName.toLowerCase() === "manifest.json") {
                try {
                  const manifestText = await Deno.readTextFile(destPath,);
                  const manifestObj = JSON.parse(manifestText,);
                  manifestObj.version = appVersion;
                  await Deno.writeTextFile(
                    destPath,
                    JSON.stringify(manifestObj, null, 2,),
                  );
                  console.log(
                    `📱 Version v${appVersion} injected into manifest.json`,
                  );
                } catch {
                  // manifest is not valid JSON
                }
              }
            }
          }
        } catch (err) {
          console.warn(
            `⚠️ Error expanding glob '${pattern}' in '${effectiveBaseDir}':`,
            err,
          );
        }
      }
    }
  }
}

/**
 * Copies static files to distdir using copyFiles configuration.
 * @param config Target configuration
 * @param appVersion Application version for manifest injection
 * @param generalBaseDir Execution general base directory (default ".")
 * @param distDir Optional already resolved output directory
 *
 * @example
 * ```typescript
 * await copyStaticFiles({
 *   copyFiles: [
 *     { basedir: "public", includes: ["**\/*"] },
 *     { basedir: "src", includes: ["index.html"] }
 *   ]
 * }, "1.0.0", ".", "dist");
 * ```
 */
export async function copyStaticFiles(
  config: TargetConfig | DenoBundleTargetConfig | WatchTargetConfig,
  appVersion: string,
  generalBaseDir: string = ".",
  distDir?: string,
): Promise<void> {
  const effectiveDistDir = distDir ??
    (config.distdir
      ? (generalBaseDir && generalBaseDir !== "." &&
          !isAbsolute(config.distdir,)
        ? join(generalBaseDir, config.distdir,)
        : config.distdir)
      : undefined);

  if (!effectiveDistDir) {
    if (config.copyFiles) {
      console.warn(
        `⚠️ Static files configured but 'distdir' missing. Skipping copy.`,
      );
    }
    return;
  }

  // Use copyFiles system
  if (config.copyFiles && config.copyFiles.length > 0) {
    await copyTargetFiles(
      config.copyFiles,
      effectiveDistDir,
      appVersion,
      generalBaseDir,
    );
  }
}

/**
 * Applies definition substitutions (defines) in a memory code string.
 *
 * @param text Original source code content
 * @param defines Map of identifiers and replacement values
 * @returns Code with applied substitutions
 *
 * @example
 * ```typescript
 * applyDefines("console.log(__APP_VERSION__)", { "__APP_VERSION__": '"1.0.0"' });
 * ```
 */
export function applyDefines(
  text: string,
  defines: Record<string, string>,
): string {
  let result = text;
  for (const [key, value,] of Object.entries(defines,)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&",);
    const regex = new RegExp(escapedKey, "g",);
    result = result.replace(regex, value,);
  }
  return result;
}

/**
 * Processes a list of files applying definition substitutions (defines).
 * Useful for injecting variables into post-copy static files or configuration files.
 *
 * @param filePaths List of file paths to process
 * @param defines Map of identifiers and replacement values
 * @returns List of file paths successfully processed
 *
 * @example
 * ```typescript
 * await processFilesWithDefines(["./dist/config.js"], { "__API_URL__": '"https://api.example.com"' });
 * ```
 */
export async function processFilesWithDefines(
  filePaths: string[],
  defines: Record<string, string>,
): Promise<string[]> {
  const processed: string[] = [];
  if (
    !filePaths || filePaths.length === 0 || !defines ||
    Object.keys(defines,).length === 0
  ) {
    return processed;
  }

  for (const filePath of filePaths) {
    try {
      const content = await Deno.readTextFile(filePath,);
      const updated = applyDefines(content, defines,);
      if (content !== updated) {
        await Deno.writeTextFile(filePath, updated,);
        processed.push(filePath,);
      }
    } catch (err) {
      console.warn(
        `⚠️ Failed to process defines in file '${filePath}':`,
        err,
      );
    }
  }

  return processed;
}

/**
 * Searches for deno.json or deno.jsonc climbing the directory tree.
 * The search stops upon finding the file or reaching a project root marker (e.g., .git).
 *
 * @param startDir Initial directory for search (default: CWD)
 * @returns Absolute path of the first one found, or null.
 */
export function findDenoConfig(startDir?: string,): string | null {
  let currentDir: string;
  try {
    currentDir = startDir
      ? (isAbsolute(startDir,) ? startDir : Deno.realPathSync(startDir,))
      : Deno.cwd();
  } catch {
    return null;
  }

  const candidates = ["deno.json", "deno.jsonc",];

  while (true) {
    // 1. Try to find candidates in the current directory
    for (const name of candidates) {
      const fullPath = join(currentDir, name,);
      try {
        const stat = Deno.statSync(fullPath,);
        if (stat.isFile) return fullPath;
      } catch (err) {
        if (err instanceof Deno.errors.NotFound) continue;
        if (err instanceof Deno.errors.PermissionDenied) continue;
        throw err;
      }
    }

    // 2. Check project root markers to stop climbing
    try {
      const gitDir = join(currentDir, ".git",);
      const stat = Deno.statSync(gitDir,);
      if (stat.isDirectory) break;
    } catch {
      // continue climbing
    }

    // 3. Climb one level
    const parentDir = dirname(currentDir,);
    if (parentDir === currentDir || currentDir === "/") break;
    currentDir = parentDir;
  }

  return null;
}

````

---

## File: `packages/utils/src/tools/targets.ts`

```ts
/**
 * @module @vanaware/buildit/tools/targets
 * @description Deterministic resolution and execution order guarantee for targets based on configuration.
 */

/**
 * Resolves and strictly preserves the execution order of targets as declared
 * in the project configuration file (single source of truth).
 *
 * @param config Configuration object containing keys in the desired order
 * @param requestedTargets Optional list of targets requested by the user (e.g., via CLI)
 * @returns List of filtered targets respecting the original configuration order
 */
export function resolveTargetOrder<T extends object,>(
  config: T,
  requestedTargets?: string[],
): string[] {
  const configKeys = Object.keys(config,);

  if (!requestedTargets || requestedTargets.length === 0) {
    // Returns all targets that do not have default: false
    return configKeys.filter((key,) => {
      const targetConfig = (config as Record<string, unknown>)[key];
      if (targetConfig && typeof targetConfig === "object") {
        return (targetConfig as { default?: boolean }).default !== false;
      }
      return true;
    },);
  }

  // Normalize requested targets for case-insensitive comparison
  const normalizedRequested = requestedTargets.map((t,) => t.toLowerCase());

  // Strictly preserves the order of keys from the configuration object
  return configKeys.filter((key,) =>
    normalizedRequested.includes(key.toLowerCase(),)
  );
}

```

---

## File: `packages/utils/src/tools/validate.ts`

```ts
import { dirname, isAbsolute, join, } from "@std/path";

import type { DenoBundleTargetConfig, TargetConfig, } from "./interfaces.ts";

// ============================================================================
// 🎯 TARGET CONFIGURATION VALIDATION (fail-fast with clear messages)
// ============================================================================
/**
 * Validates if the target configuration has the required fields for the requested operations.
 * Throws an error with an educational message indicating exactly which condition failed.
 *
 * Requirements rules:
 * - 'distdir' is required when 'copyFiles' is configured or 'outfile' is not configured
 * - 'srcdir' is required when 'entryPoints' contains relative paths
 */
export function validateTargetConfig(
  targetName: string,
  config: TargetConfig | DenoBundleTargetConfig,
): void {
  const reasons: string[] = [];

  // distdir validation
  if (config.copyFiles && config.copyFiles.length > 0 && !config.distdir) {
    reasons.push(
      "'copyFiles' is configured (requires 'distdir' to copy static files)",
    );
  }
  if (!config.outfile && !config.distdir) {
    reasons.push(
      "'outfile' is not configured (requires 'distdir' to use as 'outdir')",
    );
  }

  // Check if any entrypoint is relative and srcdir does not exist
  if (!config.srcdir && config.entryPoints && config.entryPoints.length > 0) {
    const hasRelativeEntry = config.entryPoints.some((entry,) =>
      !isAbsolute(entry,)
    );
    if (hasRelativeEntry) {
      reasons.push(
        "'entryPoints' contains relative paths (requires 'srcdir' to resolve)",
      );
    }
  }

  if (reasons.length > 0) {
    const missingFields: string[] = [];
    if (!config.distdir && reasons.some((r,) => r.includes("'distdir'",))) {
      missingFields.push("'distdir'",);
    }
    if (!config.srcdir && reasons.some((r,) => r.includes("'srcdir'",))) {
      missingFields.push("'srcdir'",);
    }

    throw new Error(
      `❌ [${targetName}] Incomplete configuration.\n` +
        `   Missing required fields: ${missingFields.join(", ",)}\n` +
        `   Reasons:\n` +
        reasons.map((r,) => `   - ${r}`).join("\n",) +
        `\n   Please configure the required fields in the target '${targetName}'.`,
    );
  }
}

```

---

## File: `packages/utils/src/tools/version.ts`

````ts
/**
 * @module @vanaware/buildit/config/version
 * @description Centralized semantic version management and workspace synchronization
 * for Deno projects and snapshots.
 */

import { dirname, isAbsolute, join, } from "@std/path";
import { parse as parseJsonc, } from "@std/jsonc";

import type {
  IncrementVersionOptions,
  ParsedVersion,
  SyncWorkspacesOptions,
  VersionUpdateOptions,
} from "./interfaces.ts";

import { loadConfig, } from "./jsonc.ts";
import { findDenoConfig, } from "./paths.ts";

/**
 * Reads the project semantic version from the root deno.jsonc or deno.json file.
 *
 * @param denoJsonPath Optional path to the configuration file
 * @param baseDir Base directory if denoJsonPath is not absolute
 * @returns Read project version
 */
export async function readProjectVersion(
  denoJsonPath?: string,
  baseDir: string = ".",
): Promise<string> {
  const parsed = await loadConfig<{ version?: string }>(
    "deno",
    denoJsonPath,
    baseDir,
  );

  if (parsed?.version) {
    return parsed.version;
  }

  throw new Error(`❌ Required "version" field not found in deno.jsonc.
Necessary configuration example:
{
  "name": "@buildit/app",
  "version": "1.0.0"
}`);
}

/**
 * Synchronizes the version in a workspace directory (deno.jsonc or deno.json).
 */
export async function syncWorkspaceDir(
  wsPath: string,
  newVersion: string,
  wsRelPath: string,
): Promise<void> {
  for (const fileName of ["deno.jsonc", "deno.json",]) {
    const configPath = join(wsPath, fileName,);
    try {
      const content = await Deno.readTextFile(configPath,);
      const updated = replaceVersionInContent(content, newVersion,);
      await Deno.writeTextFile(configPath, updated,);
      console.log(`   ✅ Synchronized: ${join(wsRelPath, fileName,)}`,);
      return; // Success, stop searching in this workspace
    } catch (err) {
      if (!(err instanceof Deno.errors.NotFound)) {
        console.warn(`   ⚠️ Error synchronizing ${configPath}:`, err,);
      }
    }
  }
}

/**
 * Synchronizes the version defined in the root deno.jsonc with all configured workspaces.
 * If no version is provided in options, reads directly from the root deno.jsonc version.
 *
 * @param options Options containing baseDir, denoJsonPath, and optional version
 * @returns Version synchronized in workspaces
 */
export async function syncWorkspaces(
  options: SyncWorkspacesOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);

  const version = options.currentVersion ?? options.version ??
    await readProjectVersion(denoJsonPath, baseDir,);

  try {
    let rootContent = "";
    let actualDenoJsonPath = denoJsonPath;
    try {
      rootContent = await Deno.readTextFile(denoJsonPath,);
    } catch {
      if (denoJsonPath.endsWith(".jsonc",)) {
        const alt = denoJsonPath.slice(0, -1,);
        rootContent = await Deno.readTextFile(alt,);
        actualDenoJsonPath = alt;
      }
    }
    const rootDir = dirname(actualDenoJsonPath,);
    const parsed = parseJsonc(rootContent,) as { workspace?: string[] };

    if (parsed.workspace && Array.isArray(parsed.workspace,)) {
      console.log(`📦 Synchronizing workspaces for v${version}...`,);
      for (const ws of parsed.workspace) {
        const wsPath = isAbsolute(ws,) ? ws : join(rootDir, ws,);
        await syncWorkspaceDir(wsPath, version, ws,);
      }
    }
  } catch (err) {
    console.warn(`⚠️ Failed to synchronize workspaces in ${denoJsonPath}:`, err,);
  }

  return version;
}

/**
 * Example paths where the version.ts file can be synchronized.
 */
export const VERSION_PATHS_EXAMPLE: string[] = [
  "packages/utils/src/version.ts",
];

/**
 * Parses a version string in major.minor.patch[#hash] format.
 *
 * @param version Version string
 * @returns ParsedVersion object with numeric major, minor, and patch
 */
export function parseVersion(version: string,): ParsedVersion {
  const trimmed = version.trim();
  if (trimmed !== version) {
    throw new Error(`❌ Version cannot have spaces: ${version}`,);
  }
  const versionWithoutHash = version.split("#",)[0] ?? "";
  if (version.includes("#",) && version.endsWith("#",)) {
    throw new Error(`❌ Invalid version format (# without hash): ${version}`,);
  }
  const parts = versionWithoutHash.split(".",);
  if (parts.length !== 3) {
    throw new Error(`❌ Invalid version format: ${version}`,);
  }
  const majorStr = parts[0];
  const minorStr = parts[1];
  const patchStr = parts[2];
  if (
    majorStr === undefined || minorStr === undefined || patchStr === undefined
  ) {
    throw new Error(`❌ Invalid version format: ${version}`,);
  }
  const major = parseInt(majorStr, 10,);
  const minor = parseInt(minorStr, 10,);
  const patch = parseInt(patchStr, 10,);
  if (isNaN(major,) || isNaN(minor,) || isNaN(patch,)) {
    throw new Error(`❌ Version contains non-numeric values: ${version}`,);
  }
  return { major, minor, patch, };
}

/**
 * Formats version components into a standardized string.
 */
export function formatVersion(
  major: number,
  minor: number,
  patch: number,
  buildHash?: string,
): string {
  const hash = buildHash ?? Date.now().toString(36,);
  return `${major}.${minor}.${patch}#${hash}`;
}

/**
 * Replaces the version in the provided text content.
 */
export function replaceVersionInContent(
  content: string,
  newVersion: string,
): string {
  return content.replace(
    /"version"\s*:\s*"[^"]*"/,
    `"version": "${newVersion}"`,
  );
}

/**
 * Generates the default template for version.ts/.js files with the custom constant.
 *
 * @param defineVersionString Constant identifier
 * @param isTypeScript Whether to generate TypeScript version (default: true)
 */
export function getVersionFileTemplate(
  defineVersionString: string = "__APP_VERSION__",
  isTypeScript: boolean = true,
): string {
  if (isTypeScript) {
    return `// Automatically generated file during build

/**
 * Current library/application version.
 * @type {string}
 */
// @ts-ignore: Identifier '${defineVersionString}' is replaced by a string literal at build time
export const APP_VERSION: string = typeof ${defineVersionString} !== "undefined"
  ? ${defineVersionString}
  : "";
`;
  } else {
    return `// Automatically generated file during build

/**
 * Current library/application version.
 * @type {string}
 */
export const APP_VERSION = typeof ${defineVersionString} !== "undefined"
  ? ${defineVersionString}
  : "";
`;
  }
}

/**
 * Ensures the existence of the version.ts file at the specified path or directory.
 * If the file already exists, it is NOT overwritten on every execution.
 * If the file does not exist, it creates the file with the template using defineVersionString.
 *
 * @param targetPathOrDir File or directory path
 * @param baseDir Optional base directory (default: ".")
 * @param defineVersionString Custom constant identifier (default: "__APP_VERSION__")
 * @returns true if the file was created, false if it already existed
 */
export async function ensureVersionFile(
  targetPathOrDir: string,
  baseDir: string = ".",
  defineVersionString: string = "__APP_VERSION__",
): Promise<boolean> {
  const resolvedPath = isAbsolute(targetPathOrDir,)
    ? targetPathOrDir
    : join(baseDir, targetPathOrDir,);

  let filePath = resolvedPath;
  if (
    !resolvedPath.endsWith(".ts",) && !resolvedPath.endsWith(".js",) &&
    !resolvedPath.endsWith(".mjs",)
  ) {
    filePath = join(resolvedPath, "version.ts",);
  }

  const isTypeScript = !filePath.endsWith(".js",) && !filePath.endsWith(".mjs",);

  try {
    const stat = await Deno.stat(filePath,);
    if (stat.isFile) {
      return false;
    }
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  const dir = dirname(filePath,);
  if (dir && dir !== ".") {
    try {
      await Deno.mkdir(dir, { recursive: true, },);
    } catch {
      // directory already exists or no permission
    }
  }

  await Deno.writeTextFile(
    filePath,
    getVersionFileTemplate(defineVersionString, isTypeScript,),
  );
  return true;
}

/**
 * Ensures the existence of files declared in versionPaths before build/bundle.
 * Previously checks for file existence and does not overwrite if it already exists.
 *
 * @param versionPaths List of version.ts file paths
 * @param baseDir Optional base directory (default: ".")
 * @param defineVersionString Custom constant identifier (default: "__APP_VERSION__")
 * @returns List of processed paths
 */
export async function ensureVersionFiles(
  versionPaths: string[] = [],
  baseDir: string = ".",
  defineVersionString: string = "__APP_VERSION__",
): Promise<string[]> {
  const processed: string[] = []; 

  for (const vPath of versionPaths) {
    try {
      const created = await ensureVersionFile(
        vPath,
        baseDir,
        defineVersionString,
      );
      if (created) {
        console.log(
          `📝 Version file created with template ${defineVersionString} at: ${vPath}`,
        );
      } else {
        console.log(`ℹ️ Existing version file kept: ${vPath}`,);
      }
      processed.push(vPath,);
    } catch (err) {
      console.warn(`⚠️ Warning checking/creating version at ${vPath}:`, err,);
    }
  }

  return processed;
}

/**
 * Writes or ensures the existence of the version.ts file at the specified path or directory.
 * Kept for compatibility.
 */
export async function writeVersionFile(
  targetPathOrDir: string,
  _version?: string,
): Promise<void> {
  await ensureVersionFile(targetPathOrDir,);
}

/**
 * Synchronizes project version in configuration files and code without incrementing.
 * Useful to ensure all packages and version files are aligned.
 *
 * @param options Synchronization options
 * @returns Synchronized version
 *
 * @example
 * ```typescript
 * await syncVersion({
 *   versionPaths: ["src/version.ts"],
 *   forcepackagesversion: true
 * });
 * ```
 */
export async function syncVersion(
  options: VersionUpdateOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);
  const forcePackages = options.forcepackagesversion ?? false;
  const versionPaths = options.versionPaths ?? [];
  const defineVersionString = options.defineVersionString ?? "__APP_VERSION__";

  let finalVersion = options.currentVersion;
  if (!finalVersion) {
    finalVersion = await readProjectVersion(denoJsonPath, baseDir,);
  }

  // Synchronize workspaces if requested
  if (forcePackages) {
    await syncWorkspaces({
      baseDir,
      denoJsonPath,
      currentVersion: finalVersion,
    },);
  }

  // Ensure existence of version.ts files without overwriting if they already exist
  if (versionPaths.length > 0) {
    await ensureVersionFiles(versionPaths, baseDir, defineVersionString,);
  } else if (!forcePackages) {
    console.warn(
      `⚠️ No version paths (versionPaths) specified for synchronization.`,
    );
    console.log(`Usage example: syncVersion({ versionPaths: ["src/version.ts"] })`,);
  }

  return finalVersion;
}

/**
 * Reads the current project version (if not provided), increments the patch version (+1),
 * formats with buildHash, and writes the new version back to the root deno.jsonc.
 *
 * @param options Options containing baseDir, denoJsonPath, currentVersion, and buildHash
 * @returns New incremented version applied to the file
 *
 * @example
 * ```typescript
 * const newVersion = await incrementProjectVersion({
 *   baseDir: ".",
 *   buildHash: "abc1234",
 * });
 * ```
 */
export async function incrementProjectVersion(
  options: IncrementVersionOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);

  let currentVer = options.currentVersion;
  if (!currentVer) {
    currentVer = await readProjectVersion(denoJsonPath, baseDir,);
  }

  const { major, minor, patch, } = parseVersion(currentVer,);
  const finalVersion = formatVersion(major, minor, patch + 1, options.buildHash,);

  // Update root deno.jsonc
  try {
    let actualDenoJsonPath = denoJsonPath;
    let rootContent = "";
    try {
      rootContent = await Deno.readTextFile(denoJsonPath,);
    } catch {
      if (denoJsonPath.endsWith(".jsonc",)) {
        const alt = denoJsonPath.slice(0, -1,);
        rootContent = await Deno.readTextFile(alt,);
        actualDenoJsonPath = alt;
      } else {
        throw new Deno.errors.NotFound(`File ${denoJsonPath} not found`);
      }
    }

    const updatedRootContent = replaceVersionInContent(
      rootContent,
      finalVersion,
    );
    await Deno.writeTextFile(actualDenoJsonPath, updatedRootContent,);
    console.log(`📈 Version incremented to: v${finalVersion}`,);
  } catch (err) {
    console.warn(`⚠️ Error updating version in ${denoJsonPath}:`, err,);
  }

  return finalVersion;
}

/**
 * Increments the patch version and synchronizes the project.
 *
 * @param options Update options
 * @returns Final applied version
 *
 * @example
 * ```typescript
 * const newVersion = await updateProjectVersion({
 *   noversion: false,
 *   buildHash: "abc1234"
 * });
 * ```
 */
export async function updateProjectVersion(
  options: VersionUpdateOptions = {},
): Promise<string> {
  const baseDir = options.baseDir ?? ".";
  const denoJsonPath = options.denoJsonPath ??
    join(baseDir, "deno.jsonc",);
  const noversion = options.noversion ?? false;

  let finalVersion = options.currentVersion;

  if (!noversion) {
    finalVersion = await incrementProjectVersion({
      baseDir,
      denoJsonPath,
      currentVersion: options.currentVersion,
      buildHash: options.buildHash,
    },);
  } else {
    if (!finalVersion) {
      finalVersion = await readProjectVersion(denoJsonPath, baseDir,);
    }
    console.log(`📌 Version kept (noversion): v${finalVersion}`,);
  }

  // Synchronize files and sub-packages
  return await syncVersion({
    ...options,
    currentVersion: finalVersion,
  },);
}

/**
 * Searches for deno.jsonc (preferred) or deno.json climbing the directory tree from startDir.
 * Unified utility delegated to paths.ts.
 *
 * @param startDir Initial directory for search (default: ".")
 * @returns Path of the found file or null if not found
 */
export function findDenoFile(startDir: string = ".",): string | null {
  return findDenoConfig(startDir,);
}

/**
 * Normalizes any version string to canonical strict semver "MAJOR.MINOR.PATCH" format.
 * Removes prefixes like "v", build metadata (+build), pre-release identifiers (-alpha),
 * and commit hash suffixes (#hash), ensuring exactly 3 numeric components.
 *
 * @param raw Original raw version string (e.g., "v1.2.3-beta+exp.sha.5114f85", "0.3.14#muesu7z0")
 * @returns Sanitized semver version (e.g., "1.2.3", "0.3.14")
 */
export function sanitizeVersion(raw: string,): string {
  if (!raw) return "0.0.0";
  // Remove non-numeric characters at the beginning (e.g., "v")
  let clean = raw.replace(/^[^0-9]+/, "",);
  // Remove suffixes starting with '-', '+', or '#'
  clean = clean.replace(/[-+#].*$/, "",);
  // Remove everything except digits and dots
  clean = clean.replace(/[^0-9.]/g, "",);
  // Remove multiple dots and dots at the ends
  clean = clean.replace(/\.+/g, ".",).replace(/^\./, "",).replace(/\.$/, "",);

  const parts = clean.split(".",);
  const ma = parts[0] && /^\d+$/.test(parts[0],) ? parts[0] : "0";
  const mi = parts[1] && /^\d+$/.test(parts[1],) ? parts[1] : "0";
  const pa = parts[2] && /^\d+$/.test(parts[2],) ? parts[2] : "0";

  return `${ma}.${mi}.${pa}`;
}

````

---

## File: `packages/utils/src/version.ts`

```ts
// Automatically generated file during build
declare const __APP_VERSION__: string;

/** Current library/application version. */
export const APP_VERSION: string = typeof __APP_VERSION__ !== "undefined"
  ? __APP_VERSION__
  : "";

```

---

## File: `packages/utils/src/version/sanitize/cli.ts`

```ts
/**
 * @module @vanaware/buildit/version/sanitize/cli
 * @description CLI entry point for version sanitization via Cliffy.
 */

import { Command, } from "@cliffy/command";
import { APP_VERSION, } from "../../version.ts";
import { sanitizeVersionFile, } from "./engine.ts";

/**
 * Creates the CLI command for deno.json[c] version sanitization.
 *
 * @returns Configured Cliffy command instance
 */
export function sanitizeVersionCli(): Command<any> {
  return new Command()
    .name("sanitize-version",)
    .description(
      "Normalizes the deno.json[c] version to strict semver format (MAJOR.MINOR.PATCH)",
    )
    .version(APP_VERSION,)
    .arguments("[file:string]",)
    .option("-b, --base-dir [dir:string]", "Base directory for search", {
      default: ".",
      env: { prefix: "BUILDIT_", },
    },)
    .action(async function (options, file,): Promise<void> {
      try {
        await sanitizeVersionFile({
          filePath: file as string | undefined,
          baseDir: options.baseDir as string,
        },);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = sanitizeVersionCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `packages/utils/src/version/sanitize/engine.ts`

````ts
/**
 * @module @vanaware/buildit/version/sanitize/engine
 * @description Semantic version sanitization engine for deno.json and deno.jsonc files.
 */

import {
  findDenoFile,
  readProjectVersion,
  replaceVersionInContent,
  sanitizeVersion,
} from "../../tools/version.ts";
import type {
  SanitizeVersionOptions,
  SanitizeVersionResult,
} from "../../tools/interfaces.ts";

/**
 * Normalizes the "version" field of a deno.json[c] file to strict semver format (MAJOR.MINOR.PATCH).
 * If the "version" field does not exist, injects `"version": "0.0.0"` at the beginning of the file.
 *
 * @param options Sanitization execution options
 * @returns Object with the sanitization result
 *
 * @example
 * ```typescript
 * const result = await sanitizeVersionFile({ filePath: "deno.jsonc" });
 * console.log(result.sanitizedVersion); // "0.3.14"
 * ```
 */
export async function sanitizeVersionFile(
  options: SanitizeVersionOptions = {},
): Promise<SanitizeVersionResult> {
  const baseDir = options.baseDir ?? ".";
  let targetPath = options.filePath;

  if (targetPath) {
    try {
      const stat = await Deno.stat(targetPath,);
      if (!stat.isFile) {
        throw new Error(`❌ Error: File '${targetPath}' not found.`,);
      }
    } catch {
      throw new Error(`❌ Error: File '${targetPath}' not found.`,);
    }
  } else {
    const found = findDenoFile(baseDir,);
    if (!found) {
      throw new Error(
        `❌ Error: No deno.json[c] found starting from ${baseDir}`,
      );
    }
    targetPath = found;
  }

  if (!options.silent) {
    console.log(`🔍 Searching version in: ${targetPath}`,);
  }

  let rawVersion: string | null = null;
  try {
    rawVersion = await readProjectVersion(targetPath, baseDir,);
  } catch {
    rawVersion = null;
  }
  let content = await Deno.readTextFile(targetPath,);

  if (rawVersion === null) {
    if (!options.silent) {
      console.log(
        `⚠️  No 'version' field found. Inserting "0.0.0"...`,
      );
    }
    const braceIndex = content.indexOf("{",);
    if (braceIndex === -1) {
      throw new Error(
        `❌ File ${targetPath} does not contain valid JSON/JSONC.`,
      );
    }
    content = content.slice(0, braceIndex + 1,) + '\n  "version": "0.0.0",' +
      content.slice(braceIndex + 1,);
    rawVersion = "0.0.0";
    await Deno.writeTextFile(targetPath, content,);
  }

  if (!options.silent) {
    console.log(`📌 Original version: ${rawVersion}`,);
  }

  const sanitizedVersion = sanitizeVersion(rawVersion,);
  if (!options.silent) {
    console.log(`✅ Sanitized version: ${sanitizedVersion}`,);
  }

  let updated = false;
  if (rawVersion !== sanitizedVersion) {
    const updatedContent = replaceVersionInContent(content, sanitizedVersion,);
    await Deno.writeTextFile(targetPath, updatedContent,);
    updated = true;
    if (!options.silent) {
      console.log(
        `📝 File updated: ${rawVersion} → ${sanitizedVersion}`,
      );
    }
  } else {
    if (!options.silent) {
      console.log(`✨ Already in correct semver format.`,);
    }
  }

  return {
    filePath: targetPath,
    rawVersion,
    sanitizedVersion,
    updated,
  };
}

````

---

## File: `packages/utils/src/version/sanitize/mod.ts`

```ts
/**
 * @module @vanaware/buildit/version/sanitize
 * @description Semver sanitization module for deno.json and deno.jsonc files.
 */

export { sanitizeVersionFile, } from "./engine.ts";

```

---

## File: `packages/utils/src/version/tag/changelog.ts`

```ts
/**
 * @module @vanaware/buildit/version/tag/changelog
 * @description Utilities for automated changelog generation based on git commits.
 */

import { join, } from "@std/path";
import { runGit, } from "../../tools/git.ts";

/**
 * Gets the last available git tag, optionally cleaning the 'v' prefix.
 */
export async function getLastTag(baseDir?: string,): Promise<string | null> {
  // Try fetching tags first (ignore failures if no remote)
  await runGit(["fetch", "--tags", "--quiet",], baseDir,);

  // Try getting tags sorted by creation date
  let result = await runGit([
    "tag",
    "--sort=-creatordate",
  ], baseDir,);

  // Fallback to simple listing if sorting fails (old git)
  if (!result.success || !result.stdout) {
    result = await runGit(["tag",], baseDir,);
  }

  if (!result.success || !result.stdout) {
    return null;
  }

  const tags = result.stdout.split("\n",).filter(Boolean,);
  // In case of fallback, take the last alphabetical tag (usually v0.2 > v0.1)
  return tags[0] || null;
}

/**
 * Generates the changelog content for the new version based on commits since the last tag.
 *
 * @param tagName Name of the new tag (e.g., "v0.4")
 * @param baseDir Repository base directory
 * @returns Markdown block with changes
 */
export async function generateChangelogContent(
  tagName: string,
  baseDir?: string,
): Promise<string> {
  const lastTag = await getLastTag(baseDir,);
  const range = lastTag ? `${lastTag}..HEAD` : "HEAD";

  const logResult = await runGit([
    "log",
    "--pretty=format:%h %s",
    range,
  ], baseDir,);

  if (!logResult.success) {
    throw new Error(`❌ Failed to get git log: ${logResult.stderr}`,);
  }

  const date = new Date().toISOString().slice(0, 10,);
  const logs = logResult.stdout.trim();
  
  const formattedLogs = logs
    ? logs.split("\n",).map((line,) => `- ${line}`).join("\n",)
    : "- No relevant changes";

  return `## ${tagName} (${date})\n\n${formattedLogs}\n`;
}

/**
 * Updates the CHANGELOG.md file by prepending the new changes.
 */
export async function updateChangelogFile(
  content: string,
  baseDir: string = ".",
): Promise<void> {
  const filePath = join(baseDir, "CHANGELOG.md",);
  let existing = "";
  try {
    existing = await Deno.readTextFile(filePath,);
  } catch {
    // File does not exist, it will be created
  }

  await Deno.writeTextFile(filePath, `${content}\n${existing}`,);
}

/**
 * Updates the latest updates section in README.md.
 */
export async function updateReadmeChangelog(
  content: string,
  baseDir: string = ".",
): Promise<void> {
  const filePath = join(baseDir, "README.md",);
  let readme = "";
  try {
    readme = await Deno.readTextFile(filePath,);
  } catch {
    return; // No README, nothing to do
  }

  const summary = content
    .split("\n",)
    .slice(0, 6,)
    .join("\n",)
    .replace(/^## v\d+\.\d+.*$/m, "### 📦 Latest updates",);

  const markerStart = "<!-- START:changelog -->";
  const markerEnd = "<!-- END:changelog -->";
  const changelogSection = `${markerStart}\n${summary}\n${markerEnd}`;

  if (readme.includes(markerStart,) && readme.includes(markerEnd,)) {
    const regex = new RegExp(`${markerStart}[\\s\\S]*${markerEnd}`, "m",);
    readme = readme.replace(regex, changelogSection,);
  } else {
    readme += `\n\n## 📦 Latest Updates\n\n${changelogSection}\n`;
  }

  await Deno.writeTextFile(filePath, readme,);
}

```

---

## File: `packages/utils/src/version/tag/cli.ts`

```ts
/**
 * @module @vanaware/buildit/version/tag/cli
 * @description CLI entry point for git tag publication via Cliffy.
 */

import { Command, } from "@cliffy/command";
import { APP_VERSION, } from "../../version.ts";
import { tagVersionEngine, } from "./engine.ts";

/**
 * Creates the CLI command for git tag bump and publication.
 *
 * @returns Configured Cliffy command instance
 */
export function tagVersionCli(): Command<any> {
  return new Command()
    .name("tag-version",)
    .description(
      "Creates and publishes a git tag based on the deno.json[c] version (vMAJOR.MINOR)",
    )
    .version(APP_VERSION,)
    .option("-m, --message <msg:string>", "Custom commit message",)
    .option(
      "-s, --sanitize",
      "Sanitizes the deno.json[c] file on disk before committing",
      {
        default: false,
      },
    )
    .option("-f, --file <file:string>", "Specific path to deno.json[c]",)
    .option("-b, --base-dir <dir:string>", "Base directory for search", {
      default: ".",
    },)
    .option(
      "--dry-run",
      "Simulates git operations without performing commits or pushes",
      {
        default: false,
      },
    )
    .option(
      "-c, --changelog",
      "Generates or updates the CHANGELOG.md file with changes since the last tag",
      {
        default: false,
      },
    )
    .option(
      "--update-readme",
      "Updates the latest updates section in README.md (requires --changelog)",
      {
        default: false,
      },
    )
    .action(async function (options,): Promise<void> {
      try {
        await tagVersionEngine({
          file: options.file,
          message: options.message,
          sanitize: options.sanitize,
          baseDir: options.baseDir,
          dryRun: options.dryRun,
          changelog: options.changelog,
          updateReadme: options.updateReadme,
        },);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  const cli = tagVersionCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `packages/utils/src/version/tag/engine.ts`

````ts
/**
 * @module @vanaware/buildit/version/tag/engine
 * @description Engine for automated git tag creation and publication based on deno.json[c] version.
 */

import {
  findDenoFile,
  readProjectVersion,
  sanitizeVersion,
} from "../../tools/version.ts";
import { sanitizeVersionFile, } from "../sanitize/engine.ts";
import { runGit, } from "../../tools/git.ts";
import {
  generateChangelogContent,
  updateChangelogFile,
  updateReadmeChangelog,
} from "./changelog.ts";
import type {
  TagVersionOptions,
  TagVersionResult,
} from "../../tools/interfaces.ts";

/**
 * Creates and publishes a git tag based on the deno.json[c] version (vMAJOR.MINOR).
 *
 * @param options Tag configuration options
 * @returns Result of the operation
 *
 * @example
 * ```typescript
 * const res = await tagVersionEngine({ sanitize: true });
 * console.log(res.tagName); // "v0.3"
 * ```
 */
export async function tagVersionEngine(
  options: TagVersionOptions = {},
): Promise<TagVersionResult> {
  const baseDir = options.baseDir ?? ".";
  const dryRun = options.dryRun ?? false;
  const silent = options.silent ?? false;

  let targetFile = options.file;
  if (!targetFile) {
    const found = findDenoFile(baseDir,);
    if (!found) {
      throw new Error(`❌ deno.json[c] not found starting from ${baseDir}`,);
    }
    targetFile = found;
  }

  // Sanitize on disk if requested
  if (options.sanitize) {
    if (!silent) {
      console.log(`🧼 Sanitizing ${targetFile} before commit...`,);
    }
    await sanitizeVersionFile({
      filePath: targetFile,
      baseDir,
      silent,
    },);
  }

  // Extract and sanitize version in memory
  const rawVersion = await readProjectVersion(targetFile, baseDir,);
  if (!rawVersion) {
    throw new Error(`❌ "version" field missing in ${targetFile}`,);
  }

  const sanitizedVersion = sanitizeVersion(rawVersion,);
  const [major = "0", minor = "0",] = sanitizedVersion.split(".",);
  const tagName = `v${major}.${minor}`;
  const message = options.message || `Version ${tagName}`;

  // Changelog generation if requested
  let changelogContent = "";
  if (options.changelog && !dryRun) {
    if (!silent) {
      console.log(`📝 Generating changelog for ${tagName}...`,);
    }
    changelogContent = await generateChangelogContent(tagName, baseDir,);
    await updateChangelogFile(changelogContent, baseDir,);
    if (options.updateReadme) {
      await updateReadmeChangelog(changelogContent, baseDir,);
    }
  }

  if (!silent) {
    console.log(
      "============================================================",
    );
    console.log("🚀 STARTING TAG VERSION BUMP",);
    console.log(
      "============================================================",
    );
    console.log(`📌 Original version:   ${rawVersion}`,);
    console.log(`🧼 Sanitized version:  ${sanitizedVersion}`,);
    console.log(`🏷️  Target tag:         ${tagName}`,);
    console.log(`📝 Commit message:     ${message}`,);
    if (dryRun) {
      console.log("🔍 DRY-RUN MODE: No git changes will be persisted.",);
    }
    console.log(
      "============================================================",
    );
  }

  // Sanity check: git repository?
  const isGit = await runGit(["rev-parse", "--is-inside-work-tree",], baseDir,);
  if (!isGit.success) {
    if (dryRun) {
      if (!silent) {
        console.warn(
          "⚠️ Warning: Directory is not an active git repository (dry-run proceeds).",
        );
      }
      return {
        tagName,
        rawVersion,
        sanitizedVersion,
        message,
        committed: false,
        tagged: false,
      };
    }
    throw new Error("❌ Not inside a git repository.",);
  }

  if (dryRun) {
    if (!silent) {
      console.log(`\n📦 [Dry-Run] 1/3 - Would simulate git add -A, commit and push`,);
      console.log(
        `🧹 [Dry-Run] 2/3 - Would simulate cleaning old tag (${tagName})`,
      );
      console.log(
        `🏷️  [Dry-Run] 3/3 - Would simulate creation and push of ${tagName}`,
      );
      console.log("\n✅ [Dry-Run] Successfully completed.",);
      console.log(
        "============================================================",
      );
    }
    return {
      tagName,
      rawVersion,
      sanitizedVersion,
      message,
      committed: false,
      tagged: false,
    };
  }

  // 1/3 - Bundling and sending source code
  if (!silent) {
    console.log("\n📦 1/3 - Bundling and sending source code...",);
  }
  await runGit(["add", "-A",], baseDir,);

  const diffCached = await runGit(["diff", "--cached", "--quiet",], baseDir,);
  let committed = false;
  if (diffCached.code !== 0) {
    const commitResult = await runGit(["commit", "-m", message,], baseDir,);
    if (!commitResult.success) {
      throw new Error(`❌ Git commit failed: ${commitResult.stderr}`,);
    }
    committed = true;
  } else {
    if (!silent) {
      console.log("ℹ️  Nothing to commit.",);
    }
  }

  const pushResult = await runGit(["push",], baseDir,);
  if (!pushResult.success && !silent) {
    console.warn(
      `⚠️ Warning on code push (remote might not be configured): ${pushResult.stderr}`,
    );
  }

  // 2/3 - Cleaning old tag
  if (!silent) {
    console.log(`\n🧹 2/3 - Cleaning old tag (${tagName})...`,);
  }
  await runGit(["push", "origin", "--delete", tagName,], baseDir,);
  await runGit(["tag", "-d", tagName,], baseDir,);

  // 3/3 - Publishing new tag
  if (!silent) {
    console.log("\n🏷️  3/3 - Publishing new tag...",);
  }
  const tagCreate = await runGit([
    "tag",
    "-a",
    "-m",
    `Version ${tagName}`,
    tagName,
  ], baseDir,);
  if (!tagCreate.success) {
    throw new Error(`❌ Failed to create git tag: ${tagCreate.stderr}`,);
  }

  const tagPush = await runGit(
    ["push", "--force", "origin", tagName,],
    baseDir,
  );
  if (!tagPush.success && !silent) {
    console.warn(
      `⚠️ Warning on tag origin push ${tagName}: ${tagPush.stderr}`,
    );
  }

  if (!silent) {
    console.log("\n✅ NEW TAG ADDED SUCCESSFULLY!",);
    console.log("Track progress in the Actions tab of your repository.",);
    console.log(
      "============================================================",
    );
  }

  return {
    tagName,
    rawVersion,
    sanitizedVersion,
    message,
    committed,
    tagged: true,
  };
}

````

---

## File: `packages/utils/src/version/tag/mod.ts`

```ts
/**
 * @module @vanaware/buildit/version/tag
 * @description Git tag automation module based on semantic version.
 */

export { tagVersionEngine, } from "./engine.ts";

```

---

## File: `packages/utils/src/watch/cli.ts`

```ts
/**
 * @module @vanaware/buildit/watch/cli
 * @description CLI entry point for continuous monitoring and rebuilding (Watch).
 */

import { Command, } from "@cliffy/command";
import { loadWatchConfig, } from "./config.ts";
import { watchEngine, } from "./engine.ts";
import { APP_VERSION, } from "../version.ts";
import { findDenoConfig, } from "../tools/paths.ts";

/**
 * Creates the CLI command instance for watch mode.
 */
export function watchCli(): Command<any> {
  return new Command()
    .name("watch",)
    .description("BuildIt Watch Orchestrator (Continuous Development)",)
    .version(APP_VERSION,)
    .option("-c, --app-config [file:string]", "Configuration file", {
      env: { prefix: "WATCH_", },
    },)
    .option("-b, --base-dir [dir:string]", "Base Directory", {
      default: "./",
      env: true,
    },)
    .option("-d, --deno-config [file:string]", "Deno Configuration", {
      default: findDenoConfig() ?? "deno.jsonc",
      env: true,
    },)
    .arguments("[target:string]",)
    .action(async function (options, target?: string,): Promise<void> {
      const baseDir = (options.baseDir as string) || ".";
      const configPath = options.appConfig as string;
      const loaded = await loadWatchConfig(configPath, baseDir,);
      const configs = loaded.targets;

      const denoConfigPath = (options.denoConfig as string) || "deno.jsonc";

      console.log(
        "\n👀 Starting BuildIt Watch Orchestrator (esbuild context + @deno/esbuild-plugin)",
      );

      try {
        const handles = await watchEngine({
          config: configs,
          target: target || undefined,
          baseDir,
          versionPaths: loaded.versionPaths,
          defineVersionString: loaded.defineVersionString,
          denoJsoncPath: denoConfigPath,
          silent: false,
        },);

        if (handles.length === 0) {
          console.log("ℹ️ No active watch processes.",);
          return;
        }

        console.log("\n💡 Press Ctrl+C to terminate monitoring.\n",);

        // Graceful termination signal handling
        const onSignal = async () => {
          console.log("\n🛑 Terminating watch mode...",);
          for (const handle of handles) {
            await handle.close();
          }
          Deno.exit(0,);
        };

        try {
          Deno.addSignalListener("SIGINT", onSignal,);
          Deno.addSignalListener("SIGTERM", onSignal,);
        } catch {
          // Ignore if runtime doesn't support SignalListener
        }

        // Keep process alive
        await new Promise(() => {},);
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : String(error,);
        console.error(`\n🛑 Watch initialization failed:\n${message}`,);
        Deno.exit(1,);
      }
    },);
}

if (import.meta.main) {
  await watchCli().parse(Deno.args,);
}

```

---

## File: `packages/utils/src/watch/config.ts`

```ts
/**
 * @module @vanaware/buildit/watch/config
 * @description Loading and validation of configurations for the continuous development mode (Watch).
 */

import { loadConfig, } from "../tools/jsonc.ts";
import type {
  WatchConfigFile,
  WatchConfigResult,
  WatchGlobalConfig,
} from "../tools/interfaces.ts";

/** Example configurations for watch mode */
export const WATCH_CONFIG_EXAMPLE: WatchGlobalConfig = {
  ui: {
    default: true,
    srcdir: "packages/ui/src",
    distdir: "packages/server/build/dist",
    copyFiles: [
      { basedir: "packages/ui/public", },
      { basedir: "packages/ui/src", includes: ["index.html",], },
    ],
    entryPoints: ["main.tsx",],
    platform: "browser",
    format: "esm",
    bundle: true,
    minify: false,
    sourcemap: "inline",
    conditions: ["browser",],
    jsx: "automatic",
    jsxImportSource: "preact",
    write: true,
    legalComments: "eof",
    outfile: "app.js",
  },
};

/**
 * Loads and validates the watch configuration file (watch.jsonc or watch.json).
 *
 * @param configPath Optional explicit path to the file
 * @param baseDir Project base directory (default: ".")
 * @returns Resolved watch target configuration
 */
export async function loadWatchConfig(
  configPath?: string,
  baseDir: string = ".",
): Promise<WatchConfigResult> {
  const parsed = await loadConfig<WatchConfigFile | WatchGlobalConfig>(
    "watch",
    configPath,
    baseDir,
  );

  if (!parsed) {
    throw new Error(`❌ Configuration file "watch.jsonc" not found in the project root.
BuildIt now requires an explicit target declaration for watch mode.

Minimum "watch.jsonc" file example:
{
  "targets": {
    "app": {
      "srcdir": "src",
      "distdir": "dist",
      "entryPoints": ["main.tsx"]
    }
  }
}`);
  }

  let targets: WatchGlobalConfig = {};

  let defineVersionString: string | undefined;
  let versionPaths: string[] | undefined;
  let forcepackagesversion: boolean | undefined;

  if (
    "targets" in parsed && parsed.targets && typeof parsed.targets === "object"
  ) {
    targets = parsed.targets as WatchGlobalConfig;
    defineVersionString = (parsed as WatchConfigFile).defineVersionString;
    versionPaths = (parsed as WatchConfigFile).versionPaths;
    forcepackagesversion = (parsed as WatchConfigFile).forcepackagesversion;
  } else if (!("targets" in parsed) && Object.keys(parsed,).length > 0) {
    // Tries to treat the root object as the targets
    targets = parsed as WatchGlobalConfig;
  }

  if (Object.keys(targets,).length === 0) {
    throw new Error(`❌ No target configuration found in the watch configuration file.`);
  }

  return {
    targets,
    defineVersionString,
    versionPaths,
    forcepackagesversion,
  };
}

```

---

## File: `packages/utils/src/watch/engine.ts`

````ts
/**
 * @module @vanaware/buildit/watch/engine
 * @description Continuous development engine (Watch) using esbuild context and @deno/esbuild-plugin.
 */

import { join, } from "@std/path";
import * as esbuild from "esbuild";
import { denoPlugin, } from "@deno/esbuild-plugin";
import type {
  WatchHandle,
  WatchOptions,
  WatchTargetConfig,
} from "../tools/interfaces.ts";
import {
  cleanTarget,
  copyStaticFiles,
  listAssetsForCache,
  resolveEntryPoints,
  resolveOutputPaths,
  resolveWithBase,
} from "../tools/paths.ts";
import { ensureVersionFiles, readProjectVersion, } from "../tools/version.ts";
import { validateTargetConfig, } from "../tools/validate.ts";
import { acquireWatchLock, } from "./lock.ts";

/**
 * Builds esbuild options specific for continuous monitoring.
 */
export async function buildWatchEsbuildOptions(
  _targetName: string,
  config: WatchTargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string,) => Promise<string[]>,
  defineVersionString?: string,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  // deno-lint-ignore no-explicit-any
  const defineVersionKey = defineVersionString || (config as any).defineVersionString || "__APP_VERSION__";
  const finalDefine: Record<string, string> = {
    ...config.define,
    [defineVersionKey]: JSON.stringify(`v${appVersion}`,),
  };

  if (
    config.defineAssetsString &&
    config.defineAssetsString.trim() !== "" &&
    listAssetsFn &&
    config.distdir
  ) {
    const assets = await listAssetsFn(config.distdir,);
    finalDefine[config.defineAssetsString] = JSON.stringify(assets,);
    console.log(`📋 ${assets.length} assets listed for define '${config.defineAssetsString}'`,);
  }

  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  const { outfile, outdir, } = resolveOutputPaths(config,);

  // deno-lint-ignore no-explicit-any
  const options: any = {
    entryPoints: resolvedEntryPoints,
    sourcemap: config.sourcemap ?? "inline",
  };

  if (outfile) {
    options.outfile = outfile;
  } else if (outdir) {
    options.outdir = outdir;
  }

  const optionalProps = [
    "platform",
    "format",
    "bundle",
    "minify",
    "jsx",
    "jsxImportSource",
    "conditions",
    "external",
    "drop",
    "write",
    "legalComments",
    "keepNames",
    "loader",
    "alias",
    "inject",
    "target",
    "charset",
    "logLevel",
    "plugins",
  ];

  for (const prop of optionalProps) {
    // deno-lint-ignore no-explicit-any
    if ((config as any)[prop] !== undefined) {
      // deno-lint-ignore no-explicit-any
      options[prop] = (config as any)[prop];
    }
  }

  if (config.banner !== undefined) {
    const banner: { js?: string; css?: string } = {};
    if (config.banner.js !== undefined) {
      banner.js = config.banner.js
        .replaceAll("__APP_VERSION__", appVersion,)
        .replaceAll(defineVersionKey, appVersion,);
    }
    if (config.banner.css !== undefined) {
      banner.css = config.banner.css
        .replaceAll("__APP_VERSION__", appVersion,)
        .replaceAll(defineVersionKey, appVersion,);
    }
    if (banner.js !== undefined || banner.css !== undefined) {
      options.banner = banner;
    }
  }

  if (config.footer !== undefined) {
    const footer: { js?: string; css?: string } = {};
    if (config.footer.js !== undefined) {
      footer.js = config.footer.js
        .replaceAll("__APP_VERSION__", appVersion,)
        .replaceAll(defineVersionKey, appVersion,);
    }
    if (config.footer.css !== undefined) {
      footer.css = config.footer.css
        .replaceAll("__APP_VERSION__", appVersion,)
        .replaceAll(defineVersionKey, appVersion,);
    }
    if (footer.js !== undefined || footer.css !== undefined) {
      options.footer = footer;
    }
  }

  options.define = finalDefine;
  return options;
}

/**
 * Initializes the continuous development process (Watch) for a single target.
 * Strictly restricts execution to 1 target at a time and prevents simultaneous instances via lock.
 *
 * @param options Watch execution options
 * @returns List containing the control handle for graceful termination
 *
 * @example
 * ```typescript
 * import { watchEngine } from "jsr:@vanaware/buildit";
 *
 * const handles = await watchEngine({
 *   config: {
 *     ui: {
 *       entryPoints: ["packages/ui/src/main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   target: "ui",
 * });
 * ```
 */
export async function watchEngine(
  options: WatchOptions,
): Promise<WatchHandle[]> {
  const configs = options.config;
  const baseDir = options.baseDir ?? ".";
  const denoJsoncPath = options.denoJsoncPath ?? join(baseDir, "deno.jsonc",);
  const version = await readProjectVersion(denoJsoncPath, baseDir,);

  if (options.versionPaths && options.versionPaths.length > 0) {
    await ensureVersionFiles(
      options.versionPaths,
      baseDir,
      options.defineVersionString ?? "__APP_VERSION__",
    );
  }

  // 1. Target resolution: if provided use options.target, else execute the first default
  let targetName: string;
  const configKeys = Object.keys(configs,);
  const requestedTarget = options.target;

  if (requestedTarget) {
    const matchingKey = configKeys.find(
      (k,) => k.toLowerCase() === requestedTarget.toLowerCase(),
    );
    if (!matchingKey || !configs[matchingKey]) {
      throw new Error(
        `❌ Target '${requestedTarget}' not found in watch configuration. Available targets: ${
          configKeys.join(", ",)
        }.`,
      );
    }
    targetName = matchingKey;
  } else {
    // If no literal is passed, seek the first one with default !== false
    const defaultTargets = configKeys.filter(
      (k,) => configs[k]?.default !== false,
    );

    const firstDefault = defaultTargets[0];
    if (!firstDefault) {
      if (!options.silent) {
        console.warn("⚠️ No targets configured for watch.",);
      }
      return [];
    }

    targetName = firstDefault;
  }

  const targetConfig = configs[targetName];
  if (!targetConfig) {
    return [];
  }

  const resolvedConfig: WatchTargetConfig = {
    ...targetConfig,
    srcdir: resolveWithBase(targetConfig.srcdir, baseDir,),
    distdir: resolveWithBase(targetConfig.distdir, baseDir,),
  };

  validateTargetConfig(targetName, resolvedConfig,);

  // 3. Concurrency blocking: acquire watch lock
  const releaseLock = await acquireWatchLock(
    baseDir,
    targetName,
    options.lockFile,
  );

  try {
    if (!options.silent) {
      console.log(`\n👀 Starting Watch: ${targetName.toUpperCase()}`,);
    }

    if (resolvedConfig.clean && resolvedConfig.distdir) {
      await cleanTarget(resolvedConfig.distdir, resolvedConfig.clean,);
    }

    await copyStaticFiles(
      resolvedConfig,
      version,
      baseDir,
      resolvedConfig.distdir,
    );

    const listFn = resolvedConfig.defineAssetsString ? listAssetsForCache : undefined;
    const esbuildOptions = await buildWatchEsbuildOptions(
      targetName,
      resolvedConfig,
      version,
      listFn,
      options.defineVersionString,
    );

    esbuildOptions.plugins = [
      ...(esbuildOptions.plugins || []),
      denoPlugin({ configPath: denoJsoncPath, },),
    ];

    const ctx = await esbuild.context(esbuildOptions,);
    await ctx.watch();

    if (!options.silent) {
      console.log(
        `✅ [${targetName}] Monitoring changes in real-time...`,
      );
      const resolvedOutfile = esbuildOptions.outfile ||
        (resolvedConfig.distdir ? `${resolvedConfig.distdir}/` : "disk");
      console.log(`📦 Output: ${resolvedOutfile}`,);
    }

    const handle: WatchHandle = {
      target: targetName,
      close: async () => {
        try {
          await ctx.dispose();
        } finally {
          await releaseLock();
        }
      },
    };

    return [handle,];
  } catch (error) {
    await releaseLock();
    throw error;
  }
}

````

---

## File: `packages/utils/src/watch/lock.ts`

```ts
/**
 * @module @vanaware/buildit/watch/lock
 * @description Concurrency control and Lock mechanism to prevent simultaneous Watch mode instances.
 */

import { join, } from "@std/path";

/** Data structure stored in the Watch lock file */
import { WatchLockData, } from "../tools/interfaces.ts";

/**
 * Checks if a process with the given PID is still running in the operating system.
 *
 * @param pid Process ID to check
 * @returns `true` if the process is active, `false` otherwise
 */
export function isProcessRunning(pid: number,): boolean {
  if (pid <= 0) return false;
  if (pid === Deno.pid) return true;

  try {
    if (Deno.build.os === "linux") {
      try {
        Deno.statSync(`/proc/${pid}`,);
        return true;
      } catch {
        return false;
      }
    }

    const cmd = new Deno.Command("kill", {
      args: ["-0", String(pid,),],
      stdout: "null",
      stderr: "null",
    },);
    const res = cmd.outputSync();
    return res.success;
  } catch {
    return false;
  }
}

/**
 * Tries to acquire an exclusive lock for Watch execution.
 * Throws an error if another watch process is already active.
 *
 * @param baseDir Project base directory
 * @param target Name of the target being executed
 * @param customLockPath Optional custom path for the lock file
 * @returns Async function to release the lock
 */
export async function acquireWatchLock(
  baseDir: string,
  target: string,
  customLockPath?: string,
): Promise<() => Promise<void>> {
  const lockPath = customLockPath ?? join(baseDir, ".buildit-watch.lock",);

  // 1. Check if a lock file already exists
  try {
    const existingContent = await Deno.readTextFile(lockPath,);
    const existingLock = JSON.parse(existingContent,) as WatchLockData;

    if (existingLock && typeof existingLock.pid === "number") {
      if (isProcessRunning(existingLock.pid,)) {
        throw new Error(
          `❌ A watch instance is already running (PID: ${existingLock.pid}, Target: "${existingLock.target}", Started at: ${existingLock.startedAt}). Terminate the previous process to avoid conflicts.`,
        );
      } else {
        // Previous process died without cleaning the lock (orphan)
        try {
          await Deno.remove(lockPath,);
        } catch {
          // Ignore error if another process removed it already
        }
      }
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.includes("A watch instance is already running",)
    ) {
      throw err;
    }
    // File doesn't exist or JSON is corrupted, can proceed
  }

  // 2. Write new lock
  const lockData: WatchLockData = {
    pid: Deno.pid,
    target,
    startedAt: new Date().toISOString(),
    baseDir,
  };

  await Deno.writeTextFile(lockPath, JSON.stringify(lockData, null, 2,),);

  // 3. Prepare secure lock release
  let released = false;
  const release = async (): Promise<void> => {
    if (released) return;
    released = true;
    try {
      const currentContent = await Deno.readTextFile(lockPath,);
      const currentLock = JSON.parse(currentContent,) as WatchLockData;
      if (currentLock.pid === Deno.pid) {
        await Deno.remove(lockPath,);
      }
    } catch {
      // Ignore errors if the file has already been removed
    }
  };

  // Ensure release on process exit
  const unloadHandler = () => {
    try {
      const currentContent = Deno.readTextFileSync(lockPath,);
      const currentLock = JSON.parse(currentContent,) as WatchLockData;
      if (currentLock.pid === Deno.pid) {
        Deno.removeSync(lockPath,);
      }
    } catch {
      // Ignore errors
    }
  };

  globalThis.addEventListener("unload", unloadHandler, { once: true, },);

  return release;
}

```

---

## File: `packages/utils/src/watch/mod.ts`

````ts
/**
 * @module @vanaware/buildit/watch
 * @description Continuous development module (Watch) for Deno and Preact.
 *
 * @example
 * ```typescript
 * import { watchEngine } from "jsr:@vanaware/buildit";
 *
 * const handles = await watchEngine({
 *   config: {
 *     ui: {
 *       entryPoints: ["main.tsx"],
 *       distdir: "dist",
 *     },
 *   },
 *   target: "ui",
 * });
 * ```
 */

export { watchEngine, } from "./engine.ts";

export { 
  WATCH_CONFIG_EXAMPLE as watchExample, 
  loadWatchConfig
} from "./config.ts";

export type {
  WatchHandle,
  WatchLockData,
  WatchOptions,
  WatchTargetConfig,
} from "../tools/interfaces.ts";

````

---

## File: `packages/utils/tests/bdd_example_test.ts`

```ts
/**
 * @buildit/packages/utils/tests/bdd_example_test.ts
 *
 * Example of BDD style usage (describe/it) with @std/testing/bdd,
 * as defined in ADR 008.
 */

import { assert, assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";

describe("bdd_example", () => {
  it("should pass with a simple assertion", () => {
    assertEquals(1 + 1, 2,);
  });

  it("should fail correctly when condition is not met", () => {
    // This test demonstrates that the BDD framework works as expected.
    const value = "buildit";
    assert(value.length > 0,);
  });
});

```

---

## File: `packages/utils/tests/config/cli-flags.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";
import { resolveTargetOrder, } from "../../src/tools/targets.ts";
import type { GlobalTargetConfig, } from "../../src/tools/interfaces.ts";

describe("parseArgs and resolveTargetOrder", () => {
  const config: GlobalTargetConfig = {
    ui: {
      entryPoints: ["main.tsx",],
      srcdir: "src",
      distdir: "dist",
      default: true,
    },
    sw: {
      entryPoints: ["sw.ts",],
      srcdir: "src",
      distdir: "dist",
      default: false,
    },
    worker: {
      entryPoints: ["worker.ts",],
      srcdir: "src",
      distdir: "dist",
      default: true,
    },
  };

  it("parseArgs should extract rawTargets and detect noversion", () => {
    const res = parseArgs(["noversion", "ui",],);
    assertEquals(res.targets, ["ui",],);
    assertEquals(res.globalNoVersion, true,);
  });

  it("resolveTargetOrder should use default targets if none are specified", () => {
    const { targets, } = parseArgs([],);
    const resolved = resolveTargetOrder(config, targets,);
    assertEquals(resolved, ["ui", "worker",],);
  });

  it("resolveTargetOrder should respect config order regardless of args order", () => {
    const { targets, } = parseArgs(["sw", "ui",],);
    const resolved = resolveTargetOrder(config, targets,);
    assertEquals(resolved, ["ui", "sw",],);
  });
});

```

---

## File: `packages/utils/tests/config/version.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertThrows, } from "@std/assert";
import { join, } from "@std/path";
import {
  ensureVersionFile,
  ensureVersionFiles,
  formatVersion,
  incrementProjectVersion,
  parseVersion,
  readProjectVersion,
  updateProjectVersion,
} from "../../src/tools/version.ts";

describe("version utils", () => {
  describe("parseVersion and formatVersion", () => {
    it("should parse valid semantic versions", () => {
      const parsed = parseVersion("1.2.3#abc",);
      assertEquals(parsed, { major: 1, minor: 2, patch: 3, },);
    });

    it("should format components into semantic format", () => {
      const formatted = formatVersion(1, 2, 4, "hash123",);
      assertEquals(formatted, "1.2.4#hash123",);
    });

    it("should reject invalid versions", () => {
      assertThrows(() => {
        parseVersion("invalid",);
      },);
    });
  });

  describe("readProjectVersion", () => {
    it("should read version from root deno.jsonc", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "0.5.0", },),
      );

      const ver = await readProjectVersion(denoJsonc,);
      assertEquals(ver, "0.5.0",);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("ensureVersionFile and ensureVersionFiles", () => {
    it("should create file with __APP_VERSION__ template if not existing", async () => {
      const tempDir = await Deno.makeTempDir();
      const targetPath = join(tempDir, "pkg", "version.ts",);

      const created = await ensureVersionFile(targetPath,);
      assertEquals(created, true,);

      const content = await Deno.readTextFile(targetPath,);
      assertEquals(content.includes("__APP_VERSION__",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should NOT overwrite file if it already exists", async () => {
      const tempDir = await Deno.makeTempDir();
      const targetPath = join(tempDir, "version.ts",);

      await Deno.writeTextFile(targetPath, "// custom version file content",);

      const created = await ensureVersionFile(targetPath,);
      assertEquals(created, false,);

      const content = await Deno.readTextFile(targetPath,);
      assertEquals(content, "// custom version file content",);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("updateProjectVersion and versionPaths", () => {
    it("should respect noversion option and ensure versionPaths", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "1.0.0", },),
      );

      const ver = await updateProjectVersion({
        denoJsonPath: denoJsonc,
        noversion: true,
        versionPaths: [join(tempDir, "version.ts",),],
      },);

      assertEquals(ver, "1.0.0",);
      const generated = await Deno.readTextFile(join(tempDir, "version.ts",),);
      assertEquals(generated.includes("__APP_VERSION__",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should increment version and create multiple versionPaths if not existing", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ version: "1.0.0", },),
      );

      const path1 = join(tempDir, "pkg1", "version.ts",);
      const path2 = join(tempDir, "pkg2",); // directory

      const ver = await updateProjectVersion({
        denoJsonPath: denoJsonc,
        noversion: false,
        buildHash: "fixedhash",
        versionPaths: [path1, path2,],
      },);

      assertEquals(ver, "1.0.1#fixedhash",);

      const file1 = await Deno.readTextFile(path1,);
      const file2 = await Deno.readTextFile(join(path2, "version.ts",),);

      assertEquals(file1.includes("__APP_VERSION__",), true,);
      assertEquals(file2.includes("__APP_VERSION__",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should propagate version to workspaces when forcepackagesversion is true", async () => {
      const tempDir = await Deno.makeTempDir();
      const rootJson = join(tempDir, "deno.jsonc",);
      const subpkgDir = join(tempDir, "packages", "sub",);
      await Deno.mkdir(subpkgDir, { recursive: true, },);

      await Deno.writeTextFile(
        rootJson,
        JSON.stringify({
          version: "2.0.0",
          workspace: ["./packages/sub",],
        },),
      );

      const subJson = join(subpkgDir, "deno.jsonc",);
      await Deno.writeTextFile(
        subJson,
        JSON.stringify({ name: "sub", version: "2.0.0", },),
      );

      const ver = await updateProjectVersion({
        denoJsonPath: rootJson,
        noversion: false,
        buildHash: "testws",
        forcepackagesversion: true,
        versionPaths: [],
      },);

      assertEquals(ver, "2.0.1#testws",);

      const subContent = await Deno.readTextFile(subJson,);
      assertEquals(subContent.includes("2.0.1#testws",), true,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should respect customized defineVersionString when creating version.ts", async () => {
      const tempDir = await Deno.makeTempDir();
      const targetPath = join(tempDir, "version.ts",);

      await ensureVersionFile(targetPath, tempDir, "__CUSTOM_VERSION__",);
      const content = await Deno.readTextFile(targetPath,);

      assertEquals(content.includes("__CUSTOM_VERSION__",), true,);
      assertEquals(content.includes("__APP_VERSION__",), false,);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("incrementProjectVersion", () => {
    it("should read from deno.jsonc file, increment patch + 1 and save", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJsonc = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        denoJsonc,
        JSON.stringify({ name: "my-pkg", version: "1.2.3", }, null, 2,),
      );

      const newVer = await incrementProjectVersion({
        denoJsonPath: denoJsonc,
        buildHash: "hash999",
      },);

      assertEquals(newVer, "1.2.4#hash999",);

      const saved = await Deno.readTextFile(denoJsonc,);
      assertEquals(JSON.parse(saved,).version, "1.2.4#hash999",);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("should respect explicitly provided currentVersion and update deno.json", async () => {
      const tempDir = await Deno.makeTempDir();
      const denoJson = join(tempDir, "deno.json",);
      await Deno.writeTextFile(
        denoJson,
        JSON.stringify({ name: "my-pkg", version: "0.1.0", }, null, 2,),
      );

      const newVer = await incrementProjectVersion({
        baseDir: tempDir,
        denoJsonPath: denoJson,
        currentVersion: "3.4.5",
        buildHash: "xyz",
      },);

      assertEquals(newVer, "3.4.6#xyz",);

      const saved = await Deno.readTextFile(denoJson,);
      assertEquals(JSON.parse(saved,).version, "3.4.6#xyz",);

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });
});

```

---

## File: `packages/utils/tests/denobuild/denobuild-api.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { denoBuild, } from "../../src/denobuild/engine.ts";

describe("denoBuild programmatic API", () => {
  it("should accept DenoBundleGlobalConfig object directly in memory", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    const distDir = join(tempDir, "dist",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    // Create entrypoint
    await Deno.writeTextFile(
      join(srcDir, "main.ts",),
      'export const version = "test";',
    );

    const config = {
      app: {
        entryPoints: ["main.ts",],
        srcdir: srcDir,
        distdir: distDir,
        platform: "browser" as const,
        format: "esm" as const,
      },
    };

    // Add deno.jsonc to avoid required version error
    const denoJsonc = join(tempDir, "deno.jsonc",);
    await Deno.writeTextFile(
      denoJsonc,
      JSON.stringify({ version: "1.0.0", },),
    );

    const results = await denoBuild({
      config,
      targets: ["app",],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      noversion: true,
      silent: true,
    },);

    assertEquals(results.length, 1,);
    assertEquals(results[0]?.target, "app",);
    assertEquals(results[0]?.success, true,);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});

```

---

## File: `packages/utils/tests/denobuild/denobuild.test.ts`

```ts
/**
 * @file denobuild.test.ts
 * @description BDD unit tests for denobuild configuration logic and utilities.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { buildBundleOptions, } from "../../src/denobuild/bundle.ts";
import { applyDefines, } from "../../src/tools/paths.ts";
import { DENOBUILD_CONFIG_EXAMPLE, } from "../../src/denobuild/config.ts";
import { withFileStructure, } from "../helpers/fixtures.ts";

describe("denobuild - applyDefines", () => {
  it("should replace simple identifiers", () => {
    const code = "const version = __APP_VERSION__;";
    const defines = { "__APP_VERSION__": '"1.2.3"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, 'const version = "1.2.3";',);
  });

  it("should replace multiple identifiers", () => {
    const code = "if (__DEBUG__) console.log(__MSG__);";
    const defines = { "__DEBUG__": "true", "__MSG__": '"hello"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, 'if (true) console.log("hello");',);
  });

  it("should handle special characters in keys", () => {
    const code = "process.env.NODE_ENV";
    const defines = { "process.env.NODE_ENV": '"production"', };
    const result = applyDefines(code, defines,);
    assertEquals(result, '"production"',);
  });
});

describe("denobuild - buildBundleOptions", () => {
  it("should generate basic options from configuration", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "src/main.tsx": "export const test = 1;",
    },);
    try {
      const config = {
        ...DENOBUILD_CONFIG_EXAMPLE.ui!,
        srcdir: join(dir, "src",),
      };
      const options = buildBundleOptions(config,);

      assertEquals(options.minify, false,);
      assertEquals(options.platform, "browser",);
      assertEquals(options.format, "esm",);
      assertEquals(options.write, false,);
    } finally {
      await cleanup();
    }
  });
});

```

---

## File: `packages/utils/tests/esbuild/cli.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";

describe("parseArgs", () => {
  it("should return empty targets and noversion false when called without arguments", () => {
    const result = parseArgs([],);
    assertEquals(result.targets, [],);
    assertEquals(result.globalNoVersion, false,);
  });

  it("should extract provided targets without noversion", () => {
    const result = parseArgs(["ui", "admin",],);
    assertEquals(result.targets, ["ui", "admin",],);
    assertEquals(result.globalNoVersion, false,);
  });

  it("should detect standalone noversion flag in positional arguments", () => {
    const result = parseArgs(["noversion",],);
    assertEquals(result.targets, [],);
    assertEquals(result.globalNoVersion, true,);
  });

  it("should combine specific targets and filter out the noversion flag", () => {
    const result = parseArgs(["ui", "noversion",],);
    assertEquals(result.targets, ["ui",],);
    assertEquals(result.globalNoVersion, true,);
  });

  it("should respect Cliffy's noversion option", () => {
    const result = parseArgs(["ui",], { noversion: true, },);
    assertEquals(result.targets, ["ui",],);
    assertEquals(result.globalNoVersion, true,);
  });
});

```

---

## File: `packages/utils/tests/esbuild/esbuild-api.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { parseArgs, } from "../../src/tools/cli-flags.ts";
import { resolveTargetOrder, } from "../../src/tools/targets.ts";

describe("esbuild API & CLI flags integration", () => {
  it("should integrate CLI flags with parseArgs and resolveTargetOrder", () => {
    const config = {
      ui: {
        entryPoints: ["main.tsx",],
        srcdir: "src",
        distdir: "dist",
      },
    };

    const rawArgs = ["ui", "noversion",];
    const parsed = parseArgs(rawArgs,);
    const resolvedTargets = resolveTargetOrder(config, parsed.targets,);

    assertEquals(resolvedTargets, ["ui",],);
    assertEquals(parsed.globalNoVersion, true,);
  });
});

```

---

## File: `packages/utils/tests/esbuild/esbuild-options.test.ts`

```ts
/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import { buildEsbuildOptions, } from "../../src/esbuild/engine.ts";
import type { TargetConfig, } from "../../src/tools/interfaces.ts";
import { withFileStructure, } from "../helpers/fixtures.ts";

// Helper to create minimal valid config with existing paths
function makeConfig(
  dir: string,
  overrides: Partial<TargetConfig> = {},
): TargetConfig {
  return {
    srcdir: join(dir, "src",),
    distdir: "dist",
    entryPoints: ["main.tsx",],
    ...overrides,
  } as TargetConfig;
}

describe("buildEsbuildOptions", () => {
  describe("basic configuration", () => {
    it("uses outfile when defined", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { outfile: "app.js", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.outfile, "dist/app.js",);
        assertEquals(options.outdir, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("uses distdir as outdir when outfile is not defined", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { distdir: "monorepo/dist", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.outdir, "monorepo/dist",);
        assertEquals(options.outfile, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("entryPoints is always preserved", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/a.ts": "",
        "src/b.ts": "",
      },);
      try {
        const config = makeConfig(dir, { entryPoints: ["a.ts", "b.ts",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.entryPoints, [
          join(dir, "src", "a.ts",),
          join(dir, "src", "b.ts",),
        ],);
      } finally {
        await cleanup();
      }
    });
  });
  describe("optional properties", () => {
    it("includes platform when defined", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { platform: "browser", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.platform, "browser",);
      } finally {
        await cleanup();
      }
    });
    it("omits undefined properties", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.platform, undefined,);
        assertEquals(options.minify, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("includes all configured properties", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          platform: "browser",
          format: "esm",
          bundle: true,
          minify: true,
          sourcemap: "linked",
          target: "es2022",
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.platform, "browser",);
        assertEquals(options.format, "esm",);
        assertEquals(options.bundle, true,);
        assertEquals(options.minify, true,);
        assertEquals(options.sourcemap, "linked",);
        assertEquals(options.target, "es2022",);
      } finally {
        await cleanup();
      }
    });
  });
  describe("define", () => {
    it("injects __APP_VERSION__ with v prefix", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("ui", config, "1.2.3-abc",);
        assertEquals(options.define.__APP_VERSION__, '"v1.2.3-abc"',);
      } finally {
        await cleanup();
      }
    });
    it("preserves custom defines from config", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          define: {
            "__FEATURE_X__": "true",
            "__API_URL__": '"https://api.example.com"',
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.define.__FEATURE_X__, "true",);
        assertEquals(options.define.__API_URL__, '"https://api.example.com"',);
        assertEquals(options.define.__APP_VERSION__, '"v1.0.0"',);
      } finally {
        await cleanup();
      }
    });
  });
  describe("banner and footer", () => {
    it("replaces __APP_VERSION__ in banner", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: {
            js: "/* BuildIt v__APP_VERSION__ */\n",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "2.0.0",);
        assertStringIncludes(options.banner.js, "BuildIt v2.0.0",);
      } finally {
        await cleanup();
      }
    });
    it("replaces multiple occurrences of __APP_VERSION__", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: {
            js: "/* __APP_VERSION__ build __APP_VERSION__ */",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.banner.js.includes("__APP_VERSION__",), false,);
      } finally {
        await cleanup();
      }
    });
    it("replaces __APP_VERSION__ in CSS too", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: {
            css: "/* CSS __APP_VERSION__ */",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertStringIncludes(options.banner.css, "CSS 1.0.0",);
      } finally {
        await cleanup();
      }
    });
    it("replaces __APP_VERSION__ in footer", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          footer: {
            js: "/* End __APP_VERSION__ */",
          },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertStringIncludes(options.footer.js, "End 1.0.0",);
      } finally {
        await cleanup();
      }
    });
    it("handles banner without js", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          banner: { css: "/* css only __APP_VERSION__ */", },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.banner.js, undefined,);
        assertStringIncludes(options.banner.css, "1.0.0",);
      } finally {
        await cleanup();
      }
    });
  });
  describe("defineVersionString and defineAssetsString logic", () => {
    it("injects custom version define when defineVersionString is provided as global parameter", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions(
          "ui",
          config,
          "1.0.0",
          undefined,
          "CUSTOM_GLOBAL_VERSION",
        );
        assertEquals(options.define.CUSTOM_GLOBAL_VERSION, '"v1.0.0"',);
        assertEquals(options.define.__APP_VERSION__, undefined,);
      } finally {
        await cleanup();
      }
    });

    it("injects __APP_VERSION__ by default when defineVersionString is not provided", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions(
          "ui",
          config,
          "1.0.0",
        );
        assertEquals(options.define.__APP_VERSION__, '"v1.0.0"',);
      } finally {
        await cleanup();
      }
    });

    it("injects assets listed via listAssetsFn when defineAssetsString is configured", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          distdir: dir,
          defineAssetsString: "__MOCK_ASSETS__",
        },);
        const mockListFn = () => Promise.resolve(["app.js", "style.css",],);
        const options = await buildEsbuildOptions(
          "ui",
          config,
          "1.0.0",
          mockListFn,
        );
        assertEquals(
          options.define.__MOCK_ASSETS__,
          JSON.stringify(["app.js", "style.css",],),
        );
      } finally {
        await cleanup();
      }
    });
  });
  describe("new options (1-13)", () => {
    it("includes splitting", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { splitting: true, },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.splitting, true,);
      } finally {
        await cleanup();
      }
    });
    it("includes custom loader", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          loader: { ".png": "file", ".svg": "dataurl", },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.loader[".png"], "file",);
      } finally {
        await cleanup();
      }
    });
    it("includes alias", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          alias: { "@": "./src", "moment": "dayjs", },
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.alias["@"], "./src",);
        assertEquals(options.alias.moment, "dayjs",);
      } finally {
        await cleanup();
      }
    });
    it("includes inject", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          inject: ["./polyfills.ts",],
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.inject, ["./polyfills.ts",],);
      } finally {
        await cleanup();
      }
    });
    it("includes target as string", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { target: "es2022", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.target, "es2022",);
      } finally {
        await cleanup();
      }
    });
    it("includes target as array", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { target: ["es2022", "chrome90",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.target, ["es2022", "chrome90",],);
      } finally {
        await cleanup();
      }
    });
    it("includes drop", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { drop: ["console", "debugger",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.drop, ["console", "debugger",],);
      } finally {
        await cleanup();
      }
    });
    it("includes pure", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { pure: ["console.log",], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.pure, ["console.log",],);
      } finally {
        await cleanup();
      }
    });
    it("includes logLevel", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { logLevel: "warning", },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.logLevel, "warning",);
      } finally {
        await cleanup();
      }
    });
    it("includes entryNames/chunkNames/assetNames", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, {
          entryNames: "[name]-[hash]",
          chunkNames: "chunks/[name]",
          assetNames: "assets/[name]",
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.entryNames, "[name]-[hash]",);
        assertEquals(options.chunkNames, "chunks/[name]",);
        assertEquals(options.assetNames, "assets/[name]",);
      } finally {
        await cleanup();
      }
    });
  });
  describe("plugins", () => {
    it("includes plugins when defined in config", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const mockPlugin = { name: "test-plugin", setup: () => {}, };
        const config = makeConfig(dir, { plugins: [mockPlugin,], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, [mockPlugin,],);
        assertEquals(options.plugins.length, 1,);
        assertEquals(options.plugins[0].name, "test-plugin",);
      } finally {
        await cleanup();
      }
    });
    it("includes multiple plugins in defined order", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const plugin1 = { name: "plugin-1", setup: () => {}, };
        const plugin2 = { name: "plugin-2", setup: () => {}, };
        const config = makeConfig(dir, { plugins: [plugin1, plugin2,], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins.length, 2,);
        assertEquals(options.plugins[0].name, "plugin-1",);
        assertEquals(options.plugins[1].name, "plugin-2",);
      } finally {
        await cleanup();
      }
    });
    it("omits plugins when not defined (undefined)", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir,);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, undefined,);
      } finally {
        await cleanup();
      }
    });
    it("omits plugins when empty array", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const config = makeConfig(dir, { plugins: [], },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, [],);
      } finally {
        await cleanup();
      }
    });
    it("plugins are independent of other options", async () => {
      const { dir, cleanup, } = await withFileStructure({
        "src/main.tsx": "",
      },);
      try {
        const mockPlugin = { name: "my-plugin", setup: () => {}, };
        const config = makeConfig(dir, {
          plugins: [mockPlugin,],
          platform: "browser",
          bundle: true,
          minify: true,
        },);
        const options = await buildEsbuildOptions("ui", config, "1.0.0",);
        assertEquals(options.plugins, [mockPlugin,],);
        assertEquals(options.platform, "browser",);
        assertEquals(options.bundle, true,);
        assertEquals(options.minify, true,);
      } finally {
        await cleanup();
      }
    });
  });
});

```

---

## File: `packages/utils/tests/esbuild/esbuild.test.ts`

```ts
/**
 * @file esbuild.test.ts
 * @description BDD unit tests for esbuild configuration logic and utilities.
 */

import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { formatVersion, parseVersion, } from "../../src/tools/version.ts";
import { isSafePath, resolveOutputPaths, } from "../../src/tools/paths.ts";
import { ESBUILD_CONFIG_EXAMPLE, } from "../../src/esbuild/config.ts";

describe("esbuild - versioning", () => {
  it("should parse semantic version with hash", () => {
    const v = parseVersion("1.2.3#hash",);
    assertEquals(v.major, 1,);
    assertEquals(v.minor, 2,);
    assertEquals(v.patch, 3,);
  });

  it("should format version correctly", () => {
    const v = formatVersion(0, 3, 8, "test",);
    assertEquals(v, "0.3.8#test",);
  });
});

describe("esbuild - paths", () => {
  it("should validate safe paths", () => {
    assert(isSafePath("dist/output.js",),);
    assert(!isSafePath("../secret.js",),);
    assert(!isSafePath("/etc/passwd",),);
  });

  it("should resolve output paths correctly", () => {
    const config = {
      outfile: "bundle.js",
      distdir: "dist",
      entryPoints: ["main.ts",],
    };
    const resolved = resolveOutputPaths(config,);
    assertEquals(resolved.outfile, "dist/bundle.js",);
  });
});

describe("esbuild - config", () => {
  it("should have a valid configuration example", () => {
    assert(ESBUILD_CONFIG_EXAMPLE.ui !== undefined,);
    assertEquals(ESBUILD_CONFIG_EXAMPLE.ui!.default, true,);
  });
});

```

---

## File: `packages/utils/tests/esbuild/filesystem.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import {
  cleanTarget,
  copyStaticFiles,
  listAssetsForCache,
} from "../../src/tools/paths.ts";
import {
  fileExists,
  listFiles,
  readText,
  withFileStructure,
  withTempDir,
} from "../helpers/fixtures.ts";

describe("cleanTarget", () => {
  it("removes specific file", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "teste.js",), "code",);
      assertEquals(await fileExists(join(dir, "teste.js",),), true,);

      await cleanTarget(dir, ["teste.js",],);

      assertEquals(await fileExists(join(dir, "teste.js",),), false,);
    },);
  });

  it("removes folder recursively", async () => {
    await withTempDir(async (dir,) => {
      const subDir = join(dir, "subpasta",);
      await Deno.mkdir(subDir,);
      await Deno.writeTextFile(join(subDir, "arquivo.js",), "code",);

      await cleanTarget(dir, ["subpasta",],);

      assertEquals(await fileExists(subDir,), false,);
    },);
  });

  it("empties directory with '*'", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "a.js",), "a",);
      await Deno.writeTextFile(join(dir, "b.js",), "b",);
      await Deno.mkdir(join(dir, "sub",),);
      await Deno.writeTextFile(join(dir, "sub/c.js",), "c",);

      await cleanTarget(dir, ["*",],);

      const files = await listFiles(dir,);
      assertEquals(files.length, 0,);
    },);
  });

  it("ignores path traversal (..)", async () => {
    await withTempDir(async (dir,) => {
      // Create file outside dir that should not be removed
      const outsideFile = join(dir, "..", "protegido.txt",);
      try {
        await Deno.writeTextFile(outsideFile, "do not remove me",);
      } catch {
        // Can fail if no permissions
      }

      await cleanTarget(dir, ["../protegido.txt",],);

      // The file outside the dir should still exist (if created)
      try {
        assertEquals(await fileExists(outsideFile,), true,);
        await Deno.remove(outsideFile,);
      } catch {
        // If could not create, ok
      }
    },);
  });

  it("ignores absolute paths", async () => {
    await withTempDir(async (dir,) => {
      // Should not throw error or remove anything
      await cleanTarget(dir, ["/etc/passwd", "/tmp/test",],);
      assertEquals(true, true,);
    },);
  });

  it("does not throw error for non-existent file", async () => {
    await withTempDir(async (dir,) => {
      await cleanTarget(dir, ["nao-existe.js",],);
      assertEquals(true, true,);
    },);
  });

  it("empty list does nothing", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "keep.js",), "keep",);
      await cleanTarget(dir, [],);
      assertEquals(await fileExists(join(dir, "keep.js",),), true,);
    },);
  });

  it("processes multiple paths at once", async () => {
    await withTempDir(async (dir,) => {
      await Deno.writeTextFile(join(dir, "a.js",), "a",);
      await Deno.writeTextFile(join(dir, "b.js",), "b",);
      await Deno.writeTextFile(join(dir, "c.js",), "c",);

      await cleanTarget(dir, ["a.js", "c.js",],);

      assertEquals(await fileExists(join(dir, "a.js",),), false,);
      assertEquals(await fileExists(join(dir, "b.js",),), true,);
      assertEquals(await fileExists(join(dir, "c.js",),), false,);
    },);
  });
});

describe("listAssetsForCache", () => {
  it("lists files in simple structure", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "style.css": "css",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 2,);
      assertEquals(assets.includes("./app.js",), true,);
      assertEquals(assets.includes("./style.css",), true,);
    } finally {
      await cleanup();
    }
  });

  it("excludes .map files", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "app.js.map": "map",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 1,);
      assertEquals(assets[0], "./app.js",);
    } finally {
      await cleanup();
    }
  });

  it("excludes metafile.json", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "ui-metafile.json": "{}",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 1,);
    } finally {
      await cleanup();
    }
  });

  it("excludes service-worker.js by default", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "service-worker.js": "sw code",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.includes("./service-worker.js",), false,);
      assertEquals(assets.length, 1,);
    } finally {
      await cleanup();
    }
  });

  it("accepts custom exclusion list", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "temp.js": "temp",
      "debug.js": "debug",
    },);

    try {
      const assets = await listAssetsForCache(dir, ["temp.js", "debug.js",],);
      assertEquals(assets.length, 1,);
      assertEquals(assets[0], "./app.js",);
    } finally {
      await cleanup();
    }
  });

  it("handles subdirectories", async () => {
    const { dir, cleanup, } = await withFileStructure({
      "app.js": "code",
      "assets/logo.png": "png",
      "assets/icons/favicon.ico": "ico",
    },);

    try {
      const assets = await listAssetsForCache(dir,);
      assertEquals(assets.length, 3,);
      // Must contain relative paths
      const hasLogo = assets.some((a,) => a.includes("logo.png",));
      const hasIcon = assets.some((a,) => a.includes("favicon.ico",));
      assertEquals(hasLogo, true,);
      assertEquals(hasIcon, true,);
    } finally {
      await cleanup();
    }
  });
});

describe("copyStaticFiles", () => {
  it("copies files via copyFiles", async () => {
    const { dir: publicDir, cleanup: cleanupPublic, } = await withFileStructure(
      {
        "manifest.json": `{ "name": "BuildIt", "version": "1.0.0" }`,
        "icon.png": "png",
      },
    );

    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        distdir: distDir,
        copyFiles: [{ basedir: publicDir, },],
        entryPoints: [],
      };

      await copyStaticFiles(config, "2.0.0",);

      // Files were copied
      assertEquals(await fileExists(join(distDir, "manifest.json",),), true,);
      assertEquals(await fileExists(join(distDir, "icon.png",),), true,);

      // manifest.json was updated
      const manifest = JSON.parse(
        await readText(join(distDir, "manifest.json",),),
      );
      assertEquals(manifest.version, "2.0.0",);
    } finally {
      await cleanupPublic();
      await cleanupDist();
    }
  });

  it("copies specific files via copyFiles", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "index.html": "<html></html>",
      "README.md": "docs",
    },);

    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );

    try {
      const config = {
        distdir: distDir,
        copyFiles: [
          {
            basedir: srcDir,
            includes: ["index.html",],
          },
        ],
        entryPoints: [],
      };

      await copyStaticFiles(config, "1.0.0",);

      assertEquals(await fileExists(join(distDir, "index.html",),), true,);
      assertEquals(await fileExists(join(distDir, "README.md",),), false,);
      const content = await readText(join(distDir, "index.html",),);
      assertEquals(content, "<html></html>",);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("does not fail when baseDir of copyFiles does not exist", async () => {
    const { dir: distDir, cleanup, } = await withFileStructure({},);

    try {
      const config = {
        distdir: distDir,
        copyFiles: [{ basedir: "/caminho/inexistente", },],
        entryPoints: [],
      };

      // Should not throw error
      await copyStaticFiles(config, "1.0.0",);
      assertEquals(true, true,);
    } finally {
      await cleanup();
    }
  });
});

```

---

## File: `packages/utils/tests/esbuild/integration.test.ts`

```ts
/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import { processTarget, } from "../../src/esbuild/engine.ts";
import type { TargetConfig, } from "../../src/tools/interfaces.ts";
import {
  fileExists,
  readText,
  withFileStructure,
} from "../helpers/fixtures.ts";

describe("processTarget (integration)", () => {
  it("executes complete pipeline: clean, copy, build", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "index.html": "<html></html>",
      "dummy.ts": "// dummy",
    },);
    const { dir: publicDir, cleanup: cleanupPublic, } = await withFileStructure(
      {
        "manifest.json": `{ "name": "BuildIt", "version": "1.0.0" }`,
      },
    );
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure({
      "old-file.js": "should be deleted",
    },);
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        copyFiles: [
          { basedir: publicDir, },
          { basedir: srcDir, includes: ["index.html",], },
        ],
        clean: ["*",],
        entryPoints: ["dummy.ts",],
      };
      // Mock esbuild.build
      const mockBuild = (options: Record<string, unknown>,) => {
        // Simulate writing the output file
        const outFile = (options.outfile as string) ||
          join(options.outdir as string, "output.js",);
        Deno.writeTextFileSync(outFile, "// bundled code",);
        return Promise.resolve({ metafile: null, errors: [], warnings: [], },);
      };
      await processTarget("ui", config, "2.0.0", mockBuild,);
      // Old file was removed (clean: ["*"])
      assertEquals(await fileExists(join(distDir, "old-file.js",),), false,);
      // Static files were copied
      assertEquals(await fileExists(join(distDir, "index.html",),), true,);
      assertEquals(await fileExists(join(distDir, "manifest.json",),), true,);
      // manifest.json was updated
      const manifest = JSON.parse(
        await readText(join(distDir, "manifest.json",),),
      );
      assertEquals(manifest.version, "2.0.0",);
      // Bundle was generated
      assertEquals(await fileExists(join(distDir, "output.js",),), true,);
    } finally {
      await cleanupSrc();
      await cleanupPublic();
      await cleanupDist();
    }
  });

  it("saves metafile when generated", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
        metafile: true,
      };
      const mockBuild = () =>
        Promise.resolve({
          metafile: {
            inputs: { "src/main.ts": { bytes: 100, }, },
            outputs: { "dist/main.js": { bytes: 500, }, },
          },
          errors: [],
          warnings: [],
        },);
      await processTarget("ui", config, "1.0.0", mockBuild,);
      const metafilePath = join(distDir, "ui-metafile.json",);
      assertEquals(await fileExists(metafilePath,), true,);
      const metafile = JSON.parse(await readText(metafilePath,),);
      assertEquals(metafile.inputs["src/main.ts"].bytes, 100,);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("does not save metafile when metafile is false", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
        metafile: false,
      };
      const mockBuild = () =>
        Promise.resolve({
          metafile: { inputs: {}, },
        },);
      await processTarget("ui", config, "1.0.0", mockBuild,);
      assertEquals(
        await fileExists(join(distDir, "ui-metafile.json",),),
        false,
      );
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("propagates error from esbuild.build", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
      };
      const mockBuild = () => {
        throw new Error("Build failed",);
      };
      let caughtError: Error | null = null;
      try {
        await processTarget("ui", config, "1.0.0", mockBuild,);
      } catch (error) {
        caughtError = error as Error;
      }
      assertEquals(caughtError !== null, true,);
      assertStringIncludes(caughtError!.message, "Build failed",);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("uses outfile when specified", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "dummy.ts": "// dummy",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure(
      {},
    );
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["dummy.ts",],
        outfile: "custom-name.js",
      };
      let capturedOptions: Record<string, unknown> = {};
      const mockBuild = (options: Record<string, unknown>,) => {
        capturedOptions = options;
        Deno.writeTextFileSync(options.outfile as string, "// code",);
        return Promise.resolve({ metafile: null, errors: [], warnings: [], },);
      };
      await processTarget("ui", config, "1.0.0", mockBuild,);
      assertEquals(capturedOptions.outfile, join(distDir, "custom-name.js",),);
      assertEquals(capturedOptions.outdir, undefined,);
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });

  it("handles defineAssetsString injecting assets into final file post-build", async () => {
    const { dir: srcDir, cleanup: cleanupSrc, } = await withFileStructure({
      "sw.ts": "// sw",
    },);
    const { dir: distDir, cleanup: cleanupDist, } = await withFileStructure({
      "app.js": "code",
      "index.html": "html",
      "service-worker.js": "const cache = __GENERATED_ASSETS__;",
    },);
    try {
      const config: TargetConfig = {
        srcdir: srcDir,
        distdir: distDir,
        entryPoints: ["sw.ts",],
        outfile: "service-worker.js",
        defineAssetsString: "__GENERATED_ASSETS__",
      };
      let capturedDefine: Record<string, string> = {};
      const mockBuild = (options: Record<string, unknown>,) => {
        capturedDefine = options.define as Record<string, string>;
        // Simulate esbuild behavior: substitute defines and write file
        const finalContent = "const cache = " +
          capturedDefine["__GENERATED_ASSETS__"] + ";";
        return Deno.writeTextFile(
          join(distDir, "service-worker.js",),
          finalContent,
        )
          .then(() => ({ metafile: null, errors: [], warnings: [], }));
      };
      const mockListFn = () => Promise.resolve(["./app.js", "./index.html",],);
      await processTarget("sw", config, "1.0.0", mockBuild, mockListFn,);

      assertEquals(
        capturedDefine["__GENERATED_ASSETS__"],
        JSON.stringify(["./app.js", "./index.html",],),
      );

      const swContent = await Deno.readTextFile(
        join(distDir, "service-worker.js",),
      );
      assertEquals(
        swContent,
        'const cache = ["./app.js","./index.html"];',
      );
    } finally {
      await cleanupSrc();
      await cleanupDist();
    }
  });
});

```

---

## File: `packages/utils/tests/esbuild/output-paths.test.ts`

```ts
/// <reference lib="deno.ns" />
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, assertThrows, } from "@std/assert";
import { resolveOutputPaths, } from "../../src/tools/paths.ts";
import { validateTargetConfig, } from "../../src/tools/validate.ts";
import type { TargetConfig, } from "../../src/tools/interfaces.ts";

describe("validateTargetConfig", () => {
  describe("required distdir", () => {
    it("throws error when copyFiles exists but distdir does not", () => {
      const config: TargetConfig = {
        srcdir: "src",
        copyFiles: [{ basedir: "public", },],
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("throws error when outfile does not exist and distdir does not", () => {
      const config: TargetConfig = {
        srcdir: "src",
        entryPoints: ["app.tsx",],
      };
      assertThrows(
        () => validateTargetConfig("ui", config,),
        Error,
        "'distdir'",
      );
    });
    it("DOES NOT throw error when outfile exists but distdir does not", () => {
      const config: TargetConfig = {
        srcdir: "src",
        outfile: "/absolute/path/app.js",
        entryPoints: ["app.tsx",],
      };
      // Should not throw
      validateTargetConfig("ui", config,);
    });
    it("DOES NOT throw error when distdir exists", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        entryPoints: ["app.tsx",],
      };
      validateTargetConfig("ui", config,);
    });
  });

  describe("educational error messages", () => {
    it("lists all reasons when multiple conditions fail", () => {
      const config: TargetConfig = {
        srcdir: "src",
        copyFiles: [{ basedir: "public", },],
        entryPoints: ["app.tsx",],
      };
      try {
        validateTargetConfig("ui", config,);
      } catch (e) {
        const msg = (e as Error).message;
        assertStringIncludes(msg, "'copyFiles' is configured",);
        assertStringIncludes(msg, "'outfile' is not configured",);
      }
    });
  });
});

describe("resolveOutputPaths", () => {
  describe("outfile relative to distdir", () => {
    it("performs join when both exist", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "monorepo/server/build/dist",
        outfile: "app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "monorepo/server/build/dist/app.js",);
      assertEquals(result.outdir, undefined,);
    });
    it("performs join with subdirectories", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        outfile: "js/app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "dist/js/app.js",);
    });
  });

  describe("absolute outfile (without distdir)", () => {
    it("keeps outfile as is when distdir does not exist", () => {
      const config: TargetConfig = {
        srcdir: "src",
        outfile: "/absolute/path/app.js",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, "/absolute/path/app.js",);
      assertEquals(result.outdir, undefined,);
    });
  });

  describe("distdir as outdir (without outfile)", () => {
    it("uses distdir as outdir when outfile does not exist", () => {
      const config: TargetConfig = {
        srcdir: "src",
        distdir: "dist",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outdir, "dist",);
      assertEquals(result.outfile, undefined,);
    });
  });

  describe("none configured", () => {
    it("returns empty object", () => {
      const config: TargetConfig = {
        srcdir: "src",
        entryPoints: ["app.tsx",],
      };
      const result = resolveOutputPaths(config,);
      assertEquals(result.outfile, undefined,);
      assertEquals(result.outdir, undefined,);
    });
  });
});

```

---

## File: `packages/utils/tests/esbuild/paths.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { isSafePath, } from "../../src/tools/paths.ts";

describe("isSafePath", () => {
  describe("safe paths", () => {
    const safePaths = [
      "arquivo.js",
      "pasta/arquivo.js",
      "pasta/subpasta/arquivo.js",
      ".",
      "file-with-dash.js",
      "file_with_underscore.js",
      "file.name.with.dots.js",
      "UPPERCASE.js",
      "123.js",
      "path/to/file",
    ];

    for (const path of safePaths) {
      it(`accepts "${path}"`, () => {
        assertEquals(isSafePath(path,), true,);
      });
    }
  });

  describe("blocked paths (path traversal)", () => {
    const traversalPaths = [
      "..",
      "../file.js",
      "pasta/../file.js",
      "a/b/c/../../file.js",
      "../../../etc/passwd",
      "foo..bar",
      "file..js",
    ];

    for (const path of traversalPaths) {
      it(`blocks "${path}"`, () => {
        assertEquals(isSafePath(path,), false,);
      });
    }
  });

  describe("blocked paths (Unix absolute)", () => {
    const absolutePaths = [
      "/etc/passwd",
      "/home/user",
      "/var/log/system.log",
      "/tmp/test",
    ];

    for (const path of absolutePaths) {
      it(`blocks "${path}"`, () => {
        assertEquals(isSafePath(path,), false,);
      });
    }
  });

  describe("edge cases", () => {
    it("empty string is considered safe (neither traversal nor absolute)", () => {
      assertEquals(isSafePath("",), true,);
    });

    it("path with whitespace only is safe", () => {
      assertEquals(isSafePath("   ",), true,);
    });

    it("path with special characters is safe", () => {
      assertEquals(isSafePath("file@name.js",), true,);
      assertEquals(isSafePath("file+name.js",), true,);
    });
  });
});

```

---

## File: `packages/utils/tests/esbuild/version.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
  assertThrows,
} from "@std/assert";
import {
  formatVersion,
  parseVersion,
  readProjectVersion,
  replaceVersionInContent,
  updateProjectVersion,
} from "../../src/tools/version.ts";
import { withTempDenoJsonc, } from "../helpers/fixtures.ts";

describe("parseVersion", () => {
  describe("valid cases", () => {
    const validCases = [
      { input: "1.2.3", expected: { major: 1, minor: 2, patch: 3, }, },
      { input: "0.0.0", expected: { major: 0, minor: 0, patch: 0, }, },
      { input: "99.99.99", expected: { major: 99, minor: 99, patch: 99, }, },
      {
        input: "0.2.148#msv0okam",
        expected: { major: 0, minor: 2, patch: 148, },
      },
      { input: "1.0.0#alpha", expected: { major: 1, minor: 0, patch: 0, }, },
      { input: "2.0.0#beta.1", expected: { major: 2, minor: 0, patch: 0, }, },
      {
        input: "1.0.0#alpha-beta-1",
        expected: { major: 1, minor: 0, patch: 0, },
      },
    ];
    for (const { input, expected, } of validCases) {
      it(`parses "${input}" correctly`, () => {
        assertEquals(parseVersion(input,), expected,);
      });
    }
  });
  describe("invalid cases", () => {
    const invalidCases = [
      { input: "", desc: "empty string", },
      { input: "1.2", desc: "only 2 parts", },
      { input: "1.2.3.4", desc: "4 parts", },
      { input: "a.b.c", desc: "letters", },
      { input: "1.abc.3", desc: "non-numeric part", },
      { input: "v1.2.3", desc: "v prefix", },
      { input: "1.2.3#", desc: "hash without value", },
      { input: " 1.2.3", desc: "leading space", },
      { input: "1.2.3 ", desc: "trailing space", },
    ];
    for (const { input, desc, } of invalidCases) {
      it(`throws error for ${desc} ("${input}")`, () => {
        assertThrows(() => parseVersion(input,), Error,);
      });
    }
  });
});

describe("formatVersion", () => {
  it("formats with provided hash", () => {
    assertEquals(formatVersion(1, 2, 3, "abc",), "1.2.3#abc",);
  });
  it("generates automatic hash when not provided", () => {
    const result = formatVersion(0, 2, 149,);
    assertStringIncludes(result, "0.2.149#",);
    // Hash should have at least some characters
    const hash = result.split("#",)[1];
    // 🔥 FIX: Explicit undefined handling (noUncheckedIndexedAccess)
    assertEquals(hash !== undefined && hash.length > 0, true,);
  });
  it("uses the same hash in calls with same parameters", () => {
    const hash = "fixedhash";
    assertEquals(
      formatVersion(1, 0, 0, hash,),
      formatVersion(1, 0, 0, hash,),
    );
  });
  it("handles large numbers", () => {
    assertEquals(formatVersion(999, 999, 999, "x",), "999.999.999#x",);
  });
});

describe("replaceVersionInContent", () => {
  it("replaces version preserving the rest", () => {
    const content = `{
      "name": "@buildit/app",
      "version": "1.0.0-old",
      "imports": {}
    }`;
    const result = replaceVersionInContent(content, "2.0.0-new",);
    assertStringIncludes(result, `"version": "2.0.0-new"`,);
    assertStringIncludes(result, `"name": "@buildit/app"`,);
    assertStringIncludes(result, `"imports"`,);
  });
  it("replaces only the first occurrence", () => {
    const content = `{ "version": "1.0.0", "other": "version": "2.0.0" }`;
    const result = replaceVersionInContent(content, "3.0.0",);
    // The first one should be replaced
    assertStringIncludes(result, `"version": "3.0.0"`,);
  });
});

describe("readProjectVersion (integration)", () => {
  it("reads version from existing file", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.2.3-abc",);
    try {
      const version = await readProjectVersion(path,);
      assertEquals(version, "1.2.3-abc",);
    } finally {
      await cleanup();
    }
  });
  it("throws error when file does not exist", async () => {
    await assertRejects(
      () => readProjectVersion("/path/that/does/not/exist/deno.jsonc",),
      Error,
      'Required "version" field not found',
    );
  });
  it("throws error when version is not in the file", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.0.0", {
      version: undefined,
    },);
    try {
      // Rewrite without version
      await Deno.writeTextFile(path, `{ "name": "buildit" }`,);
      await assertRejects(
        () => readProjectVersion(path,),
        Error,
        'Required "version" field not found',
      );
    } finally {
      await cleanup();
    }
  });
});

describe("updateProjectVersion (integration)", () => {
  it("increments patch and updates file", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.2.3",);
    try {
      const newVersion = await updateProjectVersion({
        currentVersion: "1.2.3",
        denoJsonPath: path,
        buildHash: "testhash",
        versionPaths: [],
      },);
      assertEquals(newVersion, "1.2.4#testhash",);
      const content = await Deno.readTextFile(path,);
      assertStringIncludes(content, `"version": "1.2.4#testhash"`,);
    } finally {
      await cleanup();
    }
  });
  it("preserves other JSON properties", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("0.0.1", {
      name: "@buildit/app",
      imports: { preact: "https://esm.sh/preact", },
    },);
    try {
      await updateProjectVersion({
        currentVersion: "0.0.1",
        denoJsonPath: path,
        buildHash: "x",
        versionPaths: [],
      },);
      const content = await Deno.readTextFile(path,);
      assertStringIncludes(content, `"name": "@buildit/app"`,);
      assertStringIncludes(content, `"preact"`,);
    } finally {
      await cleanup();
    }
  });
  it("increments multiple times", async () => {
    const { path, cleanup, } = await withTempDenoJsonc("1.0.0",);
    try {
      const v1 = await updateProjectVersion({
        currentVersion: "1.0.0",
        denoJsonPath: path,
        buildHash: "h1",
        versionPaths: [],
      },);
      assertEquals(v1, "1.0.1#h1",);
      const v2 = await updateProjectVersion({
        currentVersion: v1,
        denoJsonPath: path,
        buildHash: "h2",
        versionPaths: [],
      },);
      assertEquals(v2, "1.0.2#h2",);
      const v3 = await updateProjectVersion({
        currentVersion: v2,
        denoJsonPath: path,
        buildHash: "h3",
        versionPaths: [],
      },);
      assertEquals(v3, "1.0.3#h3",);
    } finally {
      await cleanup();
    }
  });
});

```

---

## File: `packages/utils/tests/export/export-api.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { exportEngine, } from "../../src/export/engine.ts";

describe("exportEngine programmatic API", () => {
  it("should accept configuration based on includes/excludes and perform streaming to disk", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    // Create deno.jsonc with custom project version
    const denoJsonc = join(tempDir, "deno.jsonc",);
    await Deno.writeTextFile(
      denoJsonc,
      JSON.stringify({ version: "0.9.5", },),
    );

    // Create test files
    await Deno.writeTextFile(
      join(srcDir, "sample.ts",),
      'export const hello = "world";',
    );
    await Deno.writeTextFile(join(srcDir, "ignore.test.ts",), "test",);

    const inMemoryConfig = {
      testMode: {
        outputFile: "snapshots/test-out.md",
        includes: ["src/**/*.{ts,tsx}",],
        excludes: ["**/*.test.ts",],
        includeVersion: true,
        customInstruction: "Test snapshot for AI",
        default: true,
      },
    };

    const results = await exportEngine({
      config: inMemoryConfig,
      modes: ["testMode",],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      silent: true,
    },);

    assertEquals(results.length, 1,);
    assertEquals(results[0]?.mode, "testMode",);
    assertEquals(results[0]?.files, 1,);
    assertEquals((results[0]?.bytes ?? 0) > 0, true,);

    const snapshotContent = await Deno.readTextFile(
      join(tempDir, "snapshots", "test-out.md",),
    );
    assertEquals(snapshotContent.includes("[v0.9.5]",), true,);
    assertEquals(
      snapshotContent.includes("Test snapshot for AI",),
      true,
    );
    assertEquals(
      snapshotContent.includes('export const hello = "world";',),
      true,
    );
    assertEquals(snapshotContent.includes("ignore.test.ts",), false,);

    await Deno.remove(tempDir, { recursive: true, },);
  });

  it("should export successfully using includes and globs", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    await Deno.writeTextFile(
      join(srcDir, "index.ts",),
      'console.log("direct config");',
    );

    // Add deno.jsonc to avoid required version error
    const denoJsonc = join(tempDir, "deno.jsonc",);
    await Deno.writeTextFile(
      denoJsonc,
      JSON.stringify({ version: "1.0.0", },),
    );

    const results = await exportEngine({
      config: {
        direct: {
          outputFile: "direct.md",
          includes: ["src/**/*.{ts,tsx}",],
          includeVersion: false,
          customInstruction: "Direct test",
        },
      },
      modes: ["direct",],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      silent: true,
    },);

    assertEquals(results.length, 1,);
    assertEquals(results[0]?.mode, "direct",);
    assertEquals(results[0]?.files, 1,);

    const snapshot = await Deno.readTextFile(join(tempDir, "direct.md",),);
    assertEquals(snapshot.includes('console.log("direct config");',), true,);

    await Deno.remove(tempDir, { recursive: true, },);
  });

  it("should substitute customized defineVersionString in instructions and header", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    await Deno.mkdir(srcDir, { recursive: true, },);

    await Deno.writeTextFile(
      join(srcDir, "index.ts",),
      'console.log("version replacement");',
    );

    const denoJsonc = join(tempDir, "deno.jsonc",);
    await Deno.writeTextFile(
      denoJsonc,
      JSON.stringify({ version: "2.5.0", },),
    );

    const results = await exportEngine({
      config: {
        versionTest: {
          outputFile: "version-out.md",
          includes: ["src/**/*.ts",],
          customInstruction: "App version: MY_CUSTOM_VER",
          header: "Header with MY_CUSTOM_VER",
        },
      },
      defineVersionString: "MY_CUSTOM_VER",
      modes: ["versionTest",],
      baseDir: tempDir,
      denoJsoncPath: denoJsonc,
      silent: true,
    },);

    assertEquals(results.length, 1,);
    const snapshot = await Deno.readTextFile(join(tempDir, "version-out.md",),);
    assertEquals(snapshot.includes("App version: 2.5.0",), true,);
    assertEquals(snapshot.includes("Header with 2.5.0",), true,);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});

```

---

## File: `packages/utils/tests/export/export.test.ts`

```ts
/**
 * @file export.test.ts
 * @description BDD unit tests for filtering logic, expandGlob, and context exporter execution.
 */

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { EXPORT_CONFIG_EXAMPLE, } from "../../src/export/config.ts";
import { shouldIncludeFile, } from "../../src/export/formatter.ts";
import { collectFilesForExport, } from "../../src/export/engine.ts";
import type { ExportConfig, } from "../../src/tools/interfaces.ts";

describe("shouldIncludeFile", () => {
  it("should BLOCK any file inside exports/ or snapshots/ folder", () => {
    const config = EXPORT_CONFIG_EXAMPLE.ui!;
    assertEquals(shouldIncludeFile("exports/ui.md", config,), false,);
    assertEquals(shouldIncludeFile("snapshots/server.md", config,), false,);
    assertEquals(
      shouldIncludeFile("exports/.github/workflows/test.yml", config,),
      false,
    );
  });

  it("should ALLOW paths matching includes pattern", () => {
    const config: ExportConfig = {
      outputFile: "snapshots/custom.md",
      includes: [
        "packages/server/{src,docs}/**/*.{ts,md}",
        ".github/workflows/**/*.{yaml,yml}",
      ],
      excludes: ["**/*.test.ts",],
    };

    assertEquals(
      shouldIncludeFile("packages/server/src/main.ts", config,),
      true,
    );
    assertEquals(
      shouldIncludeFile("packages/server/docs/architecture.md", config,),
      true,
    );
    assertEquals(
      shouldIncludeFile(".github/workflows/deploy.yml", config,),
      true,
    );
  });

  it("should BLOCK paths matching excludes pattern", () => {
    const config: ExportConfig = {
      outputFile: "snapshots/custom.md",
      includes: ["packages/server/src/**/*.{ts,tsx}",],
      excludes: ["**/*.test.ts", "**/dist/**",],
    };

    assertEquals(
      shouldIncludeFile("packages/server/src/main.ts", config,),
      true,
    );
    assertEquals(
      shouldIncludeFile("packages/server/src/main.test.ts", config,),
      false,
    );
    assertEquals(
      shouldIncludeFile("packages/server/src/dist/bundle.ts", config,),
      false,
    );
  });

  it("should BLOCK files outside includes patterns", () => {
    const config: ExportConfig = {
      outputFile: "snapshots/custom.md",
      includes: ["packages/server/src/**/*.{ts,tsx}",],
    };

    assertEquals(
      shouldIncludeFile("packages/ui/src/app.tsx", config,),
      false,
    );
    assertEquals(
      shouldIncludeFile("docs/readme.md", config,),
      false,
    );
  });
});

describe("collectFilesForExport (expandGlob)", () => {
  it("should collect files using brace expansion and respect excludes in sorted order", async () => {
    const tempDir = await Deno.makeTempDir();
    const srcDir = join(tempDir, "src",);
    const testDir = join(tempDir, "tests",);
    await Deno.mkdir(srcDir, { recursive: true, },);
    await Deno.mkdir(testDir, { recursive: true, },);

    await Deno.writeTextFile(join(srcDir, "index.ts",), "console.log(1);",);
    await Deno.writeTextFile(
      join(srcDir, "app.tsx",),
      "export default () => {};",
    );
    await Deno.writeTextFile(join(srcDir, "helper.test.ts",), "test",);
    await Deno.writeTextFile(join(testDir, "suite.test.ts",), "test",);

    const config: ExportConfig = {
      outputFile: "snapshots/out.md",
      includes: [
        "src/**/*.{ts,tsx}",
      ],
      excludes: [
        "**/*.test.ts",
      ],
    };

    const files = await collectFilesForExport(config, tempDir,);

    assertEquals(files, [
      "src/app.tsx",
      "src/index.ts",
    ],);

    await Deno.remove(tempDir, { recursive: true, },);
  });
});

```

---

## File: `packages/utils/tests/export/utils.test.ts`

```````ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import {
  calculateBacktickWrapper,
  formatMarkdownFile,
  generateHeader,
  mapExtension,
  matchesGlobs,
  normalizePath,
  shouldIncludeFile,
} from "../../src/export/formatter.ts";
import type { ExportConfig, } from "../../src/tools/interfaces.ts";

// Helper to create custom config in tests
function makeConfig(overrides: Partial<ExportConfig> = {},): ExportConfig {
  return {
    outputFile: "snapshot.md",
    includes: ["**/*",],
    includeVersion: false,
    customInstruction: "Test",
    ...overrides,
  };
}

// ============================================================================
// 🛠️ UTILITY FUNCTIONS
// ============================================================================

describe("normalizePath", () => {
  it("converts backslashes to normal slashes", () => {
    assertEquals(normalizePath("a\\b\\c",), "a/b/c",);
  });

  it("converts to lowercase", () => {
    assertEquals(normalizePath("ABC/DEF",), "abc/def",);
  });

  it("handles both simultaneously", () => {
    assertEquals(normalizePath("A\\B\\C/DEF",), "a/b/c/def",);
  });

  it("preserves already normalized path", () => {
    assertEquals(normalizePath("a/b/c",), "a/b/c",);
  });

  it("handles empty string", () => {
    assertEquals(normalizePath("",), "",);
  });
});

describe("calculateBacktickWrapper", () => {
  it("returns ``` for text without backticks", () => {
    assertEquals(calculateBacktickWrapper("normal text",), "```",);
  });

  it("returns ```` for text with ```", () => {
    assertEquals(calculateBacktickWrapper("code with ```",), "````",);
  });

  it("returns 6 backticks for text with `````", () => {
    assertEquals(calculateBacktickWrapper("text `````",), "``````",);
  });

  it("uses at least 3 backticks", () => {
    assertEquals(calculateBacktickWrapper("with ` one backtick",), "```",);
    assertEquals(calculateBacktickWrapper("with `` two",), "```",);
  });

  it("handles multiple sequences (uses the largest)", () => {
    assertEquals(
      calculateBacktickWrapper("with ` and ``` and ``",),
      "````",
    );
  });

  it("handles empty string", () => {
    assertEquals(calculateBacktickWrapper("",), "```",);
  });
});

describe("mapExtension", () => {
  it("maps .manifest to json", () => {
    assertEquals(mapExtension("manifest.manifest",), "json",);
  });

  it("maps .jsonc to json", () => {
    assertEquals(mapExtension("config.jsonc",), "json",);
  });

  it("maps .yml to yaml", () => {
    assertEquals(mapExtension("workflow.yml",), "yaml",);
  });

  it("maps .sh to bash", () => {
    assertEquals(mapExtension("deploy.sh",), "bash",);
  });

  it("maps .env* to properties", () => {
    assertEquals(mapExtension(".env",), "properties",);
    assertEquals(mapExtension(".env.example",), "properties",);
    assertEquals(mapExtension(".env.local",), "properties",);
  });

  it("returns extension as is for unmapped cases", () => {
    assertEquals(mapExtension("file.ts",), "ts",);
    assertEquals(mapExtension("file.tsx",), "tsx",);
    assertEquals(mapExtension("file.md",), "md",);
  });

  it("is case insensitive", () => {
    assertEquals(mapExtension("file.JSONC",), "json",);
    assertEquals(mapExtension("file.YML",), "yaml",);
  });
});

describe("matchesGlobs", () => {
  it("should match with simple wildcards", () => {
    assertEquals(matchesGlobs("src/main.ts", ["src/*.ts",],), true,);
    assertEquals(matchesGlobs("src/main.js", ["src/*.ts",],), false,);
  });

  it("should match with recursive globstar", () => {
    assertEquals(
      matchesGlobs("packages/ui/src/app.tsx", ["packages/ui/**",],),
      true,
    );
  });

  it("should match with brace expansion", () => {
    assertEquals(
      matchesGlobs("src/main.tsx", ["src/**/*.{ts,tsx}",],),
      true,
    );
    assertEquals(
      matchesGlobs("src/main.ts", ["src/**/*.{ts,tsx}",],),
      true,
    );
    assertEquals(
      matchesGlobs("src/main.css", ["src/**/*.{ts,tsx}",],),
      false,
    );
  });
});

// ============================================================================
// 🎯 FILTERING LOGIC
// ============================================================================

describe("shouldIncludeFile", () => {
  describe("anti-loop protection", () => {
    it("blocks any file inside exports/", () => {
      const config = makeConfig({
        includes: ["**/*",],
      },);
      assertEquals(shouldIncludeFile("exports/server.md", config,), false,);
      assertEquals(shouldIncludeFile("exports/sub/file.ts", config,), false,);
    });

    it("blocks even with valid extension", () => {
      const config = makeConfig({
        includes: ["**/*.{md,ts}",],
      },);
      assertEquals(shouldIncludeFile("exports/any.ts", config,), false,);
    });
  });

  describe("modern mode includes / excludes", () => {
    it("allows file matching includes and not matching excludes", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["src/**/*.{ts,tsx}",],
        excludes: ["**/*.test.ts",],
      };
      assertEquals(shouldIncludeFile("src/app.tsx", config,), true,);
      assertEquals(shouldIncludeFile("src/app.test.ts", config,), false,);
    });
  });

  describe("additional paths and root files via glob", () => {
    it("allows additional path with valid extension", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["src/**/*.{ts,tsx}", ".github/workflows/*.{yml,yaml}",],
      };
      assertEquals(
        shouldIncludeFile(".github/workflows/deploy.yml", config,),
        true,
      );
      assertEquals(
        shouldIncludeFile(".github/workflows/ci.yaml", config,),
        true,
      );
    });

    it("blocks path with extension not matching glob", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: [".github/workflows/*.yml",],
      };
      assertEquals(
        shouldIncludeFile(".github/workflows/secret.png", config,),
        false,
      );
    });

    it("allows exact file in additional path", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["README.md",],
      };
      assertEquals(shouldIncludeFile("README.md", config,), true,);
    });
  });

  describe("folders and subfolders via glob", () => {
    it("allows file inside permitted subfolder", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/{src,docs}/**/*.{ts,md}",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/server/src/main.ts", config,),
        true,
      );
      assertEquals(
        shouldIncludeFile("monorepo/server/docs/architecture.md", config,),
        true,
      );
    });

    it("blocks file outside included folders", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/src/**/*",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/ui/src/app.tsx", config,),
        false,
      );
    });

    it("blocks file in excluded subfolder", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/**/*",],
        excludes: ["monorepo/server/dist/**/*",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/server/dist/bundle.js", config,),
        false,
      );
    });
  });

  describe("root files via glob", () => {
    it("allows explicitly configured root files", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/{deno.json,deploy.sh}",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/server/deno.json", config,),
        true,
      );
      assertEquals(
        shouldIncludeFile("monorepo/server/deploy.sh", config,),
        true,
      );
    });

    it("blocks unconfigured root files", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["monorepo/server/deno.json",],
      };
      assertEquals(
        shouldIncludeFile("monorepo/server/package.json", config,),
        false,
      );
    });
  });

  describe("docs type configuration via glob", () => {
    it("captures root and docs subfolder", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["readme.md", "docs/**/*.md",],
      };
      assertEquals(shouldIncludeFile("readme.md", config,), true,);
      assertEquals(shouldIncludeFile("docs/architecture.md", config,), true,);
    });

    it("blocks source code outside docs", () => {
      const config: ExportConfig = {
        outputFile: "snapshot.md",
        includes: ["docs/**/*.md",],
      };
      assertEquals(shouldIncludeFile("src/main.ts", config,), false,);
    });
  });
});

// ============================================================================
// 📝 CONTENT GENERATION
// ============================================================================

describe("generateHeader", () => {
  it("includes custom instruction", () => {
    const config = makeConfig({
      customInstruction: "This is a TEST code.",
    },);
    const result = generateHeader(config, "test", "1.0.0",);
    assertStringIncludes(result, "TEST code",);
  });

  it("includes version when includeVersion is true", () => {
    const config = makeConfig({ includeVersion: true, },);
    const result = generateHeader(config, "ui", "1.2.3",);
    assertStringIncludes(result, "[v1.2.3]",);
    assertStringIncludes(result, "BuildIt [v1.2.3]",);
  });

  it("does not include version when includeVersion is false", () => {
    const config = makeConfig({ includeVersion: false, },);
    const result = generateHeader(config, "server", "1.2.3",);
    assertEquals(result.includes("[v1.2.3]",), false,);
  });

  it("includes mode name in uppercase", () => {
    const config = makeConfig();
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(result, "Mode: UI",);
  });

  it("includes generation timestamp", () => {
    const config = makeConfig();
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(result, "Automatically generated at:",);
  });

  it("uses default header with file guidelines when header is not provided", () => {
    const config = makeConfig();
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(
      result,
      "> Each file starts with a title indicating its exact relative path (e.g., `## File: src/main.ts`).",
    );
    assertStringIncludes(
      result,
      "> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.",
    );
  });

  it("allows replacing header via header option", () => {
    const customHeader = "> Special and unique guideline for this project.";
    const config = makeConfig({ header: customHeader, },);
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(result, customHeader,);
    assertEquals(
      result.includes(
        "Each file starts with a title indicating its exact relative path",
      ),
      false,
    );
  });

  it("allows customizing project name via project option", () => {
    const config = makeConfig({ project: "MySuperApp", },);
    const result = generateHeader(config, "ui", "1.0.0",);
    assertStringIncludes(
      result,
      "# Exported Context from Project MySuperApp - Mode: UI",
    );
  });
});

describe("formatMarkdownFile", () => {
  it("formats file with path and content", () => {
    const result = formatMarkdownFile(
      "src/main.ts",
      "console.log('hello');",
    );
    assertStringIncludes(result, "## File: `src/main.ts`",);
    assertStringIncludes(result, "```ts",);
    assertStringIncludes(result, "console.log('hello');",);
  });

  it("uses mapped extension for highlight", () => {
    const result = formatMarkdownFile("config.jsonc", "{}",);
    assertStringIncludes(result, "```json",);
  });

  it("increases backticks when content has ```", () => {
    const content = "code with ```\nmore code";
    const result = formatMarkdownFile("file.md", content,);
    assertStringIncludes(result, "````md",);
    assertStringIncludes(result, "````",);
  });

  it("includes separator at the end", () => {
    const result = formatMarkdownFile("src/main.ts", "code",);
    assertStringIncludes(result, "---",);
  });
});

```````

---

## File: `packages/utils/tests/helpers/fixtures.ts`

```ts
/// <reference lib="deno.ns" />

import { join, } from "@std/path";

/**
 * Creates a temporary directory with a controlled structure for tests.
 * Returns the path and a cleanup function.
 */
export async function withTempDir<T,>(
  fn: (dir: string,) => Promise<T>,
): Promise<T> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-test-", },);
  try {
    return await fn(tempDir,);
  } finally {
    await Deno.remove(tempDir, { recursive: true, },);
  }
}

/**
 * Creates a temporary deno.jsonc file with the specified version.
 */
export async function withTempDenoJsonc(
  version: string,
  extras?: Record<string, unknown>,
): Promise<{ path: string; cleanup: () => Promise<void> }> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-deno-test-", },);
  const path = join(tempDir, "deno.jsonc",);

  const content = JSON.stringify(
    {
      name: "@buildit/test",
      version,
      ...extras,
    },
    null,
    2,
  );

  await Deno.writeTextFile(path, content,);

  return {
    path,
    cleanup: async () => await Deno.remove(tempDir, { recursive: true, },),
  };
}

/**
 * Creates a temporary file structure for filesystem tests.
 */
export async function withFileStructure(
  files: Record<string, string>,
): Promise<{ dir: string; cleanup: () => Promise<void> }> {
  const tempDir = await Deno.makeTempDir({ prefix: "buildit-fs-test-", },);

  for (const [path, content,] of Object.entries(files,)) {
    const fullPath = join(tempDir, path,);
    const dirPath = fullPath.substring(0, fullPath.lastIndexOf("/",),);

    if (dirPath) {
      await Deno.mkdir(dirPath, { recursive: true, },);
    }

    await Deno.writeTextFile(fullPath, content,);
  }

  return {
    dir: tempDir,
    cleanup: async () => await Deno.remove(tempDir, { recursive: true, },),
  };
}

/**
 * Checks if a file exists.
 */
export async function fileExists(path: string,): Promise<boolean> {
  try {
    await Deno.stat(path,);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads the content of a file as text.
 */
export async function readText(path: string,): Promise<string> {
  return await Deno.readTextFile(path,);
}

/**
 * Lists files in a directory recursively.
 */
export async function listFiles(dir: string,): Promise<string[]> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(dir,)) {
    files.push(entry.name,);
  }
  return files;
}

```

---

## File: `packages/utils/tests/helpers/targets.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { resolveTargetOrder, } from "../../src/tools/targets.ts";

describe("resolveTargetOrder", () => {
  const config = {
    server: { default: true, },
    ui: { default: true, },
    sw: { default: true, },
    admin: { default: false, },
    docs: { default: false, },
  };

  it("returns default targets in exact definition order when none are requested", () => {
    const targets = resolveTargetOrder(config,);
    assertEquals(targets, ["server", "ui", "sw",],);
  });

  it("ensures config order even if caller passes inverted or disordered targets", () => {
    // Passed ["docs", "ui", "server"] -> should resolve to ["server", "ui", "docs"]
    const targets = resolveTargetOrder(config, ["docs", "ui", "server",],);
    assertEquals(targets, ["server", "ui", "docs",],);
  });

  it("handles case-insensitivity preserving original config keys", () => {
    const targets = resolveTargetOrder(config, ["SW", "SERVER",],);
    assertEquals(targets, ["server", "sw",],);
  });

  it("allows including targets with default: false when explicitly requested", () => {
    const targets = resolveTargetOrder(config, ["admin",],);
    assertEquals(targets, ["admin",],);
  });

  it("returns empty if requested targets do not exist in config", () => {
    const targets = resolveTargetOrder(config, ["nonexistent", "ghost",],);
    assertEquals(targets, [],);
  });

  it("returns empty array when config is empty", () => {
    const targets = resolveTargetOrder({}, ["ui",],);
    assertEquals(targets, [],);
  });
});

```

---

## File: `packages/utils/tests/tools/jsonc.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { loadConfig, } from "../../src/tools/jsonc.ts";
import { join, } from "@std/path";

describe("loadConfig - Search Priorities", () => {
  it("should load explicitPath file if provided", async () => {
    const tempFile = await Deno.makeTempFile({ suffix: ".json", },);
    await Deno.writeTextFile(tempFile, JSON.stringify({ explicit: true, },),);

    try {
      const config = await loadConfig<{ explicit: boolean }>("test", tempFile,);
      assertEquals(config?.explicit, true,);
    } finally {
      await Deno.remove(tempFile,);
    }
  });

  it("should fallback to baseDir if scriptDir does not have the file", async () => {
    const tempDir = await Deno.makeTempDir();
    const configPath = join(tempDir, "test.jsonc",);
    await Deno.writeTextFile(configPath, JSON.stringify({ baseDir: true, },),);

    try {
      // Since we cannot easily change Deno.mainModule at test runtime,
      // we only check if it finds it in the passed baseDir.
      const config = await loadConfig<{ baseDir: boolean }>(
        "test",
        undefined,
        tempDir,
      );
      assertEquals(config?.baseDir, true,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should find configuration inside scripts subfolder of baseDir", async () => {
    const tempDir = await Deno.makeTempDir();
    const scriptsDir = join(tempDir, "scripts",);
    await Deno.mkdir(scriptsDir,);
    const configPath = join(scriptsDir, "test.jsonc",);
    await Deno.writeTextFile(
      configPath,
      JSON.stringify({ inScripts: true, },),
    );

    try {
      const config = await loadConfig<{ inScripts: boolean }>(
        "test",
        undefined,
        tempDir,
      );
      assertEquals(config?.inScripts, true,);

      // Also with explicitPath relative to baseDir or scripts
      const configExplicit = await loadConfig<{ inScripts: boolean }>(
        "test",
        "test.jsonc",
        tempDir,
      );
      assertEquals(configExplicit?.inScripts, true,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should return null if no file is found", async () => {
    const config = await loadConfig(
      "nonexistent",
      undefined,
      "/tmp/ghost-folder",
    );
    assertEquals(config, null,);
  });
});

```

---

## File: `packages/utils/tests/tools/paths.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import {
  applyDefines,
  cleanTarget,
  copyStaticFiles,
  copyTargetFiles,
  matchesGlobs,
  processFilesWithDefines,
  resolveWithBase,
} from "../../src/tools/paths.ts";

describe("paths.ts - Utilities and features", () => {
  describe("matchesGlobs", () => {
    it("should validate simple glob patterns and extensions", () => {
      assertEquals(matchesGlobs("src/main.ts", ["**/*.ts",],), true,);
      assertEquals(matchesGlobs("src/main.ts", ["**/*.js",],), false,);
      assertEquals(
        matchesGlobs("dist/app.min.js", ["*.js", "**/*.js",],),
        true,
      );
    });

    it("should support brace expansion", () => {
      assertEquals(matchesGlobs("file.jpg", ["*.{png,jpg,gif}",],), true,);
      assertEquals(matchesGlobs("file.svg", ["*.{png,jpg,gif}",],), false,);
      assertEquals(matchesGlobs("file.png", ["*.{png,jpg,gif}",],), true,);
    });
  });

  describe("resolveWithBase", () => {
    it("should join baseDir when path is relative and baseDir is different from .", () => {
      assertEquals(
        resolveWithBase("src", "packages/ui",),
        join("packages/ui", "src",),
      );
      assertEquals(resolveWithBase("dist", ".",), "dist",);
      assertEquals(resolveWithBase(undefined, "packages/ui",), undefined,);
    });

    it("should not modify already absolute paths", () => {
      const absPath = "/absolute/path";
      assertEquals(resolveWithBase(absPath, "packages/ui",), absPath,);
    });
  });

  describe("cleanTarget", () => {
    it("should clean files matching glob while respecting excludes", async () => {
      const tempDir = await Deno.makeTempDir({
        prefix: "buildit_test_clean_",
      },);
      try {
        await Deno.writeTextFile(join(tempDir, "file1.tmp",), "temp 1",);
        await Deno.writeTextFile(join(tempDir, "file2.tmp",), "temp 2",);
        await Deno.writeTextFile(join(tempDir, "keep.tmp",), "keep",);
        await Deno.writeTextFile(join(tempDir, "data.json",), "data",);

        await cleanTarget(tempDir, {
          includes: ["*.tmp",],
          excludes: ["keep.tmp",],
        },);

        // file1.tmp and file2.tmp should have been deleted
        let file1Exists = true;
        try {
          await Deno.stat(join(tempDir, "file1.tmp",),);
        } catch {
          file1Exists = false;
        }
        assertEquals(file1Exists, false,);

        // keep.tmp and data.json should remain
        const keepStat = await Deno.stat(join(tempDir, "keep.tmp",),);
        assert(keepStat.isFile,);
        const dataStat = await Deno.stat(join(tempDir, "data.json",),);
        assert(dataStat.isFile,);
      } finally {
        await Deno.remove(tempDir, { recursive: true, },).catch(() => {},);
      }
    });

    it("should clean the entire directory with includes: ['*']", async () => {
      const tempDir = await Deno.makeTempDir({
        prefix: "buildit_test_clean_all_",
      },);
      try {
        await Deno.writeTextFile(join(tempDir, "file1.txt",), "hello",);
        await Deno.mkdir(join(tempDir, "sub",),);
        await Deno.writeTextFile(join(tempDir, "sub", "file2.txt",), "world",);

        await cleanTarget(tempDir, { includes: ["*",], },);

        const entries: string[] = [];
        for await (const entry of Deno.readDir(tempDir,)) {
          entries.push(entry.name,);
        }
        assertEquals(entries.length, 0,);
      } finally {
        await Deno.remove(tempDir, { recursive: true, },).catch(() => {},);
      }
    });
  });

  describe("copyTargetFiles", () => {
    it("should preserve tree relative to basedir when basedir is specified", async () => {
      const tempSrc = await Deno.makeTempDir({ prefix: "buildit_test_src_", },);
      const tempDist = await Deno.makeTempDir({
        prefix: "buildit_test_dist_",
      },);

      try {
        await Deno.mkdir(join(tempSrc, "icons",), { recursive: true, },);
        await Deno.writeTextFile(join(tempSrc, "icons", "icon.png",), "image",);
        await Deno.writeTextFile(
          join(tempSrc, "manifest.json",),
          JSON.stringify({ name: "App", },),
        );

        await copyTargetFiles(
          [{ basedir: tempSrc, },],
          tempDist,
          "1.2.3",
        );

        // Verify integrity of preserved tree
        const copiedIcon = await Deno.readTextFile(
          join(tempDist, "icons", "icon.png",),
        );
        assertEquals(copiedIcon, "image",);

        // Verify version injection into manifest.json
        const copiedManifest = JSON.parse(
          await Deno.readTextFile(join(tempDist, "manifest.json",),),
        );
        assertEquals(copiedManifest.version, "1.2.3",);
      } finally {
        await Deno.remove(tempSrc, { recursive: true, },).catch(() => {},);
        await Deno.remove(tempDist, { recursive: true, },).catch(() => {},);
      }
    });

    it("should copy files directly to distdir root when basedir is not provided", async () => {
      const tempRoot = await Deno.makeTempDir({
        prefix: "buildit_test_root_",
      },);
      const tempDist = await Deno.makeTempDir({
        prefix: "buildit_test_dist2_",
      },);

      try {
        await Deno.mkdir(join(tempRoot, "sub1", "sub2",), {
          recursive: true,
        },);
        await Deno.writeTextFile(
          join(tempRoot, "sub1", "sub2", "style.css",),
          "body{}",
        );

        await copyTargetFiles(
          [{ includes: ["sub1/sub2/*.css",], },],
          tempDist,
          "1.0.0",
          tempRoot,
        );

        // When basedir is not provided, file is placed directly in distdir
        const fileContent = await Deno.readTextFile(
          join(tempDist, "style.css",),
        );
        assertEquals(fileContent, "body{}",);
      } finally {
        await Deno.remove(tempRoot, { recursive: true, },).catch(() => {},);
        await Deno.remove(tempDist, { recursive: true, },).catch(() => {},);
      }
    });
  });

  describe("applyDefines", () => {
    it("should substitute defined identifiers correctly", () => {
      const code =
        "const v = __APP_VERSION__; const assets = __GENERATED_ASSETS__;";
      const result = applyDefines(code, {
        "__APP_VERSION__": '"1.0.0"',
        "__GENERATED_ASSETS__": '["index.html", "app.js"]',
      },);

      assertEquals(
        result,
        'const v = "1.0.0"; const assets = ["index.html", "app.js"];',
      );
    });

    it("should support custom define keys", () => {
      const code = "const ver = MY_CUSTOM_VERSION;";
      const result = applyDefines(code, {
        "MY_CUSTOM_VERSION": '"2.5.0"',
      },);

      assertEquals(result, 'const ver = "2.5.0";',);
    });
  });

  describe("processFilesWithDefines", () => {
    it("should change file content and return processed list", async () => {
      const tempDir = await Deno.makeTempDir({
        prefix: "buildit_test_process_defines_",
      },);
      try {
        const file1 = join(tempDir, "config.js",);
        const file2 = join(tempDir, "env.txt",);
        const file3 = join(tempDir, "no-change.txt",);

        await Deno.writeTextFile(file1, "const url = __API_URL__;",);
        await Deno.writeTextFile(file2, "VERSION: __APP_VERSION__",);
        await Deno.writeTextFile(file3, "no markers here",);

        const defines = {
          "__API_URL__": '"https://api.test"',
          "__APP_VERSION__": '"1.2.3"',
        };

        const processed = await processFilesWithDefines([
          file1,
          file2,
          file3,
        ], defines,);

        // Only file1 and file2 should be in list since they were changed
        assertEquals(processed.length, 2,);
        assert(processed.includes(file1,),);
        assert(processed.includes(file2,),);
        assert(!processed.includes(file3,),);

        // Verify changed content
        const content1 = await Deno.readTextFile(file1,);
        assertEquals(content1, 'const url = "https://api.test";',);
        const content2 = await Deno.readTextFile(file2,);
        assertEquals(content2, 'VERSION: "1.2.3"',);
        const content3 = await Deno.readTextFile(file3,);
        assertEquals(content3, "no markers here",);
      } finally {
        await Deno.remove(tempDir, { recursive: true, },).catch(() => {},);
      }
    });
  });
});

```

---

## File: `packages/utils/tests/tools/targets.test.ts`

```ts
import { assertEquals, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { resolveTargetOrder, } from "../../src/tools/targets.ts";

describe("resolveTargetOrder", () => {
  const config = {
    first: { default: true, },
    second: { default: true, },
    third: { default: false, },
    fourth: { default: true, },
  };

  it("should return all targets with default !== false in the exact order of the configuration", () => {
    const ordered = resolveTargetOrder(config,);
    assertEquals(ordered, ["first", "second", "fourth",],);
  });

  it("should preserve the configuration order even if targets are passed out of order", () => {
    const ordered = resolveTargetOrder(config, [
      "fourth",
      "first",
      "third",
    ],);
    assertEquals(ordered, ["first", "third", "fourth",],);
  });

  it("should support requested targets in uppercase or lowercase", () => {
    const ordered = resolveTargetOrder(config, ["FOURTH", "First",],);
    assertEquals(ordered, ["first", "fourth",],);
  });

  it("should ignore requested non-existent targets keeping valid ones sorted", () => {
    const ordered = resolveTargetOrder(config, [
      "nonexistent",
      "second",
      "first",
    ],);
    assertEquals(ordered, ["first", "second",],);
  });
});

```

---

## File: `packages/utils/tests/version/changelog.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import {
  generateChangelogContent,
  updateChangelogFile,
  updateReadmeChangelog,
} from "../../src/version/tag/changelog.ts";
import { runGit, } from "../../src/tools/git.ts";

describe("changelog utility", () => {
  it("should generate changelog content from a git repository", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      // Initialize git repo
      await runGit(["init",], tempDir,);
      await runGit(["config", "user.email", "test@example.com",], tempDir,);
      await runGit(["config", "user.name", "Test User",], tempDir,);
      await runGit(["config", "commit.gpgsign", "false",], tempDir,);

      // First commit and tag
      await Deno.writeTextFile(join(tempDir, "file1.txt",), "content 1",);
      await runGit(["add", ".",], tempDir,);
      const c1 = await runGit(
        ["commit", "-m", "feat: initial commit",],
        tempDir,
      );
      if (!c1.success) console.warn("Commit 1 failed:", c1.stderr,);

      const t1 = await runGit(
        ["tag", "-a", "v0.1", "-m", "v0.1",],
        tempDir,
      );
      if (!t1.success) console.warn("Tag 1 failed:", t1.stderr,);

      // Second commit (will be the log for the new version)
      await Deno.writeTextFile(join(tempDir, "file2.txt",), "content 2",);
      await runGit(["add", ".",], tempDir,);
      const c2 = await runGit(["commit", "-m", "fix: bug fixed",], tempDir,);
      if (!c2.success) console.warn("Commit 2 failed:", c2.stderr,);

      const content = await generateChangelogContent("v0.2", tempDir,);

      assertStringIncludes(content, "## v0.2",);
      assertStringIncludes(content, "fix: bug fixed",);
      // Should not include the commit from tag v0.1 in the v0.1..HEAD range
      assertEquals(content.includes("feat: initial commit",), false,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should update the CHANGELOG.md file (prepend)", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const changelogPath = join(tempDir, "CHANGELOG.md",);
      await Deno.writeTextFile(changelogPath, "## v0.1\n- Initial",);

      await updateChangelogFile("## v0.2\n- New feature", tempDir,);

      const content = await Deno.readTextFile(changelogPath,);
      assertStringIncludes(content, "## v0.2",);
      assertStringIncludes(content, "## v0.1",);
      assertEquals(content.indexOf("## v0.2",), 0,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should update README.md using markers", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const readmePath = join(tempDir, "README.md",);
      const initialReadme =
        `# Project\n\nSome text.\n\n<!-- START:changelog -->\nOld content\n<!-- END:changelog -->\nFooter`;
      await Deno.writeTextFile(readmePath, initialReadme,);

      await updateReadmeChangelog(
        "## v0.2 (2024-01-01)\n- Line 1\n- Line 2",
        tempDir,
      );

      const content = await Deno.readTextFile(readmePath,);
      assertStringIncludes(content, "### 📦 Latest updates",);
      assertStringIncludes(content, "- Line 1",);
      assertStringIncludes(content, "Footer",);
      assertEquals(content.includes("Old content",), false,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

```

---

## File: `packages/utils/tests/version/ensure.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertStringIncludes, } from "@std/assert";
import { join, } from "@std/path";
import { ensureVersionFile, } from "../../src/tools/version.ts";

describe("ensureVersionFile", () => {
  it("should create .ts file by default with TypeScript template", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const filePath = join(tempDir, "version.ts",);
      const created = await ensureVersionFile(filePath,);

      assertEquals(created, true,);
      const content = await Deno.readTextFile(filePath,);
      assertStringIncludes(content, "// @ts-ignore",);
      assertStringIncludes(content, "@type {string}",);
      assertStringIncludes(content, "export const APP_VERSION: string =",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should create .js file with JavaScript template", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const filePath = join(tempDir, "version.js",);
      const created = await ensureVersionFile(filePath,);

      assertEquals(created, true,);
      const content = await Deno.readTextFile(filePath,);
      // Should not have types or declare const
      assertEquals(content.includes("declare const",), false,);
      assertEquals(content.includes(": string",), false,);
      assertStringIncludes(content, "@type {string}",);
      assertStringIncludes(
        content,
        'export const APP_VERSION = typeof __APP_VERSION__ !== "undefined"',
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should create version.ts when receiving a directory", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const created = await ensureVersionFile(tempDir,);

      assertEquals(created, true,);
      const filePath = join(tempDir, "version.ts",);
      const content = await Deno.readTextFile(filePath,);
      assertStringIncludes(content, "// @ts-ignore",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should respect customized defineVersionString", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const filePath = join(tempDir, "version.js",);
      await ensureVersionFile(filePath, ".", "MY_CUSTOM_VERSION",);

      const content = await Deno.readTextFile(filePath,);
      assertStringIncludes(
        content,
        'typeof MY_CUSTOM_VERSION !== "undefined"',
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

```

---

## File: `packages/utils/tests/version/lib-version.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assertEquals, assertNotEquals, } from "@std/assert";
import { findDenoFile, sanitizeVersion, } from "../../src/tools/version.ts";

describe("lib-version - TypeScript equivalent of lib-version.sh", () => {
  describe("sanitizeVersion", () => {
    it("keeps pure semver versions unchanged", () => {
      assertEquals(sanitizeVersion("1.2.3",), "1.2.3",);
      assertEquals(sanitizeVersion("0.3.14",), "0.3.14",);
      assertEquals(sanitizeVersion("10.20.30",), "10.20.30",);
    });

    it("removes 'v' prefix", () => {
      assertEquals(sanitizeVersion("v1.2.3",), "1.2.3",);
      assertEquals(sanitizeVersion("v0.3.14",), "0.3.14",);
    });

    it("removes hash suffix (#hash)", () => {
      assertEquals(sanitizeVersion("0.3.14#muesu7z0",), "0.3.14",);
      assertEquals(sanitizeVersion("v1.2.3#abc1234",), "1.2.3",);
    });

    it("removes pre-release tags (-alpha, -beta.1)", () => {
      assertEquals(sanitizeVersion("1.2.3-alpha",), "1.2.3",);
      assertEquals(sanitizeVersion("2.0.0-rc.1",), "2.0.0",);
    });

    it("removes build metadata (+build.123)", () => {
      assertEquals(sanitizeVersion("1.2.3+20130313144700",), "1.2.3",);
      assertEquals(sanitizeVersion("1.2.3-beta+exp.sha.5114f85",), "1.2.3",);
    });

    it("fills missing components with 0", () => {
      assertEquals(sanitizeVersion("1.2",), "1.2.0",);
      assertEquals(sanitizeVersion("5",), "5.0.0",);
      assertEquals(sanitizeVersion("",), "0.0.0",);
    });

    it("discards components beyond patch (e.g., 1.2.3.4.5)", () => {
      assertEquals(sanitizeVersion("1.2.3.4.5",), "1.2.3",);
    });

    it("returns 0.0.0 for invalid non-numeric strings", () => {
      assertEquals(sanitizeVersion("invalid",), "0.0.0",);
      assertEquals(sanitizeVersion("v",), "0.0.0",);
      assertEquals(sanitizeVersion("###",), "0.0.0",);
    });
  });

  describe("findDenoFile", () => {
    it("locates deno.jsonc in workspace directory", () => {
      const found = findDenoFile(".",);
      assertNotEquals(found, null,);
      assertEquals(found?.endsWith("deno.jsonc",), true,);
    });

    it("climbs directory tree from subfolders", () => {
      const startDir = import.meta.dirname ?? ".";
      const found = findDenoFile(startDir,);
      assertNotEquals(found, null,);
    });

    it("returns null for non-existent paths outside project", () => {
      const found = findDenoFile("/tmp/non-existent-dir-for-test-999",);
      assertEquals(found, null,);
    });
  });
});

```

---

## File: `packages/utils/tests/version/sanitize.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { sanitizeVersionFile, } from "../../src/version/sanitize/engine.ts";
import { sanitizeVersionCli, } from "../../src/version/sanitize/cli.ts";
import { join, } from "@std/path";

describe("sanitize-version - Engine and CLI", () => {
  describe("sanitizeVersionFile", () => {
    it("does not change file that already has a valid semver version", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "version": "1.2.3"\n}',);

      const res = await sanitizeVersionFile({ filePath, silent: true, },);
      assertEquals(res.rawVersion, "1.2.3",);
      assertEquals(res.sanitizedVersion, "1.2.3",);
      assertEquals(res.updated, false,);

      const content = await Deno.readTextFile(filePath,);
      assertEquals(content, '{\n  "version": "1.2.3"\n}',);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("sanitizes version with hash in the file", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "name": "test",\n  "version": "0.3.14#muesu7z0",\n  "license": "MIT"\n}',
      );

      const res = await sanitizeVersionFile({ filePath, silent: true, },);
      assertEquals(res.rawVersion, "0.3.14#muesu7z0",);
      assertEquals(res.sanitizedVersion, "0.3.14",);
      assertEquals(res.updated, true,);

      const updated = await Deno.readTextFile(filePath,);
      assert(updated.includes('"version": "0.3.14"',),);
      assert(!updated.includes("#muesu7z0",),);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("injects version: 0.0.0 when the version field is missing", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "name": "no-version"\n}',);

      const res = await sanitizeVersionFile({ filePath, silent: true, },);
      assertEquals(res.rawVersion, "0.0.0",);
      assertEquals(res.sanitizedVersion, "0.0.0",);
      assertEquals(res.updated, false,);

      const updated = await Deno.readTextFile(filePath,);
      assert(updated.includes('"version": "0.0.0"',),);
      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("fails when explicit file does not exist", async () => {
      await assertRejects(
        () =>
          sanitizeVersionFile({
            filePath: "/fictional/path/deno.jsonc",
            silent: true,
          },),
        Error,
        "not found",
      );
    });
  });

  describe("sanitizeVersionCli", () => {
    it("instantiates Cliffy command with correct definitions", () => {
      const cmd = sanitizeVersionCli();
      assertEquals(cmd.getName(), "sanitize-version",);
    });
  });
});

```

---

## File: `packages/utils/tests/version/sync-workspaces.test.ts`

```ts
/// <reference lib="deno.ns" />

import { describe, it, } from "@std/testing/bdd";
import { assertEquals, } from "@std/assert";
import { join, } from "@std/path";
import { syncWorkspaces, } from "../../src/tools/version.ts";

describe("syncWorkspaces", () => {
  it("should synchronize the existing version in root deno.jsonc to workspace packages", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const rootConfig = {
        name: "root-project",
        version: "1.2.3#xyz",
        workspace: ["./packages/pkg-a", "./packages/pkg-b",],
      };
      await Deno.writeTextFile(
        join(tempDir, "deno.jsonc",),
        JSON.stringify(rootConfig, null, 2,),
      );

      const pkgADir = join(tempDir, "packages", "pkg-a",);
      const pkgBDir = join(tempDir, "packages", "pkg-b",);
      await Deno.mkdir(pkgADir, { recursive: true, },);
      await Deno.mkdir(pkgBDir, { recursive: true, },);

      await Deno.writeTextFile(
        join(pkgADir, "deno.jsonc",),
        JSON.stringify({ name: "pkg-a", version: "0.0.1", }, null, 2,),
      );
      await Deno.writeTextFile(
        join(pkgBDir, "deno.json",),
        JSON.stringify({ name: "pkg-b", version: "0.0.2", }, null, 2,),
      );

      // Runs syncWorkspaces with only baseDir (should read version from root deno.jsonc)
      const syncedVersion = await syncWorkspaces({ baseDir: tempDir, },);
      assertEquals(syncedVersion, "1.2.3#xyz",);

      const pkgAContent = await Deno.readTextFile(
        join(pkgADir, "deno.jsonc",),
      );
      const pkgBContent = await Deno.readTextFile(join(pkgBDir, "deno.json",),);

      assertEquals(JSON.parse(pkgAContent,).version, "1.2.3#xyz",);
      assertEquals(JSON.parse(pkgBContent,).version, "1.2.3#xyz",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should accept explicit denoJsonPath and override with currentVersion if provided", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const rootConfig = {
        name: "custom-root",
        version: "1.0.0",
        workspace: ["./subpkg",],
      };
      const customConfigPath = join(tempDir, "custom-deno.jsonc",);
      await Deno.writeTextFile(
        customConfigPath,
        JSON.stringify(rootConfig, null, 2,),
      );

      const subPkgDir = join(tempDir, "subpkg",);
      await Deno.mkdir(subPkgDir, { recursive: true, },);
      await Deno.writeTextFile(
        join(subPkgDir, "deno.json",),
        JSON.stringify({ name: "subpkg", version: "0.1.0", }, null, 2,),
      );

      const syncedVersion = await syncWorkspaces({
        denoJsonPath: customConfigPath,
        currentVersion: "2.0.0",
      },);
      assertEquals(syncedVersion, "2.0.0",);

      const subPkgContent = await Deno.readTextFile(
        join(subPkgDir, "deno.json",),
      );
      assertEquals(JSON.parse(subPkgContent,).version, "2.0.0",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

```

---

## File: `packages/utils/tests/version/tag.test.ts`

```ts
import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { tagVersionEngine, } from "../../src/version/tag/engine.ts";
import { tagVersionCli, } from "../../src/version/tag/cli.ts";
import { join, } from "@std/path";

describe("tag-version - Engine and CLI", () => {
  describe("tagVersionEngine", () => {
    it("derives the vMAJOR.MINOR tag correctly in dryRun mode", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "version": "0.3.14#abc1234"\n}',
      );

      const res = await tagVersionEngine({
        file: filePath,
        dryRun: true,
        silent: true,
      },);

      assertEquals(res.tagName, "v0.3",);
      assertEquals(res.rawVersion, "0.3.14#abc1234",);
      assertEquals(res.sanitizedVersion, "0.3.14",);
      assertEquals(res.message, "Version v0.3",);
      assertEquals(res.committed, false,);
      assertEquals(res.tagged, false,);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("respects custom commit message", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "version": "1.2.9"\n}',);

      const res = await tagVersionEngine({
        file: filePath,
        message: "Official Release 1.2",
        dryRun: true,
        silent: true,
      },);

      assertEquals(res.tagName, "v1.2",);
      assertEquals(res.message, "Official Release 1.2",);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("performs on-disk sanitization when sanitize is true", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(
        filePath,
        '{\n  "version": "0.3.14#muesu7z0"\n}',
      );

      const res = await tagVersionEngine({
        file: filePath,
        sanitize: true,
        dryRun: true,
        silent: true,
      },);

      assertEquals(res.tagName, "v0.3",);
      const diskContent = await Deno.readTextFile(filePath,);
      assert(diskContent.includes('"version": "0.3.14"',),);
      assert(!diskContent.includes("#muesu7z0",),);

      await Deno.remove(tempDir, { recursive: true, },);
    });

    it("rejects when version field is missing", async () => {
      const tempDir = await Deno.makeTempDir();
      const filePath = join(tempDir, "deno.jsonc",);
      await Deno.writeTextFile(filePath, '{\n  "name": "no-version"\n}',);

      await assertRejects(
        () =>
          tagVersionEngine({
            file: filePath,
            dryRun: true,
            silent: true,
          },),
        Error,
        'Required "version" field not found',
      );

      await Deno.remove(tempDir, { recursive: true, },);
    });
  });

  describe("tagVersionCli", () => {
    it("instantiates the Cliffy command with correct definitions", () => {
      const cmd = tagVersionCli();
      assertEquals(cmd.getName(), "tag-version",);
    });
  });
});

```

---

## File: `packages/utils/tests/watch/config.test.ts`

```ts
/// <reference lib="deno.ns" />

import { assertRejects, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { assert, assertEquals, } from "@std/assert";
import { loadWatchConfig, } from "../../src/watch/config.ts";

describe("watch/config", () => {
  it("throws error if config file does not exist", async () => {
    await assertRejects(
      () => loadWatchConfig("non-existent.jsonc",),
      Error,
      'Configuration file "watch.jsonc" not found',
    );
  });

  it("loads configurations from the real project watch.jsonc", async () => {
    const config = await loadWatchConfig("watch.jsonc", ".",);
    const ui = config.targets["ui"];
    assert(ui !== undefined,);
    assertEquals(ui.format, "esm",);
    assertEquals(ui.entryPoints, ["main.tsx",],);
  });
});

```

---

## File: `packages/utils/tests/watch/lock.test.ts`

```ts
import { assertEquals, assertRejects, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { acquireWatchLock, isProcessRunning, } from "../../src/watch/lock.ts";

import type { WatchLockData, } from "../../src/tools/interfaces.ts";
describe("Watch Lock Mechanism", () => {
  it("isProcessRunning should identify current process as active", () => {
    assertEquals(isProcessRunning(Deno.pid,), true,);
  });

  it("isProcessRunning should return false for invalid or inactive PIDs", () => {
    assertEquals(isProcessRunning(-1,), false,);
    assertEquals(isProcessRunning(0,), false,);
    // PID 9999999 is unlikely to exist
    assertEquals(isProcessRunning(9999999,), false,);
  });

  it("acquireWatchLock should acquire lock and release it correctly", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const release = await acquireWatchLock(tempDir, "ui", lockPath,);

      // Lock should exist on disk
      const stat = await Deno.stat(lockPath,);
      assertEquals(stat.isFile, true,);

      const content = JSON.parse(
        await Deno.readTextFile(lockPath,),
      ) as WatchLockData;
      assertEquals(content.pid, Deno.pid,);
      assertEquals(content.target, "ui",);

      // Release lock
      await release();

      // Lock should have been removed
      let exists = true;
      try {
        await Deno.stat(lockPath,);
      } catch {
        exists = false;
      }
      assertEquals(exists, false,);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("acquireWatchLock should throw error if active lock exists for running process", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const release = await acquireWatchLock(tempDir, "ui", lockPath,);

      try {
        await assertRejects(
          async () => {
            await acquireWatchLock(tempDir, "sw", lockPath,);
          },
          Error,
          "A watch instance is already running",
        );
      } finally {
        await release();
      }
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("acquireWatchLock should discard orphan lock of dead process and proceed", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const lockPath = `${tempDir}/.buildit-watch.lock`;
      const orphanLock: WatchLockData = {
        pid: 9999999, // Inactive PID
        target: "old",
        startedAt: "2026-01-01T00:00:00.000Z",
        baseDir: tempDir,
      };
      await Deno.writeTextFile(lockPath, JSON.stringify(orphanLock,),);

      // Should replace orphan lock successfully
      const release = await acquireWatchLock(tempDir, "new", lockPath,);

      const content = JSON.parse(
        await Deno.readTextFile(lockPath,),
      ) as WatchLockData;
      assertEquals(content.pid, Deno.pid,);
      assertEquals(content.target, "new",);

      await release();
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

```

---

## File: `packages/utils/tests/watch/watch.test.ts`

```ts
import { assert, assertEquals, assertRejects, } from "@std/assert";
import { describe, it, } from "@std/testing/bdd";
import { join, } from "@std/path";
import {
  loadWatchConfig,
  WATCH_CONFIG_EXAMPLE,
} from "../../src/watch/config.ts";
import { watchEngine, } from "../../src/watch/engine.ts";
import { watchCli, } from "../../src/watch/cli.ts";
import type { WatchGlobalConfig, } from "../../src/tools/interfaces.ts";

describe("loadWatchConfig", () => {
  it("should return error when file is not found", async () => {
    await assertRejects(
      () =>
        loadWatchConfig(
          "non_existent_file.jsonc",
          "/tmp",
        ),
      Error,
      "not found",
    );
  });

  it("should load valid watch configuration from a temporary file", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      const configContent = JSON.stringify({
        targets: {
          app: {
            entryPoints: ["src/index.ts",],
            distdir: "dist",
            format: "esm",
            sourcemap: "inline",
          },
        },
      },);
      const configPath = `${tempDir}/watch.jsonc`;
      await Deno.writeTextFile(configPath, configContent,);

      const result = await loadWatchConfig(configPath, tempDir,);
      const app = result.targets["app"];
      assert(app !== undefined,);
      assertEquals(app.entryPoints, ["src/index.ts",],);
      assertEquals(app.format, "esm",);
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

describe("watchCli Argument Validation (Cliffy)", () => {
  it("Cliffy should reject when more than 1 positional argument is passed", async () => {
    const cli = watchCli().throwErrors();
    await assertRejects(
      async () => {
        await cli.parse(["ui", "sw",],);
      },
      Error,
      "Too many arguments: sw",
    );
  });
});

describe("watchEngine Target Restrictions and Lock", () => {
  it("should accept target as a single string", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true, },);
      await Deno.writeTextFile(
        `${tempDir}/src/main.ts`,
        "console.log('main');",
      );
      await Deno.writeTextFile(
        `${tempDir}/deno.jsonc`,
        JSON.stringify({ version: "0.1.0", },),
      );

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const handles = await watchEngine({
        config,
        target: "first",
        baseDir: tempDir,
        lockFile: `${tempDir}/.watch.lock`,
        silent: true,
      },);

      assertEquals(handles.length, 1,);
      assertEquals(handles[0]?.target, "first",);
      await handles[0]?.close();
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should reject if the requested target does not exist", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.writeTextFile(
        join(tempDir, "deno.jsonc",),
        JSON.stringify({ version: "1.0.0", },),
      );
      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      await assertRejects(
        async () => {
          await watchEngine({
            config,
            target: "non-existent",
            baseDir: tempDir,
            lockFile: `${tempDir}/.watch.lock`,
            silent: true,
          },);
        },
        Error,
        "Target 'non-existent' not found",
      );
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should select only the first target when no literal is provided and there are multiple default: true", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true, },);
      await Deno.writeTextFile(
        `${tempDir}/src/main.ts`,
        "console.log('main');",
      );
      await Deno.writeTextFile(
        `${tempDir}/src/other.ts`,
        "console.log('other');",
      );
      await Deno.writeTextFile(
        `${tempDir}/deno.jsonc`,
        JSON.stringify({ version: "0.1.0", },),
      );

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
        second: {
          default: true,
          entryPoints: ["other.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const handles = await watchEngine({
        config,
        baseDir: tempDir,
        lockFile: `${tempDir}/.watch.lock`,
        silent: true,
      },);

      assertEquals(handles.length, 1,);
      assertEquals(handles[0]?.target, "first",);

      // Close and clean lock
      await handles[0]?.close();
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });

  it("should prevent concurrency between simultaneous calls via Lock", async () => {
    const tempDir = await Deno.makeTempDir();
    try {
      await Deno.mkdir(`${tempDir}/src`, { recursive: true, },);
      await Deno.writeTextFile(
        `${tempDir}/src/main.ts`,
        "console.log('main');",
      );
      await Deno.writeTextFile(
        `${tempDir}/deno.jsonc`,
        JSON.stringify({ version: "0.1.0", },),
      );

      const config: WatchGlobalConfig = {
        first: {
          default: true,
          entryPoints: ["main.ts",],
          srcdir: `${tempDir}/src`,
          distdir: `${tempDir}/dist`,
        },
      };

      const lockPath = `${tempDir}/.watch.lock`;
      const handles = await watchEngine({
        config,
        target: "first",
        baseDir: tempDir,
        lockFile: lockPath,
        silent: true,
      },);

      try {
        await assertRejects(
          async () => {
            await watchEngine({
              config,
              target: "first",
              baseDir: tempDir,
              lockFile: lockPath,
              silent: true,
            },);
          },
          Error,
          "A watch instance is already running",
        );
      } finally {
        await handles[0]?.close();
      }
    } finally {
      await Deno.remove(tempDir, { recursive: true, },);
    }
  });
});

```

---

## File: `scripts/denobuild.jsonc`

```json
{
  "$schema": "./packages/utils/schema/denobuild.json",
  "versionPaths": [
    "packages/utils/src/version.ts",
    "packages/ui/src/version.ts"
  ],
  "forcepackagesversion": true,
  "targets": {
    "ui": {
      "mode": "build",
      "default": true,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "copyFiles": [
        {
          "basedir": "packages/ui/public"
        },
        {
          "basedir": "packages/ui/src",
          "includes": [
            "index.html"
          ]
        },
        {
          "basedir": "packages/utils/",
          "includes": [
            "schema/*.json"
          ]
        }
      ],
      "clean": {
        "includes": [
          "*"
        ]
      },
      "entryPoints": [
        "main.tsx"
      ],
      "platform": "browser",
      "format": "esm",
      "minify": false,
      "sourcemap": "linked",
      "keepNames": true,
      "codeSplitting": false,
      "packages": "bundle",
      "inlineImports": true
    }
  }
}

```

---

## File: `scripts/denobuild.ts`

```ts
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

/**
 * @file denobuild.ts
 * @description CLI runner for the build orchestrator based on native Deno.bundle (denobuild).
 * Delegates execution to the @vanaware/buildit library
 * and loads declarative configurations from denobuild.jsonc.
 */

import { denoBuildCli, } from "../packages/utils/src/denobuild/cli.ts";

if (import.meta.main) {
  const cli = denoBuildCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/esbuild.jsonc`

```json
{
  "$schema": "./packages/utils/schema/esbuild.json",
  "versionPaths": [
    "packages/utils/src/version.ts",
    "packages/ui/src/version.ts"
  ],
  "forcepackagesversion": true,
  "targets": {
    "ui": {
      "default": true,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "copyFiles": [
        {
          "basedir": "packages/ui/public"
        },
        {
          "basedir": "packages/ui/src",
          "includes": [
            "index.html"
          ]
        },
        {
          "basedir": "packages/utils/",
          "includes": [
            "schema/*.json"
          ]
        }
      ],
      "clean": {
        "includes": [
          "*"
        ]
      },
      "entryPoints": [
        "main.tsx"
      ],
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "minify": false,
      "sourcemap": "linked",
      "conditions": [
        "browser"
      ],
      "drop": [
        "debugger"
      ],
      "jsx": "automatic",
      "jsxImportSource": "preact",
      "metafile": true,
      "write": true,
      "legalComments": "eof",
      "keepNames": true,
      "splitting": false,
      "banner": {
        "js": "/*!\n * BuildIt v__APP_VERSION__\n * (c) 2026 Vanaware - MIT License\n */\n"
      }
    }
  }
}

```

---

## File: `scripts/esbuild.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file esbuild.ts
 * @description CLI runner for the native esbuild build orchestrator.
 * Delegates execution to the @vanaware/buildit library
 * and loads declarative configurations from esbuild.jsonc.
 */

import { esBuildCli, } from "../packages/utils/src/esbuild/cli.ts";

if (import.meta.main) {
  const cli = esBuildCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/export.jsonc`

```json
{
  "$schema": "./packages/utils/schema/export.json",
  "project": "BuildIt",
  "modes": {
    "ui": {
      "outputFile": "snapshots/ui.md",
      "includes": [
        "packages/ui/{src,public,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,manifest,json,jsonc,md}",
        "packages/ui/{build.ts,deno.json,deno.jsonc,readme.md}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "includeVersion": true,
      "customInstruction": "The text below contains the main SOURCE CODE files for the example application (UI).",
      "default": true
    },
    "docs": {
      "outputFile": "snapshots/docs.md",
      "includes": [
        "docs/**/*.{md,txt}",
        "{readme.md,readme,license,license.md,license.txt,.tool-versions}"
      ],
      "excludes": [],
      "includeVersion": false,
      "customInstruction": "The text below contains the DOCUMENTATION and architectural guidelines of the project.",
      "default": true
    },
    "server": {
      "outputFile": "snapshots/server.md",
      "includes": [
        "packages/server/{src,tests,docs}/**/*.{tsx,jsx,js,ts,css,html,json,jsonc,yaml,yml,md}",
        "packages/server/{deno.json,deno.jsonc,readme.md}",
        ".github/workflows/**/*.{yaml,yml}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "includeVersion": false,
      "customInstruction": "The text below contains the configuration and execution files for the SERVER @vanaware/server and CI/CD.",
      "default": true
    },
    "utils": {
      "outputFile": "snapshots/utils.md",
      "includes": [
        "packages/utils/{src,tests,docs}/**/*.{tsx,jsx,js,ts,json,jsonc,md}",
        "packages/utils/{deno.json,deno.jsonc,readme.md}",
        "scripts/*.{ts,jsonc,json}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "includeVersion": false,
      "customInstruction": "The text below contains the code and tests for the @vanaware/buildit library",
      "default": true
    }
  }
}

```

---

## File: `scripts/export.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file export.ts
 * @description CLI runner for AI context consolidation in the BuildIt project.
 * Delegates execution and rules to the @vanaware/buildit library
 * and loads declarative configurations from export.jsonc.
 */

import { exportCli, } from "../packages/utils/src/export/cli.ts";

if (import.meta.main) {
  const cli = exportCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/sanitize-version.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file sanitize-version.ts
 * @description CLI runner for semantic version sanitization in deno.json[c].
 * Normalizes the "version" field to strict semver format (MAJOR.MINOR.PATCH).
 */

import { sanitizeVersionCli, } from "../packages/utils/src/version/sanitize/cli.ts";

if (import.meta.main) {
  const cli = sanitizeVersionCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/tag-version.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file tag-version.ts
 * @description CLI runner for creating and publishing git tags based on deno.json[c] version.
 * Generates tags in vMAJOR.MINOR format and pushes to remote repository.
 */

import { tagVersionCli, } from "../packages/utils/src/version/tag/cli.ts";

if (import.meta.main) {
  const cli = tagVersionCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/watch.jsonc`

```json
{
  "$schema": "./packages/utils/schema/watch.json",
  "targets": {
    "ui": {
      "default": true,
      "srcdir": "packages/ui/src",
      "distdir": "packages/server/build/dist",
      "copyFiles": [
        {
          "basedir": "packages/ui/public"
        },
        {
          "basedir": "packages/ui/src",
          "includes": [
            "index.html"
          ]
        },
        {
          "basedir": "packages/utils/",
          "includes": [
            "schema/*.json"
          ]
        }
      ],
      "entryPoints": [
        "main.tsx"
      ],
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "minify": false,
      "sourcemap": "inline",
      "conditions": [
        "browser"
      ],
      "jsx": "automatic",
      "jsxImportSource": "preact",
      "write": true,
      "legalComments": "eof",
      "outfile": "main.js",
      "banner": {
        "js": "/*!\n * BuildIt v__APP_VERSION__ [DEV WATCH]\n * (c) 2026 Vanaware - MIT License\n */\n"
      }
    }
  }
}

```

---

## File: `scripts/watch.ts`

```ts
/**
 * BuildIt Watch CLI Entry Point.
 * Delegates execution to the @vanaware/buildit continuous watch utility.
 */
import { watchCli } from "../packages/utils/src/watch/cli.ts";

if (import.meta.main) {
  await watchCli().parse(Deno.args);
}

```

---

