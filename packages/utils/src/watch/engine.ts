/**
 * @module @vanaware/buildit/watch/engine
 * @description Motor de desenvolvimento contínuo (Watch) utilizando esbuild context e @deno/esbuild-plugin.
 */

import { join } from "@std/path";
import * as esbuild from "esbuild";
import { denoPlugin } from "@deno/esbuild-plugin";
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
} from "../tools/paths.ts";
import { readProjectVersion } from "../tools/version.ts";
import { validateTargetConfig } from "../tools/validate.ts";
import { acquireWatchLock } from "./lock.ts";

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
 * Inicializa o processo de desenvolvimento contínuo (Watch) para um único alvo.
 * Restringe estritamente a execução a 1 alvo por vez e impede instâncias simultâneas via lock.
 *
 * @param opcoes Opções de execução do watch
 * @returns Lista contendo o handle de controle para encerramento gracioso
 */
export async function watchEngine(
  opcoes: WatchOptions,
): Promise<WatchHandle[]> {
  const configs = opcoes.config;
  const baseDir = opcoes.baseDir ?? ".";
  const denoJsoncPath = opcoes.denoJsoncPath ?? join(baseDir, "deno.jsonc");
  const version = await readProjectVersion(denoJsoncPath, baseDir);

  // 1. Resolução do alvo solicitado (prioriza target singular ou primeiro elemento de targets)
  let requested = opcoes.target;
  if (!requested && opcoes.targets && opcoes.targets.length > 0) {
    if (opcoes.targets.length > 1) {
      throw new Error(
        `❌ O modo watch suporta apenas 1 alvo por execução. Foram fornecidos ${opcoes.targets.length}: ${
          opcoes.targets.join(", ")
        }.`,
      );
    }
    requested = opcoes.targets[0];
  }

  // 2. Resolução do alvo: se não for passado literal, executa apenas o primeiro default
  let targetName: string;
  const configKeys = Object.keys(configs);

  if (requested) {
    const matchingKey = configKeys.find(
      (k) => k.toLowerCase() === requested.toLowerCase(),
    );
    if (!matchingKey || !configs[matchingKey]) {
      throw new Error(
        `❌ Alvo '${requested}' não encontrado na configuração de watch. Alvos disponíveis: ${
          configKeys.join(", ")
        }.`,
      );
    }
    targetName = matchingKey;
  } else {
    // Se não for passado nenhum literal, busca o primeiro com default !== false
    const defaultTargets = configKeys.filter(
      (k) => configs[k]?.default !== false,
    );

    const firstDefault = defaultTargets[0];
    if (!firstDefault) {
      if (!opcoes.silencioso) {
        console.warn("⚠️ Nenhum alvo configurado para watch.");
      }
      return [];
    }

    targetName = firstDefault;
  }

  const targetConfig = configs[targetName];
  if (!targetConfig) {
    return [];
  }

  validateTargetConfig(targetName, targetConfig);

  // 3. Bloqueio de concorrência: adquire o lock para o watch
  const releaseLock = await acquireWatchLock(
    baseDir,
    targetName,
    opcoes.lockFile,
  );

  try {
    if (!opcoes.silencioso) {
      console.log(`\n👀 Iniciando Watch: ${targetName.toUpperCase()}`);
    }

    if (
      targetConfig.clean && targetConfig.clean.length > 0 &&
      targetConfig.distdir
    ) {
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

    return [handle];
  } catch (error) {
    await releaseLock();
    throw error;
  }
}
