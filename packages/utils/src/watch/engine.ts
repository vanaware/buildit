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
