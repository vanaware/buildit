/**
 * @module @vanaware/buildit/watch/engine
 * @description Motor de desenvolvimento contínuo (Watch) utilizando esbuild context e @deno/esbuild-plugin.
 */

import { join } from "@std/path";
import * as esbuild from "esbuild";
import { denoPlugin } from "@deno/esbuild-plugin";
import type {
  WatchGlobalConfig,
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
} from "../tools/paths.ts";
import { readProjectVersion } from "../tools/version.ts";
import { resolverOrdemTargets } from "../tools/targets.ts";
import { validateTargetConfig } from "../tools/validate.ts";

/**
 * Constrói as opções do esbuild específicas para monitoramento contínuo.
 */
export async function buildWatchEsbuildOptions(
  targetName: string,
  config: WatchTargetConfig,
  appVersion: string,
  listAssetsFn?: (distDir: string) => Promise<string[]>,
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  const finalDefine: Record<string, string> = {
    ...config.define,
    __APP_VERSION__: JSON.stringify(`v${appVersion}`),
  };

  if (targetName === "sw" && listAssetsFn && config.distdir) {
    const assets = await listAssetsFn(config.distdir);
    finalDefine["__GENERATED_ASSETS__"] = JSON.stringify(assets);
  }

  const resolvedEntryPoints = resolveEntryPoints(
    config.srcdir,
    config.entryPoints,
  );

  const { outfile, outdir } = resolveOutputPaths(config);

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
      banner.js = config.banner.js.replace(/__APP_VERSION__/g, appVersion);
    }
    if (config.banner.css !== undefined) {
      banner.css = config.banner.css.replace(/__APP_VERSION__/g, appVersion);
    }
    if (banner.js !== undefined || banner.css !== undefined) {
      options.banner = banner;
    }
  }

  if (config.footer !== undefined) {
    const footer: { js?: string; css?: string } = {};
    if (config.footer.js !== undefined) {
      footer.js = config.footer.js.replace(/__APP_VERSION__/g, appVersion);
    }
    if (config.footer.css !== undefined) {
      footer.css = config.footer.css.replace(/__APP_VERSION__/g, appVersion);
    }
    if (footer.js !== undefined || footer.css !== undefined) {
      options.footer = footer;
    }
  }

  options.define = finalDefine;
  return options;
}

/**
 * Inicializa o processo de desenvolvimento contínuo (Watch) para os alvos configurados.
 *
 * @param opcoes Opções de execução do watch
 * @returns Lista de handles de controle para encerramento gracioso
 */
export async function watchEngine(
  opcoes: WatchOptions,
): Promise<WatchHandle[]> {
  const configs = opcoes.config;
  const baseDir = opcoes.baseDir ?? ".";
  const denoJsoncPath = opcoes.denoJsoncPath ?? join(baseDir, "deno.jsonc");
  const version = await readProjectVersion(denoJsoncPath, baseDir);

  const targetsParaExecutar = resolverOrdemTargets(configs, opcoes.targets);

  if (targetsParaExecutar.length === 0) {
    if (!opcoes.silencioso) {
      console.warn("⚠️ Nenhum alvo selecionado para watch.");
    }
    return [];
  }

  const handles: WatchHandle[] = [];

  for (const targetName of targetsParaExecutar) {
    const targetConfig = configs[targetName];
    if (!targetConfig) continue;

    validateTargetConfig(targetName, targetConfig);

    if (!opcoes.silencioso) {
      console.log(`\n👀 Iniciando Watch: ${targetName.toUpperCase()}`);
    }

    if (targetConfig.clean && targetConfig.clean.length > 0 && targetConfig.distdir) {
      await cleanTarget(targetConfig.distdir, targetConfig.clean);
    }

    await copyStaticFiles(targetConfig, version);

    const esbuildOptions = await buildWatchEsbuildOptions(
      targetName,
      targetConfig,
      version,
      listAssetsForCache,
    );

    esbuildOptions.plugins = [
      ...(esbuildOptions.plugins || []),
      denoPlugin({ configPath: denoJsoncPath }),
    ];

    const ctx = await esbuild.context(esbuildOptions);
    await ctx.watch();

    if (!opcoes.silencioso) {
      console.log(`✅ [${targetName}] Monitorando alterações em tempo real...`);
      const resolvedOutfile = esbuildOptions.outfile ||
        (targetConfig.distdir ? `${targetConfig.distdir}/` : "disco");
      console.log(`📦 Saída: ${resolvedOutfile}`);
    }

    handles.push({
      target: targetName,
      close: async () => {
        await ctx.dispose();
      },
    });
  }

  return handles;
}
