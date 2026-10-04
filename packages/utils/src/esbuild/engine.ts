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
